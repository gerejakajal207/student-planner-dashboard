import os
import re
import json
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

MODELS = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite",
]


def extract_json(text: str):
    cleaned = re.sub(r"```json|```", "", text).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', cleaned)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Could not parse valid JSON from AI response: {text[:150]}")


async def call_gemini(prompt: str, system_instruction: str = "") -> str:
    key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on the backend server."
        )

    last_error = None
    async with httpx.AsyncClient(timeout=35.0) as client:
        for model in MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
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
                else:
                    err_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                    err_msg = err_json.get("error", {}).get("message", f"HTTP {resp.status_code}: {resp.text}")
                    last_error = err_msg
            except Exception as e:
                last_error = str(e)

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
    topic: str
    difficulty: str = "Medium"
    count: int = 8


class McqRequest(BaseModel):
    topic: str
    difficulty: str = "Medium"
    count: int = 8


class BatchTaskItem(BaseModel):
    title: str
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

    raw_response = await call_gemini(prompt, "You are a specialized study planner JSON generator.")
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
    raw_response = await call_gemini(prompt, "You are an expert task decomposer JSON generator.")
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
    text = await call_gemini(prompt, "You are a clear and lucid science and humanities educator.")
    return {"explanation": text.strip()}


@router.post("/flashcards")
async def generate_flashcards_endpoint(req: FlashcardRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required.")

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
    raw = await call_gemini(prompt, "You are a study flashcard JSON generator.")
    parsed = extract_json(raw)
    if not isinstance(parsed, list):
        raise HTTPException(status_code=500, detail="Model did not return a valid list of flashcards.")

    formatted = [
        {
            "id": int(datetime.now().timestamp() * 1000) + idx,
            "front": item.get("front", "Question"),
            "back": item.get("back", "Answer"),
        }
        for idx, item in enumerate(parsed)
    ]
    return {"cards": formatted}


@router.post("/mcqs")
async def generate_mcqs_endpoint(req: McqRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required.")

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
    raw = await call_gemini(prompt, "You are an exam MCQ JSON generator.")
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


@router.post("/batch-add-tasks", status_code=status.HTTP_201_CREATED)
def batch_add_tasks(
    req: BatchTaskRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    created_tasks = []
    for item in req.tasks:
        raw_date = item.due_date or item.date or ""
        parsed_date = datetime.now()
        if raw_date:
            try:
                date_str = str(raw_date).strip()
                if "T" in date_str:
                    parsed_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                else:
                    parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
            except Exception:
                parsed_date = datetime.now()

        cat = models.to_category_enum(item.category)
        prio = models.to_priority_enum(item.priority)
        eff = models.to_effort_enum(item.effort)

        task = models.Task(
            title=item.title,
            description=item.description or "",
            subject=item.subject or "",
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


# ── Request schema for topic validation ─────────────────────────────────────

class ValidateTopicRequest(BaseModel):
    topic: str


@router.post("/validate-topic")
async def validate_topic(req: ValidateTopicRequest):
    """
    Validates whether a user-submitted topic is meaningful enough to generate
    study material for. Returns one of three statuses:
      - "valid"     → topic is clear and specific, proceed to generation
      - "ambiguous" → topic could mean different things; ask user to clarify
      - "invalid"   → gibberish, too vague, or not a study topic
    """
    topic = req.topic.strip()
    if not topic:
        return {"status": "invalid", "message": "Please enter a topic to study.", "options": []}

    prompt = f"""
A user wants to study about: "{topic}"

Analyze this topic and respond ONLY with a JSON object in one of these formats:

1. If the topic is meaningless, gibberish, or too vague to study (like "123", "asdf", "xyz", "stuff"):
{{"status": "invalid", "message": "That doesn't seem like a valid study topic. Could you enter something like 'Photosynthesis', 'World War 2', or 'Python programming'?"}}

2. If the topic is ambiguous and could belong to multiple very different fields (like "focus", "wave", "force", "cell", "current"):
{{"status": "ambiguous", "message": "brief friendly message asking to clarify", "options": ["Field 1: specific meaning", "Field 2: specific meaning", "Field 3: specific meaning"]}}

3. If the topic is clear and specific enough to generate study material:
{{"status": "valid", "message": ""}}

Return ONLY the JSON object, no extra text.
"""
    try:
        raw = await call_gemini(prompt, "You are a topic relevance classifier. Always return valid JSON only.")
        result = extract_json(raw)
        return {
            "status":  result.get("status", "valid"),
            "message": result.get("message", ""),
            "options": result.get("options", []),
        }
    except Exception:
        # If validation itself fails, let the request through rather than blocking the user
        return {"status": "valid", "message": "", "options": []}
