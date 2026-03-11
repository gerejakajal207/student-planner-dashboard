import { useState } from "react";

// ─── Gemini API ────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}


// ─── Clean Markdown ────────────────────────────────────────────────────────
function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")   // **bold**
    .replace(/\*(.+?)\*/g, "$1")        // *italic*
    .replace(/`(.+?)`/g, "$1")          // `code`
    .replace(/#{1,6}\s*/g, "")          // # headings
    .replace(/^\s*[\*\-]\s+/gm, "")    // bullet points
    .trim();
}

// ─── Parse ─────────────────────────────────────────────────────────────────
function parseFlashcards(text) {
  const cards = [];
  const blocks = text.split(/\n(?=\d+[\.\)])/g).filter(Boolean);
  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    if (lines.length < 2) continue;
    const question = cleanMarkdown(lines[0].replace(/^\d+[\.\)]\s*/, "").replace(/^Q[:\.]?\s*/i, ""));
    const answer   = cleanMarkdown(lines.slice(1).join(" ").replace(/^A[:\.]?\s*/i, "").replace(/^Answer[:\.]?\s*/i, ""));
    if (question && answer) cards.push({ question, answer });
  }
  return cards;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const FC_TOPICS = ["Python Programming", "Biology", "Economics", "World War II", "Calculus", "Chemistry"];
const FC_STATS  = [
  { icon: "🃏", label: "Flashcards",   sub: "Per Topic"     },
  { icon: "🔄", label: "Flip & Learn", sub: "Reveal Answer" },
  { icon: "📈", label: "Spaced",       sub: "Repetition"    },
];

// ─── DarkModeToggle ────────────────────────────────────────────────────────
function DarkModeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
        dark ? "bg-slate-700 border-slate-600 text-yellow-400" : "bg-slate-100 border-slate-200 text-slate-600"
      }`}
    >
      {dark ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm8-8a1 1 0 010 2h-1a1 1 0 010-2h1zM4 11a1 1 0 010 2H3a1 1 0 010-2h1zm13.66-5.66a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zM7.05 16.95a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zm9.9 0a1 1 0 011.41 0l.71.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zM5.64 5.64a1 1 0 011.41 0l.71.71A1 1 0 016.35 7.76l-.71-.71a1 1 0 010-1.41zM12 7a5 5 0 110 10A5 5 0 0112 7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

// ─── PrimaryButton ─────────────────────────────────────────────────────────
function PrimaryButton({ onClick, disabled, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 whitespace-nowrap ${className}`}
    >
      {children}
    </button>
  );
}

// ─── OutlineButton ─────────────────────────────────────────────────────────
function OutlineButton({ onClick, disabled, dark, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border text-sm font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
        dark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ─── HeroHeader ────────────────────────────────────────────────────────────
function HeroHeader({ dark, badge, headline, highlight, description }) {
  const d = dark;
  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 ${d ? "bg-blue-900/50 text-blue-300 border border-blue-700" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
        {badge}
      </div>
      <h1 className={`text-3xl sm:text-4xl font-extrabold mb-3 leading-tight ${d ? "text-white" : "text-slate-900"}`}>
        {headline}<br /><span className="text-blue-600">{highlight}</span>
      </h1>
      <p className={`text-sm sm:text-base max-w-md mx-auto ${d ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
    </div>
  );
}

// ─── TopicInput ────────────────────────────────────────────────────────────
function TopicInput({ onGenerate, dark, placeholder, topics }) {
  const [topic, setTopic] = useState("");
  const d = dark;
  return (
    <div className={`rounded-2xl border shadow-lg p-6 sm:p-8 mb-5 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
      <label className={`block text-sm font-bold mb-2 ${d ? "text-slate-200" : "text-slate-700"}`}>Enter a Topic</label>
      <div className="flex gap-3">
        <input
          className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${
            d ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
          }`}
          placeholder={placeholder}
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && topic.trim() && onGenerate(topic.trim())}
        />
        <PrimaryButton className="px-5 py-3" onClick={() => topic.trim() && onGenerate(topic.trim())} disabled={!topic.trim()}>
          Generate →
        </PrimaryButton>
      </div>
      <div className="mt-4">
        <p className={`text-xs font-semibold mb-2 ${d ? "text-slate-500" : "text-slate-400"}`}>QUICK PICKS</p>
        <div className="flex flex-wrap gap-2">
          {topics.map(t => (
            <button key={t} onClick={() => onGenerate(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
                d ? "bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── StatsRow ──────────────────────────────────────────────────────────────
function StatsRow({ dark, stats }) {
  const d = dark;
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon, label, sub }) => (
        <div key={label} className={`rounded-xl border p-3 sm:p-4 text-center ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="text-xl sm:text-2xl mb-1">{icon}</div>
          <div className={`text-xs sm:text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{label}</div>
          <div className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner({ dark, emoji = "⚙️", title = "Generating…", subtitle = "AI is working on it" }) {
  const d = dark;
  return (
    <div className="w-full max-w-2xl">
      <div className={`rounded-2xl border shadow-lg p-10 flex flex-col items-center gap-5 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="relative">
          <div className={`w-16 h-16 rounded-full border-4 border-t-blue-600 animate-spin ${d ? "border-slate-600" : "border-blue-100"}`} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">{emoji}</div>
        </div>
        <div className="text-center">
          <p className={`font-bold text-base ${d ? "text-white" : "text-slate-800"}`}>{title}</p>
          <p className={`text-sm mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ProgressHeader ────────────────────────────────────────────────────────
function ProgressHeader({ dark, current, total, dotColors, rightSlot }) {
  const d = dark;
  return (
    <div className={`rounded-2xl border shadow-lg p-4 sm:p-5 mb-4 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold ${d ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
            {current + 1}
          </div>
          <span className={`text-xs font-semibold ${d ? "text-slate-400" : "text-slate-400"}`}>of {total}</span>
        </div>
        {rightSlot}
      </div>
      <div className={`w-full rounded-full h-2 overflow-hidden ${d ? "bg-slate-700" : "bg-slate-100"}`}>
        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
          style={{ width: `${Math.round((current / total) * 100)}%` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${
            i < current ? (dotColors?.[i] ?? "bg-blue-400")
            : i === current ? "bg-blue-500 scale-125"
            : d ? "bg-slate-600" : "bg-slate-200"
          }`} />
        ))}
      </div>
    </div>
  );
}

// ─── ErrorToast ────────────────────────────────────────────────────────────
function ErrorToast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl z-50">
      ⚠️ {message}
    </div>
  );
}

// ─── InputScreen ───────────────────────────────────────────────────────────
function InputScreen({ onGenerate, dark }) {
  return (
    <div className="w-full max-w-2xl">
      <HeroHeader
        dark={dark}
        badge="Spaced Repetition Learning"
        headline="Flashcards for"
        highlight="Quick Revision"
        description="Enter any topic and get AI-generated flashcards for fast, effective spaced repetition practice."
      />
      <TopicInput dark={dark} onGenerate={onGenerate} placeholder="e.g., Python Programming, Biology, Economics…" topics={FC_TOPICS} />
      <StatsRow dark={dark} stats={FC_STATS} />
    </div>
  );
}

// ─── FlashcardView ─────────────────────────────────────────────────────────
function FlashcardView({ cards, topic, onRestart, dark }) {
  const [current, setCurrent]     = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [known, setKnown]         = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const d     = dark;
  const total = cards.length;
  const card  = cards[current];

  const goNext = () => {
    if (current + 1 >= total) { setReviewing(true); return; }
    setCurrent(c => c + 1); setFlipped(false);
  };
  const handleKnow   = () => { setKnown(prev => [...prev, current]); goNext(); };
  const handleReview = () => goNext();
  const goPrev       = () => { if (current === 0) return; setCurrent(c => c - 1); setFlipped(false); };

  // ── Results ───────────────────────────────────────────────────────────────
  if (reviewing) {
    const knownCount = known.length;
    const pct        = Math.round((knownCount / total) * 100);
    const emoji      = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚";
    const scoreColor = pct >= 80 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-red-500";
    const label      = pct >= 80 ? "Great recall!"  : pct >= 50 ? "Good progress!" : "Keep reviewing!";
    const scoreBg    = pct >= 80
      ? d ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"
      : pct >= 50
      ? d ? "bg-amber-900/30 border-amber-700" : "bg-amber-50 border-amber-200"
      : d ? "bg-red-900/30 border-red-700"      : "bg-red-50 border-red-200";

    return (
      <div className="w-full max-w-2xl">
        <div className={`rounded-2xl border shadow-lg p-6 sm:p-8 mb-4 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
            <div className={`rounded-2xl border p-5 flex flex-col items-center min-w-[120px] ${scoreBg}`}>
              <div className="text-4xl mb-1">{emoji}</div>
              <div className={`text-4xl font-extrabold ${scoreColor}`}>{pct}%</div>
              <div className={`text-xs font-semibold mt-1 ${scoreColor}`}>{label}</div>
            </div>
            <div className="flex-1 w-full">
              <h2 className={`text-xl font-extrabold mb-1 ${d ? "text-white" : "text-slate-800"}`}>Session Complete!</h2>
              <p className={`text-sm mb-4 ${d ? "text-slate-400" : "text-slate-500"}`}>
                You knew <strong>{knownCount}</strong> out of <strong>{total}</strong> flashcards
              </p>
              <div className="flex gap-1.5">
                {cards.map((_, i) => <div key={i} className={`flex-1 h-3 rounded-full ${known.includes(i) ? "bg-green-500" : "bg-red-400"}`} />)}
              </div>
              <div className={`flex justify-between text-xs mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>
                <span>{knownCount} known</span><span>{total - knownCount} to review</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <OutlineButton dark={dark} className="flex-1 py-3" onClick={() => { setCurrent(0); setFlipped(false); setKnown([]); setReviewing(false); }}>
              ↺ Restart Deck
            </OutlineButton>
            <PrimaryButton className="flex-1 py-3" onClick={onRestart}>New Topic</PrimaryButton>
          </div>
        </div>
        <div className={`rounded-2xl border shadow-lg p-5 sm:p-6 ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h3 className={`text-xs font-bold mb-4 ${d ? "text-slate-400" : "text-slate-500"}`}>ALL FLASHCARDS</h3>
          <div className="flex flex-col gap-3">
            {cards.map((c, i) => (
              <div key={i} className={`rounded-xl border p-4 ${known.includes(i) ? d ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200" : d ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${known.includes(i) ? "bg-green-500 text-white" : "bg-red-400 text-white"}`}>
                    {known.includes(i) ? "✓" : "✗"}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-bold ${d ? "text-slate-200" : "text-slate-700"}`}>{c.question}</p>
                    <p className={`text-xs mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>{c.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active card ───────────────────────────────────────────────────────────
  const dotColors = cards.map((_, i) => known.includes(i) ? "bg-green-500" : "bg-red-400");

  return (
    <div className="w-full max-w-2xl">
      <ProgressHeader
        dark={dark} current={current} total={total} dotColors={dotColors}
        rightSlot={
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${d ? "bg-green-900/40 text-green-400" : "bg-green-50 text-green-700"}`}>✓ {known.length}</div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${d ? "bg-red-900/40 text-red-400" : "bg-red-50 text-red-700"}`}>✗ {current - known.length}</div>
          </div>
        }
      />

      {/* Flashcard */}
      <div
        className={`rounded-2xl border shadow-xl mb-4 overflow-hidden cursor-pointer select-none ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        onClick={() => setFlipped(f => !f)}
        style={{ minHeight: 280 }}
      >
        <div className={`px-6 sm:px-10 py-7 border-b ${d ? "bg-blue-900/30 border-slate-700" : "bg-blue-50 border-slate-200"}`}>
          <div className={`text-xs font-bold tracking-widest mb-3 ${d ? "text-blue-400" : "text-blue-500"}`}>QUESTION</div>
          <p className={`text-lg sm:text-xl font-extrabold leading-snug ${d ? "text-white" : "text-slate-800"}`}>{card.question}</p>
        </div>
        <div className="px-6 sm:px-10 py-7" style={{ minHeight: 160 }}>
          {flipped ? (
            <div>
              <div className={`text-xs font-bold tracking-widest mb-3 ${d ? "text-green-400" : "text-green-600"}`}>ANSWER</div>
              <p className={`text-base sm:text-lg font-semibold leading-relaxed ${d ? "text-slate-200" : "text-slate-700"}`}>{card.answer}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${d ? "bg-slate-700" : "bg-slate-100"}`}>👆</div>
              <p className={`text-sm font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Tap to reveal answer</p>
            </div>
          )}
        </div>
      </div>

      {/* Know / Still learning */}
      {flipped && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={handleReview} className={`py-3.5 rounded-xl border-2 text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${d ? "border-red-700 bg-red-900/30 text-red-300 hover:bg-red-900/50" : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"}`}>
            <span>😕</span> Still Learning
          </button>
          <button onClick={handleKnow} className={`py-3.5 rounded-xl border-2 text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${d ? "border-green-700 bg-green-900/30 text-green-300 hover:bg-green-900/50" : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"}`}>
            <span>✅</span> Got It!
          </button>
        </div>
      )}

      {/* Nav */}
      <div className={`rounded-2xl border shadow-lg p-4 flex items-center justify-between ${d ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <OutlineButton dark={dark} className="px-4 py-2.5" onClick={goPrev} disabled={current === 0}>‹ Prev</OutlineButton>
        <span className={`text-sm font-bold ${d ? "text-slate-400" : "text-slate-500"}`}>{current + 1} / {total}</span>
        <PrimaryButton className="px-4 py-2.5" onClick={() => { setFlipped(false); goNext(); }}>Next ›</PrimaryButton>
      </div>
      <p className={`text-center text-xs mt-3 ${d ? "text-slate-600" : "text-slate-400"}`}>
        💡 Tap the card to flip · Rate yourself after revealing
      </p>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────
export default function RevisionFlashcards() {
  const [phase, setPhase] = useState("input");
  const [cards, setCards] = useState([]);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark]   = useState(false);
  const d = dark;

  const generateCards = async (t) => {
    setTopic(t); setPhase("loading"); setError("");
    try {
      const prompt = `Generate exactly 5 flashcards about "${t}". Format EXACTLY like this:
1. [Question]
A. [Detailed answer]

2. [Question]
A. [Detailed answer]

Only output the 5 flashcards. Nothing else.`;
      const text   = await callGemini(prompt);
      const parsed = parseFlashcards(text);
      if (!parsed.length) throw new Error();
      setCards(parsed); setPhase("cards");
    } catch {
      setError("Failed to generate flashcards. Please try again.");
      setPhase("input");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-slate-900" : "bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100"}`}>
      {/* Sticky top bar */}
      <div className={`flex items-center justify-between px-5 sm:px-8 py-4 border-b sticky top-0 z-10 backdrop-blur ${d ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white/80"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-sm">🃏</span>
          </div>
          <span className={`font-extrabold text-sm ${d ? "text-white" : "text-slate-800"}`}>Flashcards Mode</span>
        </div>
        <div className="flex items-center gap-2">
          {phase === "cards" && (
            <OutlineButton dark={dark} className="px-3 py-1.5 text-xs" onClick={() => { setPhase("input"); setCards([]); }}>
              ↺ New Topic
            </OutlineButton>
          )}
          <DarkModeToggle dark={dark} onToggle={() => setDark(x => !x)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center px-4 py-8 sm:py-12">
        {phase === "input"   && <InputScreen onGenerate={generateCards} dark={dark} />}
        {phase === "loading" && <Spinner dark={dark} emoji="🃏" title="Creating your flashcards…" subtitle="AI is crafting tailored flashcards for you" />}
        {phase === "cards"   && <FlashcardView cards={cards} topic={topic} onRestart={() => { setPhase("input"); setCards([]); }} dark={dark} />}
      </div>

      <ErrorToast message={error} />
    </div>
  );
}