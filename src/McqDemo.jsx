import { useState } from "react";

function parseQuestions(text) {
  const questions = [];
  const blocks = text.split(/\n(?=\d+[\.\)])/g).filter(Boolean);
  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    if (!lines.length) continue;
    const questionLine = lines[0].replace(/^\d+[\.\)]\s*/, "").trim();
    const options = {};
    let correctAnswer = null;
    for (const line of lines.slice(1)) {
      const match = line.match(/^([A-D])[\.\)]\s*(.+)/);
      if (match) options[match[1]] = match[2].trim();
      const ansMatch = line.match(/answer[:\s]+([A-D])/i);
      if (ansMatch) correctAnswer = ansMatch[1];
    }
    if (questionLine && Object.keys(options).length === 4) {
      questions.push({ question: questionLine, options, correctAnswer });
    }
  }
  return questions;
}

const TOPICS = ["Data Structures", "Machine Learning", "World History", "Human Biology", "Calculus", "Physics"];

function TopicInput({ onGenerate, dark }) {
  const [topic, setTopic] = useState("");

  const d = dark;

  return (
    <div className="w-full max-w-2xl">
      {/* Hero header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 ${d ? "bg-blue-900/50 text-blue-300 border border-blue-700" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
          AI-Powered Learning
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold mb-3 leading-tight ${d ? "text-white" : "text-slate-900"}`}>
          Test Your Knowledge<br />
          <span className="text-blue-600">Instantly</span>
        </h1>
        <p className={`text-sm sm:text-base max-w-md mx-auto ${d ? "text-slate-400" : "text-slate-500"}`}>
          Enter any topic and get 5 smart multiple choice questions for active recall practice.
        </p>
      </div>

      {/* Main card */}
      <div className={`rounded-2xl border shadow-lg p-6 sm:p-8 mb-5 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <label className={`block text-sm font-bold mb-2 ${d ? "text-slate-200" : "text-slate-700"}`}>Enter a Topic</label>
        <div className="flex gap-3">
          <input
            className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${
              d ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
            }`}
            placeholder="e.g., Quantum Physics, French Revolution…"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && topic.trim() && onGenerate(topic.trim())}
          />
          <button
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 whitespace-nowrap"
            onClick={() => topic.trim() && onGenerate(topic.trim())}
            disabled={!topic.trim()}
          >
            Generate →
          </button>
        </div>

        {/* Quick picks */}
        <div className="mt-4">
          <p className={`text-xs font-semibold mb-2 ${d ? "text-slate-500" : "text-slate-400"}`}>QUICK PICKS</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => onGenerate(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
                  d ? "bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "⚡", label: "Instant", sub: "Questions" },
          { icon: "🧠", label: "Active", sub: "Recall" },
          { icon: "📊", label: "Scored", sub: "Results" },
        ].map(({ icon, label, sub }) => (
          <div key={label} className={`rounded-xl border p-3 sm:p-4 text-center ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className="text-xl sm:text-2xl mb-1">{icon}</div>
            <div className={`text-xs sm:text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{label}</div>
            <div className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner({ dark }) {
  const d = dark;
  return (
    <div className="w-full max-w-2xl">
      <div className={`rounded-2xl border shadow-lg p-10 flex flex-col items-center gap-5 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="relative">
          <div className={`w-16 h-16 rounded-full border-4 border-t-blue-600 animate-spin ${d ? "border-slate-600" : "border-blue-100"}`} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
        </div>
        <div className="text-center">
          <p className={`font-bold text-base ${d ? "text-white" : "text-slate-800"}`}>Crafting your questions…</p>
          <p className={`text-sm mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>AI is generating 5 tailored MCQs for you</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizCard({ questions, onRestart, dark }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const d = dark;

  const q = questions[current];
  const total = questions.length;

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === q.correctAnswer;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { selected, correct, correctAnswer: q.correctAnswer }]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (current + 1 >= total) { setFinished(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setSubmitted(false);
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚";
    const scoreColor = pct >= 80 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-red-500";
    const scoreLabel = pct >= 80 ? "Excellent!" : pct >= 50 ? "Good Job!" : "Keep Practicing!";
    const scoreBg = pct >= 80
      ? d ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"
      : pct >= 50
      ? d ? "bg-amber-900/30 border-amber-700" : "bg-amber-50 border-amber-200"
      : d ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200";

    return (
      <div className="w-full max-w-2xl">
        {/* Score hero */}
        <div className={`rounded-2xl border shadow-lg p-6 sm:p-8 mb-4 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
            <div className={`rounded-2xl border p-5 flex flex-col items-center min-w-[120px] ${scoreBg}`}>
              <div className="text-4xl mb-1">{emoji}</div>
              <div className={`text-4xl font-extrabold ${scoreColor}`}>{pct}%</div>
              <div className={`text-xs font-semibold mt-1 ${scoreColor}`}>{scoreLabel}</div>
            </div>
            <div className="flex-1 w-full">
              <h2 className={`text-xl font-extrabold mb-1 ${d ? "text-white" : "text-slate-800"}`}>Quiz Complete!</h2>
              <p className={`text-sm mb-4 ${d ? "text-slate-400" : "text-slate-500"}`}>You scored {score} out of {total} questions</p>
              <div className="flex gap-2">
                {Array.from({ length: total }, (_, i) => (
                  <div key={i} className={`flex-1 h-3 rounded-full ${answers[i]?.correct ? "bg-green-500" : "bg-red-400"}`} />
                ))}
              </div>
              <div className={`flex justify-between text-xs mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>
                <span>{score} correct</span><span>{total - score} wrong</span>
              </div>
            </div>
          </div>

          <button
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/25"
            onClick={onRestart}
          >
            ↺ Try Another Topic
          </button>
        </div>

        {/* Review */}
        <div className={`rounded-2xl border shadow-lg p-5 sm:p-6 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h3 className={`text-sm font-bold mb-4 ${d ? "text-slate-300" : "text-slate-600"}`}>QUESTION REVIEW</h3>
          <div className="flex flex-col gap-3">
            {questions.map((qq, i) => {
              const ans = answers[i];
              return (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  ans?.correct
                    ? d ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                    : d ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${ans?.correct ? "bg-green-500 text-white" : "bg-red-400 text-white"}`}>
                    {ans?.correct ? "✓" : "✗"}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{qq.question}</p>
                    {!ans?.correct && ans?.correctAnswer && (
                      <p className="text-xs text-green-500 mt-1 font-medium">
                        ✓ Correct: {ans.correctAnswer}. {qq.options[ans.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const getOptionClass = (key) => {
    if (!submitted) {
      if (selected === key) return d ? "bg-blue-900/50 border-blue-500 text-blue-200" : "bg-blue-50 border-blue-500 text-blue-800";
      return d
        ? "bg-slate-750 border-slate-600 text-slate-200 hover:border-blue-500 hover:bg-blue-900/20"
        : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/60";
    }
    if (key === q.correctAnswer) return d ? "bg-green-900/40 border-green-500 text-green-200" : "bg-green-50 border-green-500 text-green-800";
    if (key === selected) return d ? "bg-red-900/40 border-red-500 text-red-200" : "bg-red-50 border-red-400 text-red-700";
    return d ? "bg-slate-700/50 border-slate-600 text-slate-500 opacity-60" : "bg-white border-slate-200 text-slate-400 opacity-60";
  };

  const getBadgeClass = (key) => {
    if (!submitted) return selected === key ? "bg-blue-600 text-white" : d ? "bg-slate-600 text-slate-300" : "bg-slate-100 text-slate-500";
    if (key === q.correctAnswer) return "bg-green-500 text-white";
    if (key === selected) return "bg-red-400 text-white";
    return d ? "bg-slate-600 text-slate-500" : "bg-slate-100 text-slate-400";
  };

  const pctProgress = Math.round((current / total) * 100);

  return (
    <div className="w-full max-w-2xl">
      {/* Progress header card */}
      <div className={`rounded-2xl border shadow-lg p-4 sm:p-5 mb-4 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold ${d ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
              {current + 1}
            </div>
            <span className={`text-xs font-semibold ${d ? "text-slate-400" : "text-slate-400"}`}>of {total} questions</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${d ? "bg-blue-900/50 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
            ⭐ {score} / {total}
          </div>
        </div>
        <div className={`w-full rounded-full h-2 overflow-hidden ${d ? "bg-slate-700" : "bg-slate-100"}`}>
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700" style={{ width: `${pctProgress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i < current
                ? answers[i]?.correct ? "bg-green-500" : "bg-red-400"
                : i === current ? "bg-blue-500 scale-125" : d ? "bg-slate-600" : "bg-slate-200"
            }`} />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className={`rounded-2xl border shadow-lg p-5 sm:p-7 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold mb-4 ${d ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
          📝 Question {current + 1}
        </div>
        <h3 className={`text-base sm:text-lg font-bold leading-relaxed mb-5 ${d ? "text-white" : "text-slate-800"}`}>{q.question}</h3>

        <div className="flex flex-col gap-2.5 mb-6">
          {Object.entries(q.options).map(([key, val]) => (
            <button
              key={key}
              onClick={() => !submitted && setSelected(key)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${getOptionClass(key)} ${!submitted ? "cursor-pointer active:scale-99" : "cursor-default"}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 transition-all ${getBadgeClass(key)}`}>
                {key}
              </span>
              <span className="text-sm font-medium leading-snug">{val}</span>
              {submitted && key === q.correctAnswer && (
                <span className="ml-auto text-green-500 font-bold text-base shrink-0">✓</span>
              )}
              {submitted && key === selected && key !== q.correctAnswer && (
                <span className="ml-auto text-red-400 font-bold text-base shrink-0">✗</span>
              )}
            </button>
          ))}
        </div>

        {!submitted ? (
          <button
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
            onClick={handleSubmit}
            disabled={!selected}
          >
            Submit Answer
          </button>
        ) : (
          <div>
            <div className={`rounded-xl p-3.5 mb-3 text-sm font-semibold text-center ${
              selected === q.correctAnswer
                ? d ? "bg-green-900/40 text-green-300 border border-green-700" : "bg-green-50 text-green-700 border border-green-200"
                : d ? "bg-red-900/40 text-red-300 border border-red-700" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {selected === q.correctAnswer ? "🎯 Correct! Well done!" : `❌ Incorrect — correct answer is ${q.correctAnswer}`}
            </div>
            <button
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/25"
              onClick={handleNext}
            >
              {current + 1 >= total ? "See Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function McqTestMode() {
  const [phase, setPhase] = useState("input");
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const d = dark;

  const generateQuestions = async (topic) => {
    setPhase("loading");
    setError("");
    try {
      const prompt = `Generate exactly 5 multiple choice questions about "${topic}".
Format each question EXACTLY like this:

1. [Question text]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [Correct letter]

Only output the 5 questions. Nothing else.`;

      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = parseQuestions(text);
      if (!parsed.length) throw new Error("Could not parse questions.");
      setQuestions(parsed);
      setPhase("quiz");
    } catch {
      setError("Failed to generate questions. Please try again.");
      setPhase("input");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-slate-900" : "bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100"}`}>
      {/* Top bar */}
      <div className={`flex items-center justify-between px-5 sm:px-8 py-4 border-b ${d ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white/80"} backdrop-blur sticky top-0 z-10`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className={`font-extrabold text-sm ${d ? "text-white" : "text-slate-800"}`}>MCQ Test Mode</span>
        </div>
        <button
          onClick={() => setDark(x => !x)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${d ? "bg-slate-700 border-slate-600 text-yellow-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}
        >
          {d ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm8-8a1 1 0 010 2h-1a1 1 0 010-2h1zM4 11a1 1 0 010 2H3a1 1 0 010-2h1zm13.66-5.66a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zM7.05 16.95a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zm9.9 0a1 1 0 011.41 0l.71.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zM5.64 5.64a1 1 0 011.41 0l.71.71A1 1 0 016.35 7.76l-.71-.71a1 1 0 010-1.41zM12 7a5 5 0 110 10A5 5 0 0112 7z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex justify-center px-4 py-8 sm:py-12">
        {phase === "input" && <TopicInput onGenerate={generateQuestions} dark={d} />}
        {phase === "loading" && <Spinner dark={d} />}
        {phase === "quiz" && (
          <QuizCard questions={questions} onRestart={() => { setPhase("input"); setQuestions([]); }} dark={d} />
        )}
      </div>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}