import os
import re
import json
import asyncio
from datetime import datetime, timedelta, date
from typing import List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app import models, schemas, auth
from app.database import get_db

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Prioritize gemini-3.5-flash-lite (high limits, super fast, active) followed by 3.5-flash, 2.5-flash, 2.5-pro
MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
]

# In-memory tracking of models that hit quota limits: model -> epoch timestamp
EXHAUSTED_UNTIL = {}


def extract_json(text: str):
    if not text or not text.strip():
        raise ValueError("Empty response from AI")
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        pass
    match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', cleaned)
    if match:
        block = match.group(1)
        try:
            return json.loads(block, strict=False)
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Could not parse valid JSON from AI response: {text[:150]}")


async def call_gemini(prompt: str, system_instruction: str = "", is_json: bool = False) -> str:
    key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on the backend server."
        )

    last_error = None
    gen_config = {
        "temperature": 0.4 if is_json else 0.7,
        "maxOutputTokens": 8192,
    }
    if is_json:
        gen_config["responseMimeType"] = "application/json"

    now = datetime.now().timestamp()
    models_to_try = [m for m in MODELS if EXHAUSTED_UNTIL.get(m, 0) < now]
    if not models_to_try:
        models_to_try = list(MODELS)

    async with httpx.AsyncClient(timeout=45.0) as client:
        for model in models_to_try:
            for attempt in range(2):
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                    payload = {
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": gen_config,
                    }
                    if system_instruction:
                        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            content_parts = candidates[0].get("content", {}).get("parts", [])
                            if content_parts and "text" in content_parts[0]:
                                return content_parts[0]["text"]
                    elif resp.status_code in (429, 503):
                        err_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                        err_msg = err_json.get("error", {}).get("message", f"HTTP {resp.status_code}")
                        last_error = f"{model}: {err_msg}"
                        # If a daily quota is reached, cool down this model for 30 minutes so other requests bypass it immediately
                        if "quota" in err_msg.lower() or "resource_exhausted" in resp.text.lower() or "limit" in err_msg.lower():
                            EXHAUSTED_UNTIL[model] = datetime.now().timestamp() + 1800
                            break
                        await asyncio.sleep(1.0)
                        continue
                    else:
                        err_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                        err_msg = err_json.get("error", {}).get("message", f"HTTP {resp.status_code}: {resp.text[:150]}")
                        last_error = f"{model}: {err_msg}"
                        break
                except Exception as e:
                    last_error = f"{model}: {str(e)}"
                    break

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Failed to communicate with AI model: {last_error}"
    )


# ── Request Schemas ──────────────────────────────────────────────────────────

class SchedulePlanRequest(BaseModel):
    subject: str
    exam_date: str               # "YYYY-MM-DD"
    start_date: Optional[str] = None  # "YYYY-MM-DD", defaults to today
    daily_hours: float = 2.0


class BreakdownRequest(BaseModel):
    prompt: str


class ExplainRequest(BaseModel):
    concept: str


class FlashcardRequest(BaseModel):
    topic: Optional[str] = ""
    difficulty: str = "Medium"
    count: int = 8
    notes: Optional[str] = None


class McqRequest(BaseModel):
    topic: Optional[str] = ""
    difficulty: str = "Medium"
    count: int = 8
    notes: Optional[str] = None


class CopilotHistoryItem(BaseModel):
    role: str
    content: str


class CopilotRequest(BaseModel):
    message: str
    history: Optional[List[CopilotHistoryItem]] = []
    context: Optional[str] = None


class BatchTaskItem(BaseModel):
    title: Optional[str] = "Untitled Study Task"
    description: Optional[str] = ""
    subject: Optional[str] = ""
    category: Optional[str] = "Class"
    priority: Optional[str] = "Medium"
    effort: Optional[str] = "Medium"
    due_date: Optional[str] = None
    date: Optional[str] = None


class BatchTaskRequest(BaseModel):
    tasks: List[BatchTaskItem]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/schedule")
async def generate_schedule(req: SchedulePlanRequest):
    subject = req.subject.strip()
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required.")

    # Parse start and exam dates
    today_date = date.today()
    if req.start_date:
        try:
            start_d = datetime.strptime(req.start_date, "%Y-%m-%d").date()
        except ValueError:
            start_d = today_date
    else:
        start_d = today_date

    try:
        exam_d = datetime.strptime(req.exam_date, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        # Default to 7 days from start if invalid
        exam_d = start_d + timedelta(days=7)

    if exam_d < start_d:
        raise HTTPException(status_code=400, detail="Exam date cannot be earlier than the start date.")

    # Calculate preparation days
    delta_days = (exam_d - start_d).days
    # If same day (0 prep days), treat as 1 day review
    prep_days_count = max(1, delta_days)

    # Generate dates list
    prep_dates = []
    for i in range(prep_days_count):
        d = start_d + timedelta(days=i)
        prep_dates.append(d.strftime("%Y-%m-%d"))

    exam_date_str = exam_d.strftime("%Y-%m-%d")

    prompt = f"""
You are an expert academic advisor and student productivity planner.
Create a structured exam preparation schedule for "{subject}".

Parameters:
- Today/Start Date: {start_d.strftime("%Y-%m-%d")}
- Target Exam Date: {exam_date_str}
- Total Preparation Days: {len(prep_dates)} day(s) ({', '.join(prep_dates)})
- Available Daily Study Time: {req.daily_hours} hours/day

Return a strictly valid JSON object with the following schema:
{{
  "summary": "Clear, beautifully formatted markdown text with headings (###), bullet points, milestones, break strategies, and top 3 exam tips.",
  "daily_tasks": [
    {{
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "title": "Concise task title for this day (e.g. Day 1: Subject Core Foundations)",
      "description": "Specific study topics, chapters, practice problem goals to complete today. (Target: {req.daily_hours} hrs)",
      "category": "Class",
      "priority": "Medium",
      "effort": "Medium"
    }}
  ],
  "exam_task": {{
    "title": "EXAM: {subject}",
    "description": "Final Exam day for {subject}. Stay calm, review high-yield notes, and give your best!",
    "date": "{exam_date_str}",
    "category": "Exam",
    "priority": "High",
    "effort": "High"
  }}
}}

Ensure "daily_tasks" has exactly {len(prep_dates)} items corresponding to the dates: {json.dumps(prep_dates)}.
Return ONLY the JSON object with no extra text or markdown formatting.
"""

    raw_response = await call_gemini(prompt, "You are a specialized study planner JSON generator.", is_json=True)
    parsed = extract_json(raw_response)

    # Validate and normalize daily tasks
    daily_tasks = []
    raw_daily = parsed.get("daily_tasks", [])

    for i, p_date in enumerate(prep_dates):
        item = raw_daily[i] if i < len(raw_daily) else {}
        daily_tasks.append({
            "title": item.get("title") or f"Day {i+1} Study: {subject}",
            "description": item.get("description") or f"Review key concepts and complete practice problems ({req.daily_hours} hrs)",
            "subject": subject,
            "category": "Class",
            "priority": item.get("priority") or ("High" if i == len(prep_dates) - 1 else "Medium"),
            "effort": item.get("effort") or "Medium",
            "date": p_date,
            "due_date": f"{p_date}T12:00:00",
        })

    exam_task_data = parsed.get("exam_task", {})
    exam_task = {
        "title": exam_task_data.get("title") or f"EXAM: {subject}",
        "description": exam_task_data.get("description") or f"Target exam date for {subject}.",
        "subject": subject,
        "category": "Exam",
        "priority": "High",
        "effort": "High",
        "date": exam_date_str,
        "due_date": f"{exam_date_str}T09:00:00",
    }

    return {
        "summary": parsed.get("summary") or "Roadmap generated successfully.",
        "start_date": start_d.strftime("%Y-%m-%d"),
        "exam_date": exam_date_str,
        "total_prep_days": len(prep_dates),
        "daily_tasks": daily_tasks,
        "exam_task": exam_task,
        "all_tasks": daily_tasks + [exam_task],
    }


@router.post("/breakdown")
async def task_breakdown(req: BreakdownRequest):
    prompt_text = req.prompt.strip()
    if not prompt_text:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    prompt = f"""
You are an academic project planner. Break down the following assignment or project into 4 to 6 chronological, actionable subtasks:
"{prompt_text}"

Return a strictly valid JSON object in this format:
{{
  "summary": "Concise structured markdown text presenting the complete breakdown overview with timelines.",
  "tasks": [
    {{
      "title": "Subtask title",
      "description": "Actionable explanation of what to do",
      "priority": "Medium",
      "effort": "Medium"
    }}
  ]
}}
Return ONLY the JSON object.
"""
    raw_response = await call_gemini(prompt, "You are an expert task decomposer JSON generator.", is_json=True)
    return extract_json(raw_response)


@router.post("/explain")
async def explain_concept(req: ExplainRequest):
    concept = req.concept.strip()
    if not concept:
        raise HTTPException(status_code=400, detail="Concept is required.")

    prompt = f"""
Explain the following topic or concept clearly and engagingly for a student:
"{concept}"

Structure your response with:
- ## 🌟 Overview & Core Idea (2-3 sentences)
- ## 💡 Intuitive Analogy / Real-World Example
- ## 🔑 Key Definitions & Mechanisms (with bullet points)
- ## ⚠️ Common Pitfalls & Mistakes to Avoid
- ## 📝 Quick Summary / Takeaway

Use clear markdown formatting with bold terms and spacing.
"""
    text = await call_gemini(prompt, "You are a clear and lucid science and humanities educator.", is_json=False)
    return {"explanation": text.strip()}


@router.post("/flashcards")
async def generate_flashcards_endpoint(req: FlashcardRequest):
    topic = (req.topic or "").strip()
    notes = (req.notes or "").strip()
    if not topic and not notes:
        raise HTTPException(status_code=400, detail="Topic or Notes is required.")

    if not topic:
        topic = "Notes / Course Material"

    if notes:
        prompt = f"""
Generate exactly {req.count} high-yield study flashcards based DIRECTLY on the provided course notes, lecture slides, or syllabus.
Difficulty level: {req.difficulty}.
Context / Subject: "{topic}"

COURSE MATERIAL / NOTES:
\"\"\"
{notes[:12000]}
\"\"\"

Requirements:
- Ground questions and answers strictly in the provided notes.
- Focus on definitions, core concepts, formulas, and key facts.
- Return ONLY a valid JSON array of objects with no markdown fences, no conversational preamble:
[
  {{
    "front": "Active recall question or concept prompt directly from the notes",
    "back": "Clear, precise answer according to the notes (max 2 sentences)"
  }}
]
"""
    else:
        prompt = f"""
Generate exactly {req.count} high-yield study flashcards for "{topic}".
Difficulty level: {req.difficulty}.

Return ONLY a valid JSON array of objects with no markdown fences, no conversational preamble:
[
  {{
    "front": "Clear question or active recall prompt",
    "back": "Concise, precise answer (max 2 sentences)"
  }}
]
"""
    raw = await call_gemini(prompt, "You are a study flashcard JSON generator.", is_json=True)
    parsed = extract_json(raw)
    if not isinstance(parsed, list):
        raise HTTPException(status_code=500, detail="Model did not return a valid list of flashcards.")

    formatted = [
        {
            "id": int(datetime.now().timestamp() * 1000) + idx,
            "front": item.get("front", "Question"),
            "back": item.get("back", "Answer"),
            "interval": 0,
            "repetition": 0,
            "easeFactor": 2.5,
            "dueDate": datetime.now().isoformat(),
        }
        for idx, item in enumerate(parsed)
    ]
    return {"cards": formatted}


@router.post("/mcqs")
async def generate_mcqs_endpoint(req: McqRequest):
    topic = (req.topic or "").strip()
    notes = (req.notes or "").strip()
    if not topic and not notes:
        raise HTTPException(status_code=400, detail="Topic or Notes is required.")

    if not topic:
        topic = "Notes / Course Material"

    if notes:
        prompt = f"""
Generate exactly {req.count} multiple choice questions (MCQs) based DIRECTLY on the provided course notes, lecture slides, or syllabus.
Difficulty level: {req.difficulty}.
Context / Subject: "{topic}"

COURSE MATERIAL / NOTES:
\"\"\"
{notes[:12000]}
\"\"\"

Each question must be directly testable against the notes and contain:
- "question": Question string
- "options": Array of 4 plausible choices
- "correct": 0-based integer index of the correct option (0 for A, 1 for B, 2 for C, 3 for D)
- "explanation": 1-2 sentence explanation citing the reason from the material.

Return ONLY a valid JSON array of objects in this exact format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Explanation here."
  }}
]
"""
    else:
        prompt = f"""
Generate exactly {req.count} multiple choice questions (MCQs) for "{topic}".
Difficulty level: {req.difficulty}.

Each question must contain:
- "question": Question string
- "options": Array of 4 plausible choices
- "correct": 0-based integer index of the correct option (0 for A, 1 for B, 2 for C, 3 for D)
- "explanation": 1-2 sentence explanation of why the correct choice is right.

Return ONLY a valid JSON array of objects in this exact format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Explanation here."
  }}
]
"""
    raw = await call_gemini(prompt, "You are an exam MCQ JSON generator.", is_json=True)
    parsed = extract_json(raw)
    if not isinstance(parsed, list):
        raise HTTPException(status_code=500, detail="Model did not return a valid list of MCQs.")

    formatted = []
    for idx, q in enumerate(parsed):
        opts = q.get("options", ["A", "B", "C", "D"])
        if not isinstance(opts, list) or len(opts) != 4:
            opts = ["Option A", "Option B", "Option C", "Option D"]

        correct_val = q.get("correct", 0)
        if isinstance(correct_val, str):
            map_dict = {"A": 0, "B": 1, "C": 2, "D": 3}
            correct_idx = map_dict.get(correct_val.strip().upper(), 0)
        else:
            try:
                correct_idx = int(correct_val)
            except (ValueError, TypeError):
                correct_idx = 0

        formatted.append({
            "id": int(datetime.now().timestamp() * 1000) + idx,
            "question": q.get("question", f"Question {idx+1}"),
            "options": [str(o) for o in opts],
            "correct": max(0, min(correct_idx, 3)),
            "explanation": q.get("explanation", "Correct choice explanation."),
        })

    return {"questions": formatted}


@router.post("/copilot")
async def copilot_chat(req: CopilotRequest):
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message is required.")

    system_instruction = (
        "You are the FocusNest Floating AI Study Copilot, an ultra-helpful, concise, and encouraging academic tutor. "
        "Students consult you while studying, doing practice tests, reviewing flashcards, or managing deadlines. "
        "Keep your explanations clear, structured, and easy to read with bullet points, bold key terms, simple analogies, "
        "or memorable mnemonics when asked. Be concise and direct without overwhelming fluff."
    )
    if req.context:
        system_instruction += f"\nCurrent student context/page: {req.context}"

    formatted_history = []
    if req.history:
        for item in req.history[-6:]:
            role_label = "Student" if item.role == "user" else "Tutor"
            formatted_history.append(f"{role_label}: {item.content}")

    if formatted_history:
        history_str = "\n".join(formatted_history)
        full_prompt = f"Previous conversation:\n{history_str}\n\nStudent: {msg}\n\nTutor:"
    else:
        full_prompt = msg

    reply = await call_gemini(full_prompt, system_instruction=system_instruction, is_json=False)
    return {"reply": reply.strip()}


@router.post("/batch-add-tasks", status_code=status.HTTP_201_CREATED)
def batch_add_tasks(
    req: BatchTaskRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    created_tasks = []
    try:
        for item in req.tasks:
            raw_title = str(item.title or "").strip() or "Untitled Study Task"
            raw_desc = str(item.description or "").strip()
            raw_subj = str(item.subject or "").strip()

            raw_date = item.due_date or item.date or ""
            parsed_date = datetime.now()
            if raw_date:
                try:
                    date_str = str(raw_date).strip()
                    if "T" in date_str:
                        parsed_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    elif " " in date_str and len(date_str) >= 19:
                        parsed_date = datetime.strptime(date_str[:19], "%Y-%m-%d %H:%M:%S")
                    else:
                        parsed_date = datetime.strptime(date_str[:10], "%Y-%m-%d")
                except Exception:
                    parsed_date = datetime.now()

            cat = models.to_category_enum(item.category)
            prio = models.to_priority_enum(item.priority)
            eff = models.to_effort_enum(item.effort)

            task = models.Task(
                title=raw_title,
                description=raw_desc,
                subject=raw_subj,
                category=cat,
                priority=prio,
                effort=eff,
                due_date=parsed_date,
                status=models.StatusEnum.Todo,
                owner_id=current_user.id,
            )
            db.add(task)
            created_tasks.append(task)

        db.commit()
        for t in created_tasks:
            db.refresh(t)

        return {"message": f"Successfully created {len(created_tasks)} tasks", "count": len(created_tasks)}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to batch add tasks: {str(e)}"
        )


# ── Request schema for topic validation ─────────────────────────────────────

class ValidateTopicRequest(BaseModel):
    topic: str


@router.post("/validate-topic")
async def validate_topic(req: ValidateTopicRequest):
    """
    Validates whether a user-submitted topic is meaningful enough to generate
    study material for without wasting unnecessary LLM quota.
    """
    topic = req.topic.strip()
    if not topic:
        return {"status": "invalid", "message": "Please enter a topic to study.", "options": []}

    # Instant heuristic checks to prevent wasting LLM calls on pure numbers or single letters
    cleaned = re.sub(r"[^\w\s]", "", topic).strip()
    if len(cleaned) < 2 or cleaned.isdigit():
        return {
            "status": "invalid",
            "message": "That doesn't seem like a valid study topic. Please enter something like 'Photosynthesis', 'World War 2', or 'Data Structures'.",
            "options": []
        }

    # Known ambiguous single terms with instant disambiguation options (0 API calls)
    AMBIGUOUS_MAP = {
        "cell": ["Biology: Animal & Plant Cell Biology", "Technology: Cellular Networks & Telecom", "Physics: Fuel & Electrochemical Cells"],
        "current": ["Physics: Electric Current & Circuits", "Geography: Ocean Currents & Climate", "Finance: Current Assets & Currency"],
        "wave": ["Physics: Sound & Electromagnetic Waves", "Earth Science: Ocean Waves & Tsunami", "Math: Sine & Cosine Wave Functions"],
        "force": ["Physics: Newtonian Mechanics & Dynamics", "Earth Science: Plate Tectonics & Geological Forces", "History: Military Air/Ground Forces"],
        "plant": ["Biology: Plant Anatomy & Photosynthesis", "Engineering: Power Plants & Manufacturing", "Botany: Classification of Flora"],
        "focus": ["Psychology: Cognitive Focus & Attention", "Optics: Focal Points & Lenses", "Photography: Camera Aperture & Depth of Field"],
    }
    lower_t = topic.lower().strip()
    if lower_t in AMBIGUOUS_MAP:
        return {
            "status": "ambiguous",
            "message": f"'{topic}' can refer to several subjects. Please select an area to focus on:",
            "options": AMBIGUOUS_MAP[lower_t]
        }

    # For standard study topics, immediately validate without consuming an LLM call!
    return {"status": "valid", "message": "", "options": []}
