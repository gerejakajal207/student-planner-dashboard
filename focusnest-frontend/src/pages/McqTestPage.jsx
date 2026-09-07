import React, { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "../api";

const DEFAULT_QUIZZES = [
  {
    id: "cs-default",
    title: "Data Structures & CS Foundations",
    subject: "Computer Science",
    difficulty: "Medium",
    questions: [
      {
        id: 1,
        question: "Which data structure follows the Last-In-First-Out (LIFO) principle?",
        options: ["Queue", "Stack", "Binary Search Tree", "Linked List"],
        correct: 1,
        explanation: "A Stack adds and removes elements from the same end (the top), adhering to LIFO.",
      },
      {
        id: 2,
        question: "What is the worst-case lookup time in a Hash Table with high collision rate?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: 2,
        explanation: "In the worst case (all keys collide into the same bucket/chain), lookup degrades to linear time O(n).",
      },
      {
        id: 3,
        question: "Which sorting algorithm is guaranteed to have O(n log n) worst-case time complexity?",
        options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
        correct: 2,
        explanation: "Merge Sort consistently divides the array in half and merges them in linear time, guaranteeing O(n log n).",
      },
      {
        id: 4,
        question: "What does the 'P vs NP' problem primarily investigate?",
        options: [
          "Whether every problem whose solution can be verified quickly can also be solved quickly",
          "Whether quantum computers can break RSA encryption",
          "The execution speed difference between Python and C++",
          "The maximum size limit of neural network parameters",
        ],
        correct: 0,
        explanation: "P is the set of problems solvable in polynomial time, while NP problems are verifiable in polynomial time.",
      },
    ],
  },
];

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
      return saved ? JSON.parse(saved) : DEFAULT_QUIZZES;
    } catch {
      return DEFAULT_QUIZZES;
    }
  });

  const [selectedQuizId, setSelectedQuizId] = useState(() => {
    return quizzes[0]?.id || "cs-default";
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Generator Modal state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(8);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiValidating, setAiValidating] = useState(false);
  const [aiAmbiguousOptions, setAiAmbiguousOptions] = useState([]);

  // Persist quizzes
  useEffect(() => {
    try {
      localStorage.setItem("focusnest_mcq_quizzes", JSON.stringify(quizzes));
    } catch (e) {
      console.error("Failed to save MCQ quizzes", e);
    }
  }, [quizzes]);

  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0] || {
    id: "empty",
    title: "No Quiz",
    subject: "General",
    questions: [],
  };

  const questions = activeQuiz.questions || [];
  const currentQ = questions[currentQIndex] || {
    question: "No questions available. Click 'Generate AI Quiz' above to get started!",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: 0,
    explanation: "Click generate to test your knowledge on any subject.",
  };

  const handleSelectOption = (optIndex) => {
    if (isSubmitted || selectedAnswers[currentQIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optIndex,
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setShowExplanation(false);
  };

  const handleDeleteQuiz = (quizId) => {
    if (quizzes.length <= 1) {
      alert("You need at least one quiz in your list.");
      return;
    }
    const remaining = quizzes.filter((q) => q.id !== quizId);
    setQuizzes(remaining);
    if (selectedQuizId === quizId) {
      setSelectedQuizId(remaining[0].id);
      handleRestart();
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

      const newQuiz = {
        id: `ai-quiz-${Date.now()}`,
        title: aiTopic.trim(),
        subject: aiTopic.trim().length > 22 ? aiTopic.trim().slice(0, 22) + "..." : aiTopic.trim(),
        difficulty: aiDifficulty,
        questions: generatedQuestions,
      };

      setQuizzes((prev) => [newQuiz, ...prev]);
      setSelectedQuizId(newQuiz.id);
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
            <div className="flex items-center gap-2">
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
              <Sparkles size={16} /> Generate AI Quiz
            </button>
          </div>
        </div>

        {/* Quiz Topic Selector Bar */}
        <div className="mb-6 flex overflow-x-auto pb-2 gap-2.5">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="relative group flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedQuizId(quiz.id);
                  handleRestart();
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedQuizId === quiz.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-950/50"
                    : "bg-white dark:bg-[#161b22] text-slate-700 dark:text-[#cbd5e1] border border-slate-200 dark:border-white/[0.07] hover:bg-slate-100 dark:hover:bg-[#1e2530]"
                }`}
              >
                <span>{quiz.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    selectedQuizId === quiz.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-[#1e2530] text-slate-500 dark:text-[#94a3b8]"
                  }`}
                >
                  {quiz.questions?.length || 0} Qs
                </span>
              </button>

              {quizzes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuiz(quiz.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm text-[10px] hover:bg-rose-600 transition-all"
                  title="Delete Quiz"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* QUIZ INTERFACE */}
        {!isSubmitted ? (
          <div className="rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-10 shadow-lg border border-slate-100 dark:border-white/[0.07] transition-all">
            {/* Top Bar: Progress & Counter */}
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-violet-50 dark:bg-violet-500/[0.15] px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-400">
                {activeQuiz.subject} · Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-[#64748b]">
                {questions.length > 0
                  ? Math.round(((currentQIndex + 1) / questions.length) * 100)
                  : 0}% Complete
              </span>
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
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, idx) => {
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
            {showExplanation && (
              <div className="mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-500/[0.12] border border-indigo-100 dark:border-indigo-500/20/40 p-4 text-xs sm:text-sm text-indigo-900 dark:text-indigo-400 animate-fadeIn">
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
          <div className="rounded-3xl bg-white dark:bg-[#161b22] p-8 sm:p-12 shadow-xl border border-slate-100 dark:border-white/[0.07] text-center transition-all">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-950">
              <Trophy size={36} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              Quiz Completed!
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#94a3b8]">
              Here is how you performed on <span className="font-semibold text-violet-600">{activeQuiz.title}</span>
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
              {percentage >= 80 ? (
                <span>🎉 <strong>Outstanding!</strong> You've mastered this topic!</span>
              ) : percentage >= 50 ? (
                <span>👍 <strong>Good job!</strong> Review the explanations to achieve perfection.</span>
              ) : (
                <span>📚 <strong>Keep practicing!</strong> Try generating a flashcard deck on this topic.</span>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 dark:shadow-violet-950/50 transition-all active:scale-95"
              >
                <RotateCcw size={16} /> Retake Quiz
              </button>
              <button
                onClick={() => setIsGeneratingAi(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#252d3a] px-6 py-3 text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] transition-all active:scale-95"
              >
                <Sparkles size={16} /> Generate Another Topic
              </button>
            </div>
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
