import React, { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  Play,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { api } from "../api";

const SUGGESTED_TOPICS = [
  "Operating Systems",
  "Organic Chemistry",
  "World War II",
  "Macroeconomics",
  "Quantum Mechanics",
  "Python Algorithms",
];

export default function McqTestPage() {
  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("focusnest_mcq_quizzes");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Exclude old hardcoded default quiz if present
        return parsed.filter((q) => q.id !== "cs-default");
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeQuizId, setActiveQuizId] = useState(null);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [customQuestions, setCustomQuestions] = useState(null);
  const [isRetryingMissed, setIsRetryingMissed] = useState(false);
  const [reviewTab, setReviewTab] = useState("all");

  // Generator Modal state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(8);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiValidating, setAiValidating] = useState(false);
  const [aiAmbiguousOptions, setAiAmbiguousOptions] = useState([]);

  // Fetch quizzes from Cloud on mount if logged in, with fallback to local storage
  useEffect(() => {
    const token = localStorage.getItem("focusnest_token");
    if (!token) return;

    api
      .getQuizzes()
      .then(async (cloudQuizzes) => {
        if (Array.isArray(cloudQuizzes) && cloudQuizzes.length > 0) {
          setQuizzes(cloudQuizzes);
        } else {
          // Cloud has no quizzes yet. Check if there are local quizzes to migrate to cloud
          const saved = localStorage.getItem("focusnest_mcq_quizzes");
          if (saved) {
            try {
              const localQuizzes = JSON.parse(saved).filter((q) => q.id !== "cs-default");
              if (localQuizzes.length > 0) {
                const migrated = [];
                for (const lq of localQuizzes) {
                  try {
                    const savedQuiz = await api.createQuiz({
                      title: lq.title,
                      subject: lq.subject || lq.title,
                      difficulty: lq.difficulty || "Medium",
                      questions: lq.questions || [],
                      best_score: lq.best_score || null,
                    });
                    migrated.push(savedQuiz);
                  } catch (e) {
                    console.warn("Could not auto-migrate quiz:", e);
                  }
                }
                if (migrated.length > 0) {
                  setQuizzes(migrated);
                }
              }
            } catch (e) {
              console.error("Failed to parse local quizzes for migration", e);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load cloud quizzes:", err);
      });
  }, []);

  // Persist quizzes to localStorage for fast offline caching
  useEffect(() => {
    try {
      localStorage.setItem("focusnest_mcq_quizzes", JSON.stringify(quizzes));
    } catch (e) {
      console.error("Failed to save MCQ quizzes", e);
    }
  }, [quizzes]);

  const activeQuiz = activeQuizId
    ? quizzes.find((q) => String(q.id) === String(activeQuizId)) || null
    : null;
  const questions = customQuestions || activeQuiz?.questions || [];
  const currentQ = questions[currentQIndex] || null;

  // Missed questions calculation
  const missedQuestions = questions.filter((q, idx) => selectedAnswers[idx] !== q.correct);

  const handleStartQuiz = (quizId) => {
    setActiveQuizId(quizId);
    setCustomQuestions(null);
    setIsRetryingMissed(false);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setShowExplanation(false);
    setReviewTab("all");
  };

  const handleStartQuizMissed = (quiz) => {
    if (!quiz.last_missed || quiz.last_missed.length === 0) return;
    setActiveQuizId(quiz.id);
    setCustomQuestions(quiz.last_missed);
    setIsRetryingMissed(true);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setShowExplanation(false);
    setReviewTab("missed");
  };

  const handleRetakeMissed = (overrideMissed = null) => {
    const toRetake = overrideMissed || missedQuestions;
    if (!toRetake || toRetake.length === 0) return;
    setCustomQuestions(toRetake);
    setIsRetryingMissed(true);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setShowExplanation(false);
    setReviewTab("missed");
  };

  const handleSelectOption = (optIndex) => {
    if (isSubmitted || selectedAnswers[currentQIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optIndex,
    }));
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
      // Calculate final accuracy score
      const finalScore = questions.reduce((acc, q, idx) => {
        return selectedAnswers[idx] === q.correct ? acc + 1 : acc;
      }, 0);
      const finalPercentage = questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0;
      const finalMissed = questions.filter((q, idx) => selectedAnswers[idx] !== q.correct);

      if (!isRetryingMissed) {
        // Update quiz best_score and record last_missed locally
        setQuizzes((prev) =>
          prev.map((q) => {
            if (String(q.id) === String(activeQuizId)) {
              const updatedBest = q.best_score == null ? finalPercentage : Math.max(q.best_score, finalPercentage);
              return { ...q, best_score: updatedBest, last_missed: finalMissed };
            }
            return q;
          })
        );

        // Persist best score to cloud if logged in
        if (localStorage.getItem("focusnest_token") && typeof activeQuizId === "number") {
          try {
            await api.updateQuizScore(activeQuizId, finalPercentage);
          } catch (e) {
            console.warn("Failed to update quiz score in cloud", e);
          }
        }
      } else {
        // In missed practice mode, update last_missed with remaining missed questions
        setQuizzes((prev) =>
          prev.map((q) => {
            if (String(q.id) === String(activeQuizId)) {
              return { ...q, last_missed: finalMissed };
            }
            return q;
          })
        );
      }
    }
  };

  const handleRestart = () => {
    setCustomQuestions(null);
    setIsRetryingMissed(false);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setShowExplanation(false);
    setReviewTab("all");
  };

  const handleDeleteQuiz = async (quizId) => {
    const remaining = quizzes.filter((q) => String(q.id) !== String(quizId));
    setQuizzes(remaining);
    if (String(activeQuizId) === String(quizId)) {
      setActiveQuizId(null);
      setCustomQuestions(null);
      setIsRetryingMissed(false);
      handleRestart();
    }

    if (localStorage.getItem("focusnest_token") && typeof quizId === "number") {
      try {
        await api.deleteQuiz(quizId);
      } catch (err) {
        console.warn("Failed to delete quiz from cloud", err);
      }
    }
  };

  // Generate dynamic MCQ test via AI
  const handleGenerateAiQuiz = async (e) => {
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
      const data = await api.aiMcqs(aiTopic.trim(), aiDifficulty, aiCount);
      const generatedQuestions = data.questions || [];

      if (!generatedQuestions.length) {
        throw new Error("No MCQs were generated for this topic. Please try another topic or adjust difficulty.");
      }

      const quizPayload = {
        title: aiTopic.trim(),
        subject: aiTopic.trim().length > 22 ? aiTopic.trim().slice(0, 22) + "..." : aiTopic.trim(),
        difficulty: aiDifficulty,
        questions: generatedQuestions,
      };

      let newQuiz = null;
      if (localStorage.getItem("focusnest_token")) {
        try {
          newQuiz = await api.createQuiz(quizPayload);
        } catch (err) {
          console.warn("Cloud save AI quiz failed, saving locally:", err);
        }
      }

      if (!newQuiz) {
        newQuiz = {
          id: `ai-quiz-${Date.now()}`,
          ...quizPayload,
        };
      }

      setQuizzes((prev) => [newQuiz, ...prev]);
      setActiveQuizId(newQuiz.id);
      setSelectedAnswers({});
      setCurrentQIndex(0);
      setIsSubmitted(false);
      setShowExplanation(false);
      setIsGeneratingAi(false);
      setAiTopic("");
    } catch (err) {
      setAiError(err.message || "Failed to generate MCQs. Please verify your network.");
    } finally {
      setAiLoading(false);
    }
  };

  // Score calculation
  const score = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correct ? acc + 1 : acc;
  }, 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                <Brain size={20} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                MCQ Practice Test
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8]">
              Generate 8–10 tailored exam questions on any topic with instant feedback & explanations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGeneratingAi(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-200 dark:shadow-violet-950 transition-all active:scale-95"
            >
              <Sparkles size={16} /> Generate New Quiz
            </button>
          </div>
        </div>

        {/* ── VIEW 1: DASHBOARD / OVERVIEW (When no quiz is actively running) ── */}
        {!activeQuiz ? (
          quizzes.length === 0 ? (
            /* EMPTY STATE */
            <div className="rounded-3xl bg-white dark:bg-[#161b22] p-8 sm:p-14 shadow-lg border border-slate-100 dark:border-white/[0.07] text-center transition-all">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-200 dark:shadow-violet-950">
                <Brain size={40} />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-500/[0.12] px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-400 mb-3">
                <Sparkles size={13} /> AI Practice Quizzes
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                No Practice Quizzes Yet
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-[#94a3b8] max-w-md mx-auto">
                Create instant, exam-style multiple choice quizzes on any subject using Gemini AI with comprehensive explanations.
              </p>

              {/* Quick suggestions */}
              <div className="mt-6 mb-8">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Try popular topics
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {[
                    "Data Structures & Algorithms",
                    "Machine Learning & AI",
                    "Cell Biology & Genetics",
                    "Calculus & Derivatives",
                    "World History & Revolutions",
                    "Microeconomics Principles",
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setAiTopic(topic);
                        setIsGeneratingAi(true);
                      }}
                      className="rounded-full bg-slate-100 dark:bg-[#1e2530] hover:bg-violet-100 dark:hover:bg-violet-900/30 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 px-3.5 py-1.5 text-xs font-semibold transition-all border border-transparent hover:border-violet-300 dark:hover:border-violet-700/50"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsGeneratingAi(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 dark:shadow-violet-950 transition-all active:scale-95"
              >
                <Sparkles size={18} /> Generate Your First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Header: Quizzes Already Done / Created */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                    Your Practice Quizzes
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                    Review your completed quiz scores or restart practice
                  </p>
                </div>
                <span className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                  {quizzes.length} {quizzes.length === 1 ? "Quiz" : "Quizzes"}
                </span>
              </div>

              {/* Grid of Quizzes that were already created / done */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzes.map((quiz) => {
                  const hasScore = quiz.best_score != null;
                  return (
                    <div
                      key={quiz.id}
                      className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] p-5 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/30 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="rounded-lg bg-violet-50 dark:bg-violet-500/[0.12] px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                            {quiz.subject || "General"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-slate-400 dark:text-[#64748b]">
                              {quiz.difficulty || "Medium"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuiz(quiz.id);
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Delete Quiz"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-slate-800 dark:text-white mb-3 line-clamp-2">
                          {quiz.title}
                        </h3>

                        <div className="flex items-center gap-2.5 text-xs mb-4 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-[#94a3b8]">
                            <HelpCircle size={14} />
                            {quiz.questions?.length || 0} Questions
                          </span>
                          {hasScore ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                quiz.best_score >= 80
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                                  : quiz.best_score >= 50
                                  ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-500/20"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              <Trophy size={11} /> Score: {quiz.best_score}%
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full font-medium text-[11px] bg-slate-100 dark:bg-[#1e2530] text-slate-500 dark:text-slate-400">
                              Not attempted yet
                            </span>
                          )}
                        </div>
                      </div>

                      {hasScore && quiz.last_missed && quiz.last_missed.length > 0 ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold bg-slate-100 dark:bg-[#1e2530] hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white text-slate-700 dark:text-[#e2e8f0] transition-all"
                          >
                            <RotateCcw size={13} /> Retake All
                          </button>
                          <button
                            onClick={() => handleStartQuizMissed(quiz)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/30 transition-all"
                            title="Retake only the questions you answered incorrectly"
                          >
                            <AlertCircle size={13} /> Missed ({quiz.last_missed.length})
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                            hasScore
                              ? "bg-slate-100 dark:bg-[#1e2530] hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white text-slate-700 dark:text-[#e2e8f0]"
                              : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                          }`}
                        >
                          {hasScore ? (
                            <>
                              <RotateCcw size={14} /> Retake Quiz
                            </>
                          ) : (
                            <>
                              <Play size={14} /> Start Quiz
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Banner: Generate New Quiz below the list */}
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-gradient-to-br from-violet-50/60 to-indigo-50/60 dark:from-violet-950/20 dark:to-indigo-950/20 p-6 sm:p-8 text-center transition-all">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1">
                  Ready for another quiz?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8] mb-5 max-w-md mx-auto">
                  Generate tailored exam multiple-choice questions on any subject in seconds using Gemini AI.
                </p>
                <button
                  onClick={() => setIsGeneratingAi(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-200 dark:shadow-violet-950 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles size={16} /> Generate New Quiz
                </button>
              </div>
            </div>
          )
        ) : (
          /* ── VIEW 2: ACTIVE QUIZ PLAYER ── */
          <div>
            {/* Top Back Navigation Bar */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveQuizId(null);
                  setCustomQuestions(null);
                  setIsRetryingMissed(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-[#1e2530] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] shadow-2xs transition-all active:scale-95"
              >
                <ArrowLeft size={16} /> Back to All Quizzes
              </button>
              <div className="flex items-center gap-2">
                {isRetryingMissed && (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-3 py-1 text-xs font-bold flex items-center gap-1.5 border border-amber-300 dark:border-amber-700/50">
                    <AlertCircle size={13} /> Retaking Missed ({questions.length})
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500 dark:text-[#94a3b8] truncate max-w-xs sm:max-w-md hidden sm:inline">
                  {activeQuiz.title}
                </span>
              </div>
            </div>

            {/* QUIZ INTERFACE */}
            {!isSubmitted ? (
              <div className="rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-10 shadow-lg border border-slate-100 dark:border-white/[0.07] transition-all">
                {/* Top Bar: Progress & Counter */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-violet-50 dark:bg-violet-500/[0.15] px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-400">
                      {activeQuiz?.subject || "General"} · Question {currentQIndex + 1} of {questions.length}
                    </span>
                    {isRetryingMissed && (
                      <span className="rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                        <AlertCircle size={12} /> Missed Questions Only
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isRetryingMissed && (
                      <button
                        onClick={handleRestart}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline"
                      >
                        Exit to Full Quiz
                      </button>
                    )}
                    <span className="text-xs font-semibold text-slate-400 dark:text-[#64748b]">
                      {questions.length > 0
                        ? Math.round(((currentQIndex + 1) / questions.length) * 100)
                        : 0}% Complete
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#1e2530] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-300"
                    style={{
                      width: `${questions.length > 0 ? ((currentQIndex + 1) / questions.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                {/* Question Text */}
                <h2 className="mb-8 text-lg sm:text-xl font-bold leading-relaxed text-slate-800 dark:text-white">
                  {currentQ?.question}
                </h2>

                {/* Options List */}
                <div className="space-y-3 mb-8">
                  {currentQ?.options?.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQIndex] === idx;
                    const isCorrect = idx === currentQ.correct;
                    const hasAnswered = selectedAnswers[currentQIndex] !== undefined;

                    let optionStyles =
                      "border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1e2530]/60 hover:bg-slate-100 dark:hover:bg-[#1e2530] text-slate-700 dark:text-[#e2e8f0]";

                    if (hasAnswered) {
                      if (isCorrect) {
                        optionStyles =
                          "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/[0.1] text-emerald-700 dark:text-emerald-400 font-semibold";
                      } else if (isSelected && !isCorrect) {
                        optionStyles =
                          "border-rose-500 bg-rose-50 dark:bg-rose-500/[0.1] text-rose-700 dark:text-rose-400";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={hasAnswered}
                        className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left text-sm sm:text-base transition-all ${optionStyles} ${
                          hasAnswered ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#252d3a] font-bold text-xs shadow-sm">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {hasAnswered && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Note */}
                {showExplanation && currentQ?.explanation && (
                  <div className="mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-500/[0.12] border border-indigo-100 dark:border-indigo-500/20 p-4 text-xs sm:text-sm text-indigo-900 dark:text-indigo-400 animate-fadeIn">
                    <p className="font-bold mb-1 flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                      <HelpCircle size={15} /> Explanation
                    </p>
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.07]">
                  <span className="text-xs text-slate-400 dark:text-[#64748b]">
                    {selectedAnswers[currentQIndex] === undefined
                      ? "Select an option to see feedback"
                      : "Answer recorded"}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQIndex] === undefined}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 dark:shadow-violet-950/50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentQIndex < questions.length - 1 ? (
                      <>
                        Next Question <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        View Results <Trophy size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* RESULT SCREEN */
              <div className="space-y-6">
                <div className="rounded-3xl bg-white dark:bg-[#161b22] p-8 sm:p-12 shadow-xl border border-slate-100 dark:border-white/[0.07] text-center transition-all">
                  <div
                    className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg ${
                      isRetryingMissed
                        ? percentage === 100
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-emerald-950"
                          : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200 dark:shadow-amber-950"
                        : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-200 dark:shadow-violet-950"
                    }`}
                  >
                    <Trophy size={36} />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                    {isRetryingMissed
                      ? percentage === 100
                        ? "All Missed Questions Mastered!"
                        : "Missed Questions Practice Finished!"
                      : "Quiz Completed!"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#94a3b8]">
                    {isRetryingMissed ? (
                      <span>
                        You practiced {questions.length} missed{" "}
                        {questions.length === 1 ? "question" : "questions"} from{" "}
                        <span className="font-semibold text-violet-600">{activeQuiz?.title}</span>
                      </span>
                    ) : (
                      <span>
                        Here is how you performed on{" "}
                        <span className="font-semibold text-violet-600">{activeQuiz?.title}</span>
                      </span>
                    )}
                  </p>

                  <div className="my-8 flex justify-center gap-6">
                    <div className="rounded-2xl bg-slate-50 dark:bg-[#1e2530]/80 p-5 w-36">
                      <p className="text-xs font-semibold text-slate-400">Accuracy</p>
                      <p className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-1">{percentage}%</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-[#1e2530]/80 p-5 w-36">
                      <p className="text-xs font-semibold text-slate-400">Score</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                        {score} / {questions.length}
                      </p>
                    </div>
                  </div>

                  {/* Performance message */}
                  <div className="mb-8 inline-block rounded-2xl bg-slate-50 dark:bg-[#1e2530] px-6 py-3 text-sm text-slate-700 dark:text-[#cbd5e1]">
                    {percentage === 100 ? (
                      <span>🎉 <strong>Perfect Score!</strong> You've mastered all questions in this set!</span>
                    ) : percentage >= 80 ? (
                      <span>🎉 <strong>Outstanding!</strong> You have a strong grasp of this topic!</span>
                    ) : percentage >= 50 ? (
                      <span>👍 <strong>Good job!</strong> Retake missed questions to achieve 100% accuracy.</span>
                    ) : (
                      <span>📚 <strong>Keep practicing!</strong> Review the explanations below and retake missed questions.</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {missedQuestions.length > 0 && (
                      <button
                        onClick={() => handleRetakeMissed()}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-200 dark:shadow-amber-950/50 transition-all hover:scale-105 active:scale-95"
                      >
                        <RotateCcw size={16} /> Retake Missed Questions ({missedQuestions.length})
                      </button>
                    )}
                    <button
                      onClick={handleRestart}
                      className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 dark:shadow-violet-950/50 transition-all active:scale-95"
                    >
                      <RotateCcw size={16} /> Retake Full Quiz
                    </button>
                    <button
                      onClick={() => {
                        setActiveQuizId(null);
                        setCustomQuestions(null);
                        setIsRetryingMissed(false);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-[#1e2530] px-6 py-3 text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] transition-all active:scale-95"
                    >
                      <ArrowLeft size={16} /> Back to All Quizzes
                    </button>
                    <button
                      onClick={() => setIsGeneratingAi(true)}
                      className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#252d3a] px-6 py-3 text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] transition-all active:scale-95"
                    >
                      <Sparkles size={16} /> Generate Another Quiz
                    </button>
                  </div>
                </div>

                {/* Detailed Question Review Section */}
                <div className="rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/[0.07] text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/[0.07]">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        Question Breakdown & Explanations
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                        Review answers, errors, and key concepts
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#1e2530] text-xs font-semibold self-start sm:self-auto">
                      <button
                        onClick={() => setReviewTab("all")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          reviewTab === "all"
                            ? "bg-white dark:bg-[#161b22] text-violet-700 dark:text-violet-300 shadow-2xs font-bold"
                            : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        All ({questions.length})
                      </button>
                      <button
                        onClick={() => setReviewTab("missed")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          reviewTab === "missed"
                            ? "bg-white dark:bg-[#161b22] text-amber-700 dark:text-amber-400 shadow-2xs font-bold"
                            : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Missed Only ({missedQuestions.length})
                      </button>
                    </div>
                  </div>

                  {/* Question Cards */}
                  <div className="space-y-4">
                    {(reviewTab === "missed" ? missedQuestions : questions).map((q, qIdx) => {
                      const origIdx = questions.indexOf(q);
                      const userChoice = selectedAnswers[origIdx];
                      const isCorrect = userChoice === q.correct;

                      return (
                        <div
                          key={qIdx}
                          className={`rounded-2xl p-5 border transition-all ${
                            isCorrect
                              ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-500/20"
                              : "bg-rose-50/30 dark:bg-rose-950/10 border-rose-200/60 dark:border-rose-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#64748b]">
                              Question {origIdx + 1}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isCorrect
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                  : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 size={12} /> Correct
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} /> Incorrect
                                </>
                              )}
                            </span>
                          </div>

                          <p className="font-bold text-slate-800 dark:text-white mb-3 text-sm sm:text-base">
                            {q.question}
                          </p>

                          {/* Options display */}
                          <div className="space-y-2 mb-3">
                            {q.options?.map((opt, optIdx) => {
                              const isUserSelected = userChoice === optIdx;
                              const isOptionCorrect = optIdx === q.correct;

                              let optClass =
                                "border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#161b22] text-slate-700 dark:text-[#cbd5e1]";

                              if (isOptionCorrect) {
                                optClass =
                                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold";
                              } else if (isUserSelected && !isOptionCorrect) {
                                optClass =
                                  "border-rose-400 bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 line-through opacity-85";
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs sm:text-sm ${optClass}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-bold text-xs opacity-70">
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                  {isOptionCorrect && (
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 size={13} /> Correct Answer
                                    </span>
                                  )}
                                  {isUserSelected && !isOptionCorrect && (
                                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                      <XCircle size={13} /> Your Answer
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="rounded-xl bg-white dark:bg-[#161b22] border border-slate-200/80 dark:border-white/[0.06] p-3 text-xs text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                              <span className="font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 mb-0.5">
                                <HelpCircle size={13} /> Explanation:
                              </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {reviewTab === "missed" && missedQuestions.length === 0 && (
                      <div className="text-center py-8 text-slate-400 dark:text-[#64748b]">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-white">
                          No missed questions!
                        </p>
                        <p className="text-xs">You got every question right on this attempt.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI QUIZ GENERATOR MODAL ── */}
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/[0.12] text-violet-600 dark:text-violet-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      AI MCQ Quiz Generator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                      Enter any topic to generate 8–10 custom multiple-choice questions
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

              <form onSubmit={handleGenerateAiQuiz} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1.5">
                    Quiz Topic / Exam Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. Python OOP, French Revolution, Organic Chemistry, Microeconomics"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={aiLoading}
                  />
                </div>

                {/* Popular topic suggestions */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 dark:text-[#64748b] mb-1.5">
                    Popular exam topics:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setAiTopic(topic)}
                        disabled={aiLoading}
                        className="rounded-lg bg-slate-100 dark:bg-[#1e2530] hover:bg-violet-50 dark:hover:bg-violet-500/[0.15] hover:text-violet-600 dark:hover:text-violet-400 px-2.5 py-1 text-xs text-slate-600 dark:text-[#cbd5e1] transition-colors"
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
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs font-medium text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="Easy">Easy (Recall & Basics)</option>
                      <option value="Medium">Medium (Conceptual)</option>
                      <option value="Hard">Hard (Advanced & Tricky)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Question Count
                    </label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      disabled={aiLoading}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-2.5 text-xs font-medium text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value={8}>8 Questions</option>
                      <option value={10}>10 Questions</option>
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
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles size={14} className={aiLoading || aiValidating ? "animate-spin" : ""} />
                    {aiValidating ? "Validating topic..." : aiLoading ? "Generating MCQs..." : "Generate Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
