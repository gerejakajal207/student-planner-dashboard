import React, { useState, useEffect } from "react";
import {
  BookOpen,
  RotateCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "../api";

const DEFAULT_DECKS = [
  {
    id: "cs-default",
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    difficulty: "Medium",
    cards: [
      { id: 1, front: "What is the time complexity of QuickSort in the average case?", back: "O(n log n). The worst-case is O(n²) when the pivot is chosen poorly." },
      { id: 2, front: "Explain the difference between a Process and a Thread.", back: "A Process is an independent executing program with its own memory space, while a Thread is a lightweight unit of execution sharing the parent process's memory." },
      { id: 3, front: "What is the principle of ACID in database systems?", back: "Atomicity, Consistency, Isolation, and Durability — guaranteeing reliable database transactions." },
      { id: 4, front: "What does the CAP Theorem state for distributed systems?", back: "A distributed system can guarantee at most two out of three: Consistency, Availability, and Partition Tolerance." },
    ],
  },
  {
    id: "math-default",
    title: "Calculus & Linear Algebra",
    subject: "Mathematics",
    difficulty: "Medium",
    cards: [
      { id: 5, front: "What is Euler's Formula?", back: "e^(iπ) + 1 = 0, connecting exponential functions, imaginary numbers, and trigonometry." },
      { id: 6, front: "What does the Determinant of a matrix tell us?", back: "It indicates if a matrix is invertible (det ≠ 0) and represents the scaling factor of the linear transformation." },
      { id: 7, front: "State the Fundamental Theorem of Calculus.", back: "Differentiation and integration are inverse operations: if f is continuous on [a, b], then ∫_a^b f(x) dx = F(b) - F(a) where F'(x) = f(x)." },
    ],
  },
  {
    id: "bio-default",
    title: "Cell Biology & Genetics",
    subject: "Biology",
    difficulty: "Easy",
    cards: [
      { id: 8, front: "What is the primary function of Mitochondria?", back: "Generating cellular adenosine triphosphate (ATP) through cellular respiration to power biochemical reactions." },
      { id: 9, front: "What are the four nucleotide bases in DNA?", back: "Adenine (A), Thymine (T), Cytosine (C), and Guanine (G). In RNA, Uracil (U) replaces Thymine." },
    ],
  },
];

const POPULAR_TOPICS = [
  "Python Programming",
  "World War II",
  "Organic Chemistry",
  "Macroeconomics",
  "Neuroscience",
  "Machine Learning",
];

export default function FlashcardsPage() {
  const [decks, setDecks] = useState(() => {
    try {
      const saved = localStorage.getItem("focusnest_flashcard_decks");
      return saved ? JSON.parse(saved) : DEFAULT_DECKS;
    } catch {
      return DEFAULT_DECKS;
    }
  });

  const [activeDeckId, setActiveDeckId] = useState(() => {
    return decks[0]?.id || "cs-default";
  });

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(8);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiValidating, setAiValidating] = useState(false);
  const [aiAmbiguousOptions, setAiAmbiguousOptions] = useState([]);

  const [newCard, setNewCard] = useState({ front: "", back: "" });

  // Persist decks
  useEffect(() => {
    try {
      localStorage.setItem("focusnest_flashcard_decks", JSON.stringify(decks));
    } catch (e) {
      console.error("Failed to save flashcard decks", e);
    }
  }, [decks]);

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0] || {
    id: "empty",
    title: "No Decks",
    subject: "General",
    cards: [],
  };

  const cards = activeDeck.cards || [];
  const currentCard = cards[currentCardIndex] || {
    front: "No cards in this deck yet.",
    back: "Click 'Add Card' or 'Generate with AI' to start studying!",
  };

  const handleNext = () => {
    if (cards.length <= 1) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length <= 1) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    if (cards.length <= 1) return;
    setIsFlipped(false);
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id === activeDeckId) {
          return { ...d, cards: [...d.cards].sort(() => Math.random() - 0.5) };
        }
        return d;
      })
    );
    setCurrentCardIndex(0);
  };

  const handleRate = () => {
    handleNext();
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    const created = {
      id: Date.now(),
      front: newCard.front.trim(),
      back: newCard.back.trim(),
    };

    setDecks((prev) =>
      prev.map((d) => (d.id === activeDeckId ? { ...d, cards: [...d.cards, created] } : d))
    );
    setNewCard({ front: "", back: "" });
    setIsAddingCard(false);
  };

  const handleDeleteCard = (cardId) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === activeDeckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
      )
    );
    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(Math.max(0, cards.length - 2));
    }
  };

  const handleDeleteDeck = (deckId) => {
    if (decks.length <= 1) {
      alert("You need at least one deck.");
      return;
    }
    const remaining = decks.filter((d) => d.id !== deckId);
    setDecks(remaining);
    if (activeDeckId === deckId) {
      setActiveDeckId(remaining[0].id);
      setCurrentCardIndex(0);
    }
  };

  // AI Generation Handler
  const handleGenerateAiDeck = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setAiError("");
    setAiAmbiguousOptions([]);

    // Validate topic first
    setAiValidating(true);
    try {
      const v = await api.validateTopic(aiTopic.trim());
      if (v.status === "invalid") {
        setAiError(v.message || "That doesn't seem like a valid study topic.");
        setAiValidating(false);
        return;
      }
      if (v.status === "ambiguous") {
        setAiError(v.message || "This topic is ambiguous. Please clarify:");
        setAiAmbiguousOptions(v.options || []);
        setAiValidating(false);
        return;
      }
    } catch {
      // validation error — allow through
    }
    setAiValidating(false);

    setAiLoading(true);
    try {
      const data = await api.aiFlashcards(aiTopic.trim(), aiDifficulty, aiCount);
      const generated = data.cards || [];

      const newDeck = {
        id: `ai-${Date.now()}`,
        title: aiTopic.trim(),
        subject: aiTopic.trim().length > 20 ? aiTopic.trim().slice(0, 20) + "..." : aiTopic.trim(),
        difficulty: aiDifficulty,
        cards: generated,
      };

      setDecks((prev) => [newDeck, ...prev]);
      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsGeneratingAi(false);
      setAiTopic("");
    } catch (err) {
      setAiError(err.message || "Failed to generate flashcards. Please check your network.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400">
                <BookOpen size={20} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                Flashcard Revision
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8]">
              Master any topic using active recall, spaced repetition, and instant AI generation
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsGeneratingAi(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80 transition-all active:scale-95"
            >
              <Sparkles size={16} /> Generate with AI
            </button>
            <button
              onClick={() => setIsAddingCard(true)}
              className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#161b22] hover:bg-slate-100 dark:hover:bg-[#1e2530] border border-slate-200 dark:border-white/[0.07] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] shadow-sm transition-all active:scale-95"
            >
              <Plus size={16} /> Add Card
            </button>
          </div>
        </div>

        {/* Deck Selectors */}
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex overflow-x-auto pb-2 gap-2.5 flex-1 pr-2">
            {decks.map((deck) => (
              <div key={deck.id} className="relative group flex-shrink-0">
                <button
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    activeDeckId === deck.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50"
                      : "bg-white dark:bg-[#161b22] text-slate-700 dark:text-[#cbd5e1] border border-slate-200 dark:border-white/[0.07] hover:bg-slate-100 dark:hover:bg-[#1e2530]"
                  }`}
                >
                  <span>{deck.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activeDeckId === deck.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-[#1e2530] text-slate-500 dark:text-[#94a3b8]"
                    }`}
                  >
                    {deck.cards?.length || 0}
                  </span>
                </button>

                {decks.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm text-[10px] hover:bg-rose-600 transition-all"
                    title="Delete Deck"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-[#94a3b8] px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-[#cbd5e1]">
                {activeDeck.title}
              </span>
              <span>•</span>
              <span>
                Card {cards.length > 0 ? currentCardIndex + 1 : 0} of {cards.length}
              </span>
            </div>
            <span className="italic">Click card to reveal answer</span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped((p) => !p)}
            className="group relative h-80 sm:h-96 w-full cursor-pointer perspective rounded-3xl"
          >
            <div
              className={`relative h-full w-full rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-200/80 dark:border-white/[0.07] transition-all duration-500 transform-style-3d flex flex-col justify-between ${
                isFlipped
                  ? "bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-[#161b22] dark:via-[#161b22] dark:to-indigo-500/[0.06]"
                  : "bg-white dark:bg-[#161b22]"
              }`}
            >
              {/* Card Header Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/[0.15] px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {activeDeck.subject || "Topic"}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-[#64748b]">
                  <RotateCw size={12} className={isFlipped ? "rotate-180 transition-transform" : ""} />
                  {isFlipped ? "Answer" : "Question"}
                </span>
              </div>

              {/* Card Content */}
              <div className="my-auto flex flex-col items-center justify-center text-center px-4">
                <p className="text-lg sm:text-2xl font-bold leading-relaxed text-slate-800 dark:text-white">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-[#64748b]">
                <span>{isFlipped ? "Flip again for question" : "Tap anywhere to flip"}</span>
                {cards.length > 0 && currentCard.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(currentCard.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/[0.1] transition-colors"
                    title="Delete this card"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white dark:bg-[#161b22] p-4 border border-slate-100 dark:border-white/[0.07] shadow-sm">
          {/* Navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handlePrev}
              disabled={cards.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1e2530] text-slate-700 dark:text-[#cbd5e1] hover:bg-slate-200 dark:hover:bg-[#252d3a] disabled:opacity-40 transition-colors"
              title="Previous Card"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={cards.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1e2530] text-slate-700 dark:text-[#cbd5e1] hover:bg-slate-200 dark:hover:bg-[#252d3a] disabled:opacity-40 transition-colors"
              title="Next Card"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={handleShuffle}
              disabled={cards.length <= 1}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-[#1e2530] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] hover:bg-slate-200 dark:hover:bg-[#252d3a] disabled:opacity-40 transition-colors"
            >
              <Shuffle size={14} /> Shuffle
            </button>
          </div>

          {/* Self-Rating (Active Recall) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleRate("hard")}
              disabled={cards.length === 0}
              className="flex-1 sm:flex-none rounded-xl bg-red-50 dark:bg-red-500/[0.1] hover:bg-red-100 dark:hover:bg-red-500/[0.15] text-red-600 dark:text-red-400 px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Hard (Review Soon)
            </button>
            <button
              onClick={() => handleRate("good")}
              disabled={cards.length === 0}
              className="flex-1 sm:flex-none rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] hover:bg-amber-100 dark:hover:bg-amber-500/[0.15] text-amber-600 dark:text-amber-400 px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Good
            </button>
            <button
              onClick={() => handleRate("easy")}
              disabled={cards.length === 0}
              className="flex-1 sm:flex-none rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.1] hover:bg-emerald-100 dark:hover:bg-emerald-500/[0.15] text-emerald-600 dark:text-emerald-400 px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Easy (Mastered)
            </button>
          </div>
        </div>

        {/* ── AI FLASHCARD GENERATOR MODAL ── */}
        {isGeneratingAi && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => !aiLoading && setIsGeneratingAi(false)}
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-white/[0.07]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      AI Flashcard Generator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                      Enter any study topic to create instant active-recall flashcards
                    </p>
                  </div>
                </div>
                {!aiLoading && (
                  <button
                    onClick={() => setIsGeneratingAi(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleGenerateAiDeck} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">
                    Topic / Concept / Chapter
                  </label>
                  <input
                    type="text"
                    required
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Binary Search Trees, Cold War, Thermodynamics"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={aiLoading}
                  />
                </div>

                {/* Popular topic suggestions */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 dark:text-[#64748b] mb-1.5">
                    Or try a popular topic:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setAiTopic(topic)}
                        disabled={aiLoading}
                        className="rounded-lg bg-slate-100 dark:bg-[#1e2530] hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.18] hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 text-xs text-slate-600 dark:text-[#cbd5e1] transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      disabled={aiLoading}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs font-medium text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Easy">Easy (Definitions)</option>
                      <option value="Medium">Medium (Conceptual)</option>
                      <option value="Hard">Hard (Deep Analysis)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Number of Cards
                    </label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      disabled={aiLoading}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs font-medium text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5 Flashcards</option>
                      <option value={8}>8 Flashcards</option>
                      <option value={10}>10 Flashcards</option>
                      <option value={12}>12 Flashcards</option>
                    </select>
                  </div>
                </div>

                {aiError && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] border border-amber-200 dark:border-amber-500/20 p-3 text-xs leading-relaxed">
                    <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1.5">{aiError}</p>
                    {aiAmbiguousOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {aiAmbiguousOptions.map((opt, i) => (
                          <button key={i} type="button"
                            onClick={() => { setAiTopic(opt); setAiError(""); setAiAmbiguousOptions([]); }}
                            className="rounded-lg bg-white dark:bg-[#1e2530] border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-xs hover:bg-amber-50 dark:hover:bg-amber-500/[0.12] transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGeneratingAi(false)}
                    disabled={aiLoading}
                    className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={aiLoading || aiValidating || !aiTopic.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles size={14} className={aiLoading || aiValidating ? "animate-spin" : ""} />
                    {aiValidating ? "Validating topic..." : aiLoading ? "Generating Flashcards..." : "Generate Deck"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MANUAL ADD CARD MODAL ── */}
        {isAddingCard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setIsAddingCard(false)}
          >
            <form
              onSubmit={handleAddCard}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-white/[0.07]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Add Custom Flashcard
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94a3b8] mb-4">
                Adding to deck: <span className="font-semibold text-indigo-600">{activeDeck.title}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Front (Question or Concept)
                  </label>
                  <textarea
                    rows={3}
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    placeholder="e.g. What is the difference between TCP and UDP?"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Back (Answer or Explanation)
                  </label>
                  <textarea
                    rows={3}
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    placeholder="e.g. TCP is connection-oriented and reliable, while UDP is connectionless and fast."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
