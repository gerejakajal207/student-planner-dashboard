import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  FolderPlus,
  ArrowLeft,
  Play,
} from "lucide-react";
import { api } from "../api";

const POPULAR_TOPICS = [
  "Python Programming",
  "World War II",
  "Organic Chemistry",
  "Macroeconomics",
  "Neuroscience",
  "Machine Learning",
];

export default function FlashcardsPage() {
  const location = useLocation();
  const [decks, setDecks] = useState(() => {
    try {
      const saved = localStorage.getItem("focusnest_flashcard_decks");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Exclude old hardcoded default decks if present
        return parsed.filter(
          (d) => !["cs-default", "math-default", "bio-default"].includes(d.id)
        );
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeDeckId, setActiveDeckId] = useState(null);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Custom Deck creation state
  const [newDeckData, setNewDeckData] = useState({
    title: "",
    subject: "",
    firstFront: "",
    firstBack: "",
  });

  // AI Generator state
  const [aiMode, setAiMode] = useState("topic"); // "topic" | "notes"
  const [aiTopic, setAiTopic] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(8);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiValidating, setAiValidating] = useState(false);
  const [aiAmbiguousOptions, setAiAmbiguousOptions] = useState([]);

  const [newCard, setNewCard] = useState({ front: "", back: "" });

  // Handle incoming 1-Click AI Action pre-fills from Calendar, Kanban, or TaskModal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const incomingTopic = location.state?.topic || params.get("topic");
    const incomingSubject = location.state?.subject || params.get("subject");
    if (incomingTopic || incomingSubject) {
      const topicText = incomingTopic || incomingSubject;
      setAiTopic(topicText);
      setIsGeneratingAi(true);
      if (location.state?.difficulty) {
        setAiDifficulty(location.state.difficulty);
      }
    }
  }, [location]);

  // Fetch decks from Cloud on mount if logged in, with fallback to local storage
  useEffect(() => {
    const token = localStorage.getItem("focusnest_token");
    if (!token) return;

    api
      .getDecks()
      .then(async (cloudDecks) => {
        if (Array.isArray(cloudDecks) && cloudDecks.length > 0) {
          setDecks(cloudDecks);
        } else {
          // Cloud has no decks yet. Check if there are local decks to migrate to cloud
          const saved = localStorage.getItem("focusnest_flashcard_decks");
          if (saved) {
            try {
              const localDecks = JSON.parse(saved).filter(
                (d) => !["cs-default", "math-default", "bio-default"].includes(d.id)
              );
              if (localDecks.length > 0) {
                const migrated = [];
                for (const ld of localDecks) {
                  try {
                    const savedDeck = await api.createDeck({
                      title: ld.title,
                      subject: ld.subject || ld.title,
                      difficulty: ld.difficulty || "Medium",
                      cards: ld.cards || [],
                    });
                    migrated.push(savedDeck);
                  } catch (e) {
                    console.warn("Could not auto-migrate deck:", e);
                  }
                }
                if (migrated.length > 0) {
                  setDecks(migrated);
                }
              }
            } catch (e) {
              console.error("Failed to parse local decks for migration", e);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load cloud decks:", err);
      });
  }, []);

  // Persist decks to localStorage for fast offline access
  useEffect(() => {
    try {
      localStorage.setItem("focusnest_flashcard_decks", JSON.stringify(decks));
    } catch (e) {
      console.error("Failed to save flashcard decks", e);
    }
  }, [decks]);

  const activeDeck = activeDeckId
    ? decks.find((d) => String(d.id) === String(activeDeckId)) || null
    : null;
  const cards = activeDeck?.cards || [];
  const currentCard = cards[currentCardIndex] || null;

  const handleStartStudy = (deckId) => {
    setActiveDeckId(deckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
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
        if (String(d.id) === String(activeDeckId)) {
          return { ...d, cards: [...d.cards].sort(() => Math.random() - 0.5) };
        }
        return d;
      })
    );
    setCurrentCardIndex(0);
  };

  const handleRate = async (rating) => {
    if (!currentCard || cards.length === 0) return;

    const rep = currentCard.repetition || 0;
    const ef = currentCard.easeFactor || 2.5;
    const interval = currentCard.interval || 0;

    let newRepetition = rep;
    let newInterval = interval;
    let newEaseFactor = ef;
    let newDueDate = new Date().toISOString();

    if (rating === "again") {
      // Again (<1 min): reset repetition streak, schedule for immediate/same-session review
      newRepetition = 0;
      newInterval = 0;
      newEaseFactor = Math.max(1.3, ef - 0.2);
      newDueDate = new Date().toISOString();
    } else if (rating === "hard") {
      // Hard (1 day): 1 day interval, slightly reduce ease factor
      newRepetition = Math.max(1, rep);
      newInterval = 1;
      newEaseFactor = Math.max(1.3, ef - 0.15);
      newDueDate = new Date(Date.now() + 1 * 86400000).toISOString();
    } else if (rating === "good") {
      // Good (3 days base or SM-2 scaled)
      newRepetition = rep + 1;
      newEaseFactor = ef;
      newInterval = rep === 0 ? 1 : rep === 1 ? 3 : Math.round(Math.max(1, interval) * ef);
      newDueDate = new Date(Date.now() + newInterval * 86400000).toISOString();
    } else if (rating === "easy") {
      // Easy (7 days base or boosted)
      newRepetition = rep + 1;
      newEaseFactor = ef + 0.15;
      newInterval = rep === 0 ? 3 : rep === 1 ? 7 : Math.round(Math.max(1, interval) * ef * 1.3);
      newDueDate = new Date(Date.now() + newInterval * 86400000).toISOString();
    }

    const updatedCard = {
      ...currentCard,
      repetition: newRepetition,
      interval: newInterval,
      easeFactor: Number(newEaseFactor.toFixed(2)),
      dueDate: newDueDate,
      lastReviewed: new Date().toISOString(),
    };

    const targetDeck = decks.find((d) => String(d.id) === String(activeDeckId));
    if (!targetDeck) return;

    const updatedCards = targetDeck.cards.map((c) =>
      c.id === currentCard.id ? updatedCard : c
    );

    const updatedDecks = decks.map((d) =>
      String(d.id) === String(activeDeckId) ? { ...d, cards: updatedCards } : d
    );

    setDecks(updatedDecks);
    try {
      localStorage.setItem("focusnest_flashcard_decks", JSON.stringify(updatedDecks));
      window.dispatchEvent(new Event("focusnest_decks_updated"));
    } catch (e) {
      console.warn("Storage update failed", e);
    }

    if (localStorage.getItem("focusnest_token") && typeof activeDeckId === "number") {
      try {
        await api.updateDeck(activeDeckId, { cards: updatedCards });
      } catch (err) {
        console.warn("Failed to sync card rating to cloud", err);
      }
    }

    handleNext();
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    const created = {
      id: Date.now(),
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
    };

    if (decks.length === 0 || !activeDeckId) {
      const deckPayload = {
        title: "My Custom Deck",
        subject: "General",
        difficulty: "Medium",
        cards: [created],
      };
      let newDeck = null;
      if (localStorage.getItem("focusnest_token")) {
        try {
          newDeck = await api.createDeck(deckPayload);
        } catch (err) {
          console.warn("Cloud save deck failed", err);
        }
      }
      if (!newDeck) {
        newDeck = { id: `deck-${Date.now()}`, ...deckPayload };
      }
      setDecks([newDeck]);
      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
    } else {
      const targetDeck = decks.find((d) => String(d.id) === String(activeDeckId));
      const updatedCards = targetDeck ? [...targetDeck.cards, created] : [created];

      setDecks((prev) =>
        prev.map((d) => (String(d.id) === String(activeDeckId) ? { ...d, cards: updatedCards } : d))
      );

      if (localStorage.getItem("focusnest_token") && typeof activeDeckId === "number") {
        try {
          await api.updateDeck(activeDeckId, { cards: updatedCards });
        } catch (err) {
          console.warn("Failed to update deck in cloud", err);
        }
      }
    }
    setNewCard({ front: "", back: "" });
    setIsAddingCard(false);
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newDeckData.title.trim()) return;

    const initialCards = [];
    if (newDeckData.firstFront.trim() && newDeckData.firstBack.trim()) {
      initialCards.push({
        id: Date.now(),
        front: newDeckData.firstFront.trim(),
        back: newDeckData.firstBack.trim(),
      });
    }

    const deckPayload = {
      title: newDeckData.title.trim(),
      subject: newDeckData.subject.trim() || newDeckData.title.trim(),
      difficulty: "Medium",
      cards: initialCards,
    };

    let newDeck = null;
    if (localStorage.getItem("focusnest_token")) {
      try {
        newDeck = await api.createDeck(deckPayload);
      } catch (err) {
        console.warn("Cloud save deck failed, saving locally:", err);
      }
    }

    if (!newDeck) {
      newDeck = {
        id: `deck-${Date.now()}`,
        ...deckPayload,
      };
    }

    setDecks((prev) => [newDeck, ...prev]);
    setActiveDeckId(newDeck.id);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setNewDeckData({ title: "", subject: "", firstFront: "", firstBack: "" });
    setIsCreatingDeck(false);
  };

  const handleDeleteCard = async (cardId) => {
    const targetDeck = decks.find((d) => String(d.id) === String(activeDeckId));
    if (!targetDeck) return;
    const updatedCards = targetDeck.cards.filter((c) => c.id !== cardId);

    setDecks((prev) =>
      prev.map((d) => (String(d.id) === String(activeDeckId) ? { ...d, cards: updatedCards } : d))
    );
    if (currentCardIndex >= updatedCards.length) {
      setCurrentCardIndex(Math.max(0, updatedCards.length - 1));
    }

    if (localStorage.getItem("focusnest_token") && typeof activeDeckId === "number") {
      try {
        await api.updateDeck(activeDeckId, { cards: updatedCards });
      } catch (err) {
        console.warn("Failed to sync card deletion to cloud", err);
      }
    }
  };

  const handleDeleteDeck = async (deckId) => {
    const remaining = decks.filter((d) => String(d.id) !== String(deckId));
    setDecks(remaining);
    if (String(activeDeckId) === String(deckId)) {
      setActiveDeckId(remaining[0]?.id || null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }

    if (localStorage.getItem("focusnest_token") && typeof deckId === "number") {
      try {
        await api.deleteDeck(deckId);
      } catch (err) {
        console.warn("Failed to delete deck from cloud", err);
      }
    }
  };

  // AI Generation Handler
  const handleGenerateAiDeck = async (e) => {
    e.preventDefault();

    setAiError("");
    setAiAmbiguousOptions([]);

    if (aiMode === "notes") {
      if (!aiNotes.trim() || aiNotes.trim().length < 15) {
        setAiError("Please paste your lecture slides, notes, or syllabus content (minimum 15 characters).");
        return;
      }
    } else {
      if (!aiTopic.trim()) {
        setAiError("Please enter a study topic.");
        return;
      }

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
    }

    setAiLoading(true);
    try {
      const topicTitle = aiTopic.trim() || (aiMode === "notes" ? "Course Notes Study Deck" : "Untitled Deck");
      const notesContent = aiMode === "notes" ? aiNotes.trim() : null;
      const data = await api.aiFlashcards(topicTitle, aiDifficulty, aiCount, notesContent);
      const generated = data.cards || [];

      if (!generated.length) {
        throw new Error("No flashcards were generated. Please try again with more details or adjust difficulty.");
      }

      // Ensure all generated cards have SRS fields
      const enrichedCards = generated.map((c, i) => ({
        id: c.id || Date.now() + i,
        front: c.front || "Concept",
        back: c.back || "Answer",
        interval: 0,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
      }));

      const deckPayload = {
        title: topicTitle,
        subject: topicTitle.length > 20 ? topicTitle.slice(0, 20) + "..." : topicTitle,
        difficulty: aiDifficulty,
        cards: enrichedCards,
      };

      let newDeck = null;
      if (localStorage.getItem("focusnest_token")) {
        try {
          newDeck = await api.createDeck(deckPayload);
        } catch (err) {
          console.warn("Cloud save AI deck failed, saving locally:", err);
        }
      }

      if (!newDeck) {
        newDeck = {
          id: `ai-${Date.now()}`,
          ...deckPayload,
        };
      }

      const updatedDecks = [newDeck, ...decks];
      setDecks(updatedDecks);
      try {
        localStorage.setItem("focusnest_flashcard_decks", JSON.stringify(updatedDecks));
        window.dispatchEvent(new Event("focusnest_decks_updated"));
      } catch (e) {
        console.warn("Local storage save failed", e);
      }

      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsGeneratingAi(false);
      setAiTopic("");
      setAiNotes("");
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
            <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsGeneratingAi(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80 transition-all active:scale-95"
            >
              <Sparkles size={16} /> Generate with AI
            </button>
            <button
              onClick={() => setIsCreatingDeck(true)}
              className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#161b22] hover:bg-slate-100 dark:hover:bg-[#1e2530] border border-slate-200 dark:border-white/[0.07] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] shadow-sm transition-all active:scale-95"
            >
              <FolderPlus size={16} /> New Deck
            </button>
            {activeDeck && (
              <button
                onClick={() => setIsAddingCard(true)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#161b22] hover:bg-slate-100 dark:hover:bg-[#1e2530] border border-slate-200 dark:border-white/[0.07] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] shadow-sm transition-all active:scale-95"
              >
                <Plus size={16} /> Add Card
              </button>
            )}
          </div>
        </div>

        {/* ── OVERVIEW OR STUDY MODE ── */}
        {!activeDeck ? (
          decks.length === 0 ? (
            /* ── EMPTY STATE WHEN NO DECKS EXIST ── */
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-white/70 dark:bg-[#161b22]/70 p-8 sm:p-14 text-center backdrop-blur-sm shadow-xs mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/20 text-indigo-600 dark:text-indigo-400">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                No Flashcard Decks Yet
              </h3>
              <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-[#94a3b8] mb-6">
                Create a custom study deck in seconds using AI active recall, or build your own flashcards manually.
              </p>

              {/* Quick-Start Suggested Topics */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#64748b] mb-3">
                  Popular Topics to Generate
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {POPULAR_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setAiTopic(topic);
                        setIsGeneratingAi(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e2530] px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-[#cbd5e1] hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition-all shadow-2xs"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsGeneratingAi(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/80 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles size={16} /> Generate Deck with AI
                </button>
                <button
                  onClick={() => setIsCreatingDeck(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e2530] hover:bg-slate-50 dark:hover:bg-[#252d3a] px-5 py-3 text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] transition-all"
                >
                  <Plus size={16} /> Create Custom Deck
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Header: Decks already made */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                    Your Study Decks
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                    Select any deck to start practicing active recall
                  </p>
                </div>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {decks.length} {decks.length === 1 ? "Deck" : "Decks"}
                </span>
              </div>

              {/* Grid of Decks created */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="rounded-lg bg-indigo-50 dark:bg-indigo-500/[0.12] px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          {deck.subject || "General"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-[#64748b]">
                            {deck.difficulty || "Medium"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDeck(deck.id);
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Deck"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-slate-800 dark:text-white mb-3 line-clamp-2">
                        {deck.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs mb-4 text-slate-500 dark:text-[#94a3b8] flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={14} />
                          <span>{deck.cards?.length || 0} Flashcards</span>
                        </div>
                        {Array.isArray(deck.cards) && deck.cards.filter((c) => !c.dueDate || new Date(c.dueDate) <= new Date()).length > 0 && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              {deck.cards.filter((c) => !c.dueDate || new Date(c.dueDate) <= new Date()).length} Due for Review
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartStudy(deck.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Play size={14} /> Study Deck
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Banner: Generate New Deck below the list */}
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-gradient-to-br from-indigo-50/60 to-violet-50/60 dark:from-indigo-950/20 dark:to-violet-950/20 p-6 sm:p-8 text-center transition-all">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1">
                  Create or Generate a Study Deck
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8] mb-5 max-w-md mx-auto">
                  Generate tailored active-recall flashcards using AI on any topic, or manually craft your own deck.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsGeneratingAi(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80 transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles size={16} /> Generate with AI
                  </button>
                  <button
                    onClick={() => setIsCreatingDeck(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e2530] hover:bg-slate-50 dark:hover:bg-[#252d3a] px-5 py-3 text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] transition-all"
                  >
                    <Plus size={16} /> Create Custom Deck
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* ── ACTIVE STUDY PLAYER ── */
          <div>
            {/* Top Bar Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveDeckId(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-[#1e2530] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] shadow-2xs transition-all active:scale-95"
              >
                <ArrowLeft size={16} /> Back to All Decks
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#94a3b8] hidden sm:inline">
                  {activeDeck.title}
                </span>
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-[#1e2530] border border-slate-200 dark:border-white/[0.07] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#e2e8f0] shadow-2xs transition-all active:scale-95"
                >
                  <Plus size={14} /> Add Card
                </button>
              </div>
            </div>

            {/* Flashcard Area */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-[#94a3b8] px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-[#cbd5e1]">
                    {activeDeck?.title || "Study Deck"}
                  </span>
                  <span>•</span>
                  <span>
                    Card {cards.length > 0 ? currentCardIndex + 1 : 0} of {cards.length}
                  </span>
                </div>
                <span className="italic">Click card to reveal answer</span>
              </div>

              {cards.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] p-12 text-center">
                  <p className="text-base font-semibold text-slate-700 dark:text-[#cbd5e1] mb-2">This deck has no cards yet</p>
                  <p className="text-xs text-slate-400 dark:text-[#64748b] mb-4">Add your first card or generate more with AI</p>
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    <Plus size={14} /> Add Card
                  </button>
                </div>
              ) : (
                /* 3D Flip Card */
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
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/[0.15] px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {activeDeck?.subject || "Topic"}
                        </span>
                        {currentCard?.interval !== undefined && (
                          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-[#1e2530] px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-[#94a3b8]">
                            <span>🔁 {currentCard.interval === 0 ? "Due Today" : `${currentCard.interval}d interval`}</span>
                            {currentCard.repetition > 0 && <span className="text-emerald-500 font-bold">· {currentCard.repetition} streak</span>}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-[#64748b]">
                        <RotateCw size={12} className={isFlipped ? "rotate-180 transition-transform" : ""} />
                        {isFlipped ? "Answer" : "Question"}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="my-auto flex flex-col items-center justify-center text-center px-4">
                      <p className="text-lg sm:text-2xl font-bold leading-relaxed text-slate-800 dark:text-white">
                        {isFlipped ? currentCard?.back : currentCard?.front}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-[#64748b]">
                      <span>{isFlipped ? "Flip again for question" : "Tap anywhere to flip"}</span>
                      {cards.length > 0 && currentCard?.id && (
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
              )}
            </div>

            {/* Card Controls */}
            {cards.length > 0 && (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 rounded-2xl bg-white dark:bg-[#161b22] p-4 border border-slate-100 dark:border-white/[0.07] shadow-sm mb-6">
                {/* Navigation */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
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

                {/* SM-2 Spaced Repetition Response Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => handleRate("again")}
                    disabled={cards.length === 0}
                    className="flex flex-col items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/[0.1] hover:bg-rose-100 dark:hover:bg-rose-500/[0.18] text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/20 px-3 py-2 transition-all active:scale-95 disabled:opacity-50 min-w-[90px]"
                    title="Reset review streak (SM-2 Repeat)"
                  >
                    <span className="text-xs font-bold leading-none">Again</span>
                    <span className="text-[10px] opacity-75 font-medium mt-0.5">&lt;1 min</span>
                  </button>
                  <button
                    onClick={() => handleRate("hard")}
                    disabled={cards.length === 0}
                    className="flex flex-col items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] hover:bg-amber-100 dark:hover:bg-amber-500/[0.18] text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20 px-3 py-2 transition-all active:scale-95 disabled:opacity-50 min-w-[90px]"
                    title="Review tomorrow"
                  >
                    <span className="text-xs font-bold leading-none">Hard</span>
                    <span className="text-[10px] opacity-75 font-medium mt-0.5">1 day</span>
                  </button>
                  <button
                    onClick={() => handleRate("good")}
                    disabled={cards.length === 0}
                    className="flex flex-col items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.1] hover:bg-indigo-100 dark:hover:bg-indigo-500/[0.18] text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20 px-3 py-2 transition-all active:scale-95 disabled:opacity-50 min-w-[90px]"
                    title="Good recall (SM-2 scheduled)"
                  >
                    <span className="text-xs font-bold leading-none">Good</span>
                    <span className="text-[10px] opacity-75 font-medium mt-0.5">3 days</span>
                  </button>
                  <button
                    onClick={() => handleRate("easy")}
                    disabled={cards.length === 0}
                    className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.1] hover:bg-emerald-100 dark:hover:bg-emerald-500/[0.18] text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 px-3 py-2 transition-all active:scale-95 disabled:opacity-50 min-w-[90px]"
                    title="Mastered card (7+ days)"
                  >
                    <span className="text-xs font-bold leading-none">Easy</span>
                    <span className="text-[10px] opacity-75 font-medium mt-0.5">7 days</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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

              {/* Mode Selector Tabs: By Topic vs From Notes / Syllabus */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-[#1e2530] p-1 mb-4">
                <button
                  type="button"
                  onClick={() => { setAiMode("topic"); setAiError(""); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    aiMode === "topic"
                      ? "bg-white dark:bg-[#252d3a] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span>🔍</span> By Topic
                </button>
                <button
                  type="button"
                  onClick={() => { setAiMode("notes"); setAiError(""); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    aiMode === "notes"
                      ? "bg-white dark:bg-[#252d3a] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span>📄</span> From Notes / Syllabus
                </button>
              </div>

              <form onSubmit={handleGenerateAiDeck} className="space-y-4">
                {aiMode === "topic" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">
                        Topic / Concept / Chapter
                      </label>
                      <input
                        type="text"
                        required={aiMode === "topic"}
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
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">
                          Paste Lecture Slides, Notes or Syllabus
                        </label>
                        <span className="text-[10px] text-slate-400 dark:text-[#64748b]">
                          {aiNotes.length} chars
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        required={aiMode === "notes"}
                        value={aiNotes}
                        onChange={(e) => setAiNotes(e.target.value)}
                        placeholder="Paste lecture slides text, chapter summaries, syllabus guidelines, or study notes here..."
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-xs text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
                        disabled={aiLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                        Deck Subject / Title <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g. Biology Ch. 3: Cell Division, or Midterm Review"
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={aiLoading}
                      />
                    </div>
                  </>
                )}

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

        {/* ── CREATE CUSTOM DECK MODAL ── */}
        {isCreatingDeck && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setIsCreatingDeck(false)}
          >
            <form
              onSubmit={handleCreateDeck}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-white/[0.07]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400">
                    <FolderPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      Create Custom Deck
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                      Create a manual deck and add your first flashcard
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingDeck(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Deck Title *
                    </label>
                    <input
                      type="text"
                      value={newDeckData.title}
                      onChange={(e) => setNewDeckData({ ...newDeckData, title: e.target.value })}
                      placeholder="e.g. Operating Systems"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs font-medium text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Subject / Category
                    </label>
                    <input
                      type="text"
                      value={newDeckData.subject}
                      onChange={(e) => setNewDeckData({ ...newDeckData, subject: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs font-medium text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#1e2530]/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-[#cbd5e1]">
                      First Flashcard (Optional)
                    </span>
                    <span className="text-[11px] text-slate-400">Can add more later</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Front (Question / Concept)
                    </label>
                    <textarea
                      rows={2}
                      value={newDeckData.firstFront}
                      onChange={(e) => setNewDeckData({ ...newDeckData, firstFront: e.target.value })}
                      placeholder="e.g. What is a Deadlock?"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161b22] p-2.5 text-xs text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Back (Answer / Definition)
                    </label>
                    <textarea
                      rows={2}
                      value={newDeckData.firstBack}
                      onChange={(e) => setNewDeckData({ ...newDeckData, firstBack: e.target.value })}
                      placeholder="e.g. A state where processes are blocked because each holds a resource and waits for another."
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161b22] p-2.5 text-xs text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsCreatingDeck(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newDeckData.title.trim()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-40"
                >
                  <Plus size={14} /> Create Deck
                </button>
              </div>
            </form>
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
                Adding to deck: <span className="font-semibold text-indigo-600">{activeDeck?.title || "Custom Deck"}</span>
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
