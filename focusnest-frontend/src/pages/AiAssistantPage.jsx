import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Calendar,
  Layers,
  Plus,
  Lightbulb,
  Copy,
  Check,
  CheckCircle2,
  BookOpen,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useTasks } from "../components/TaskContext";
import { api } from "../api";

// ── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "success"
      ? "bg-emerald-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : "bg-indigo-500 text-white";

  const Icon = type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Sparkles;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl text-sm font-semibold animate-fade-in-up ${colors}`}
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <Icon size={18} />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-75 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ── Markdown renderer with consistent styling ────────────────────────────────
function MarkdownContent({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white mt-4 mb-2 border-b border-slate-200 dark:border-white/[0.1] pb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-4 mb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold text-indigo-700 dark:text-indigo-400 mt-3 mb-1">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] mt-2 mb-1">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="text-sm text-slate-700 dark:text-[#cbd5e1] leading-relaxed mb-2">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-slate-700 dark:text-[#cbd5e1] pl-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-slate-700 dark:text-[#cbd5e1] pl-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-600 dark:text-[#94a3b8]">{children}</em>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="rounded bg-indigo-50 dark:bg-indigo-500/[0.15] text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 text-xs font-mono">
              {children}
            </code>
          ) : (
            <pre className="rounded-xl bg-slate-100 dark:bg-[#1e2530] p-4 overflow-x-auto text-xs font-mono text-slate-800 dark:text-[#e2e8f0] mb-3">
              <code>{children}</code>
            </pre>
          ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 pl-4 italic text-slate-600 dark:text-[#94a3b8] my-3">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-slate-200 dark:border-white/[0.1] my-4" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AiAssistantPage() {
  const { addTask } = useTasks();

  const [activeTab, setActiveTab] = useState("schedule");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Validation state (shared across tabs) ──
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(""); // invalid message
  const [ambiguousOptions, setAmbiguousOptions] = useState([]); // ambiguous options

  // Runs validation then calls the actual generator; returns true if should proceed
  const runWithValidation = async (topic, generator) => {
    if (!topic.trim()) return;
    setValidating(true);
    setValidationError("");
    setAmbiguousOptions([]);
    try {
      const v = await api.validateTopic(topic.trim());
      if (v.status === "invalid") {
        setValidationError(v.message || "That doesn't seem like a valid study topic.");
        return;
      }
      if (v.status === "ambiguous") {
        setValidationError(v.message || "This topic is ambiguous. Please clarify:");
        setAmbiguousOptions(v.options || []);
        return;
      }
    } catch {
      // validation failed — allow through
    } finally {
      setValidating(false);
    }
    await generator();
  };

  // ── Schedule tab state ──
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState(2);

  // Schedule result — structured from backend
  const [scheduleResult, setScheduleResult] = useState(null); // { summary, daily_tasks, exam_task, total_prep_days, ... }

  // ── Breakdown tab state ──
  const [breakdownPrompt, setBreakdownPrompt] = useState("");
  const [breakdownResult, setBreakdownResult] = useState(null); // { summary, tasks[] }

  // ── Explain tab state ──
  const [explainPrompt, setExplainPrompt] = useState("");
  const [explainResult, setExplainResult] = useState(null); // { explanation }

  const todayStr = new Date().toISOString().split("T")[0];

  // Derived: which result is active for copy/display
  const activeMarkdown =
    activeTab === "schedule"
      ? scheduleResult?.summary || ""
      : activeTab === "breakdown"
      ? breakdownResult?.summary || ""
      : explainResult?.explanation || "";

  const hasResult =
    activeTab === "schedule"
      ? !!scheduleResult
      : activeTab === "breakdown"
      ? !!breakdownResult
      : !!explainResult;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    if (!examDate) { showToast("Please select an exam date.", "error"); return; }
    if (examDate < todayStr) { showToast("Exam date cannot be in the past.", "error"); return; }
    await runWithValidation(subject, async () => {
      setLoading(true);
      setScheduleResult(null);
      setScheduleAdded(false);
      try {
        const result = await api.aiSchedule(subject.trim(), examDate, dailyHours, todayStr);
        setScheduleResult(result);
      } catch (err) {
        showToast(`Failed to generate plan: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGenerateBreakdown = async (e) => {
    e.preventDefault();
    if (!breakdownPrompt.trim()) return;
    await runWithValidation(breakdownPrompt, async () => {
      setLoading(true);
      setBreakdownResult(null);
      try {
        const result = await api.aiBreakdown(breakdownPrompt.trim());
        setBreakdownResult(result);
      } catch (err) {
        showToast(`Failed to break down task: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGenerateExplain = async (e) => {
    e.preventDefault();
    if (!explainPrompt.trim()) return;
    await runWithValidation(explainPrompt, async () => {
      setLoading(true);
      setExplainResult(null);
      try {
        const result = await api.aiExplain(explainPrompt.trim());
        setExplainResult(result);
      } catch (err) {
        showToast(`Failed to explain concept: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCopy = () => {
    if (!activeMarkdown) return;
    navigator.clipboard.writeText(activeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add all daily study tasks + exam task to Kanban/Calendar
  const [addingToSchedule, setAddingToSchedule] = useState(false);
  const [scheduleAdded, setScheduleAdded] = useState(false);

  const handleAddToSchedule = async () => {
    if (!scheduleResult || addingToSchedule || scheduleAdded) return;
    setAddingToSchedule(true);

    const { daily_tasks, exam_task } = scheduleResult;
    const allItems = [...daily_tasks, exam_task];

    // Try batch endpoint first; if it fails fall back to individual addTask calls
    try {
      await api.aiBatchAddTasks(
        allItems.map((t) => ({
          title: t.title,
          description: t.description || "",
          subject: subject.trim(),
          category: t.category || "Class",
          priority: t.priority || "Medium",
          effort: t.effort || "Medium",
          due_date: t.due_date,
        }))
      );
      // Refresh local task list so Kanban/Calendar update immediately
      for (const t of daily_tasks) {
        await addTask({ taskName: t.title, taskDescription: t.description || "", taskDueDate: t.date, subject: subject.trim(), category: t.category || "Class", priority: t.priority || "Medium", effort: t.effort || "Medium" });
      }
      await addTask({ taskName: exam_task.title, taskDescription: exam_task.description || "", taskDueDate: exam_task.date, subject: subject.trim(), category: "Exam", priority: "High", effort: "High" });
    } catch {
      // batch-add failed — try individual adds as fallback
      try {
        for (const t of daily_tasks) {
          await addTask({ taskName: t.title, taskDescription: t.description || "", taskDueDate: t.date, subject: subject.trim(), category: t.category || "Class", priority: t.priority || "Medium", effort: t.effort || "Medium" });
        }
        await addTask({ taskName: exam_task.title, taskDescription: exam_task.description || "", taskDueDate: exam_task.date, subject: subject.trim(), category: "Exam", priority: "High", effort: "High" });
      } catch (fallbackErr) {
        showToast(`Failed to add tasks: ${fallbackErr.message}`, "error");
        setAddingToSchedule(false);
        return;
      }
    }

    setAddingToSchedule(false);
    setScheduleAdded(true);
    showToast(`${allItems.length} tasks added to your schedule!`, "success");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/[0.12] text-amber-600 dark:text-amber-400">
              <Sparkles size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              AI Study Assistant
            </h1>
          </div>

        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-2xl bg-white dark:bg-[#161b22] p-1.5 border border-slate-200 dark:border-white/[0.07] shadow-sm gap-1 overflow-x-auto">
          {[
            { id: "schedule", icon: Calendar, label: "Study Plan Generator" },
            { id: "breakdown", icon: Layers, label: "Task Breakdown" },
            { id: "explain", icon: Lightbulb, label: "Concept Explainer" },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setValidationError("");
                  setAmbiguousOptions([]);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50"
                    : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#1e2530]"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Input Panel ── */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-sm border border-slate-100 dark:border-white/[0.07]">

            {/* Schedule Form */}
            {activeTab === "schedule" && (
              <form onSubmit={handleGenerateSchedule} className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Exam Study Roadmap
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Subject or Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Organic Chemistry, Algorithms"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Daily Hours Available:{" "}
                    <span className="font-bold text-indigo-600">{dailyHours} hrs</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={0.5}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>1 hr</span>
                    <span>8 hrs</span>
                  </div>
                </div>

                {/* Date info pill */}
                {examDate && (
                  <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.12] border border-indigo-100 dark:border-indigo-500/20 px-3 py-2">
                    <Clock size={14} className="text-indigo-500 shrink-0" />
                    <span className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                      {(() => {
                        const today = new Date(todayStr);
                        const exam = new Date(examDate);
                        const days = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
                        return days === 0
                          ? "Exam is today!"
                          : days === 1
                          ? "1 day of preparation"
                          : `${days} days of preparation · ${(days * dailyHours).toFixed(1)} total hrs`;
                      })()}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || validating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {validating ? "Validating topic..." : loading ? "Generating Roadmap..." : "Generate Study Roadmap"}
                </button>

                {/* Validation feedback */}
                {validationError && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] border border-amber-200 dark:border-amber-500/20 p-3">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">{validationError}</p>
                    {ambiguousOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ambiguousOptions.map((opt, i) => (
                          <button key={i} type="button"
                            onClick={() => { setSubject(opt); setValidationError(""); setAmbiguousOptions([]); }}
                            className="text-xs bg-white dark:bg-[#1e2530] border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg px-2.5 py-1 hover:bg-amber-50 dark:hover:bg-amber-500/[0.12] transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}

            {/* Breakdown Form */}
            {activeTab === "breakdown" && (
              <form onSubmit={handleGenerateBreakdown} className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Deconstruct Complex Task
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Assignment or Project Prompt
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={breakdownPrompt}
                    onChange={(e) => { setBreakdownPrompt(e.target.value); setValidationError(""); setAmbiguousOptions([]); }}
                    placeholder="e.g. Build a full-stack React and FastAPI student productivity app with calendar and Kanban board..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || validating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {validating ? "Validating topic..." : loading ? "Deconstructing..." : "Break Down into Tasks"}
                </button>
                {validationError && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] border border-amber-200 dark:border-amber-500/20 p-3">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">{validationError}</p>
                    {ambiguousOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ambiguousOptions.map((opt, i) => (
                          <button key={i} type="button"
                            onClick={() => { setBreakdownPrompt(opt); setValidationError(""); setAmbiguousOptions([]); }}
                            className="text-xs bg-white dark:bg-[#1e2530] border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg px-2.5 py-1 hover:bg-amber-50 dark:hover:bg-amber-500/[0.12] transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}

            {/* Explain Form */}
            {activeTab === "explain" && (
              <form onSubmit={handleGenerateExplain} className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Concept Simplifier
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Topic or Question to Explain
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={explainPrompt}
                    onChange={(e) => { setExplainPrompt(e.target.value); setValidationError(""); setAmbiguousOptions([]); }}
                    placeholder="e.g. Explain how Dijkstra's algorithm finds the shortest path, and why negative weights cause it to fail."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] p-3 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || validating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {validating ? "Validating topic..." : loading ? "Thinking..." : "Explain Concept"}
                </button>
                {validationError && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] border border-amber-200 dark:border-amber-500/20 p-3">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">{validationError}</p>
                    {ambiguousOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ambiguousOptions.map((opt, i) => (
                          <button key={i} type="button"
                            onClick={() => { setExplainPrompt(opt); setValidationError(""); setAmbiguousOptions([]); }}
                            className="text-xs bg-white dark:bg-[#1e2530] border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg px-2.5 py-1 hover:bg-amber-50 dark:hover:bg-amber-500/[0.12] transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* ── Output Panel ── */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-sm border border-slate-100 dark:border-white/[0.07] flex flex-col min-h-[480px]">

            {/* Panel header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.07] mb-1 shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-2.5 w-2.5 rounded-full ${
                    loading ? "bg-amber-400 animate-pulse" : hasResult ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {loading ? "Generating..." : hasResult ? "AI Response" : "Gemini Response"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {hasResult && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
                    title="Copy response"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                )}

                {/* Add to Schedule — only on schedule tab with a result */}
                {activeTab === "schedule" && scheduleResult && !loading && (
                  <button
                    onClick={handleAddToSchedule}
                    disabled={addingToSchedule || scheduleAdded}
                    className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors shadow-sm disabled:cursor-not-allowed ${
                      scheduleAdded
                        ? "bg-emerald-100 dark:bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-400"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {scheduleAdded ? (
                      <><CheckCircle2 size={13} /> Added!</>
                    ) : addingToSchedule ? (
                      <><Sparkles size={13} className="animate-spin" /> Adding...</>
                    ) : (
                      <><Plus size={13} /> Add to Schedule</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* AI disclaimer */}
            <p className="text-[10px] text-slate-400 dark:text-[#64748b] mb-3 shrink-0">
              AI can make mistakes. Check important information.
            </p>

            {/* ── Loading State ── */}
            {loading && (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/[0.15] text-indigo-600 mb-4">
                  <Sparkles size={28} className="animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                  Gemini is thinking...
                </p>
                <p className="text-xs text-slate-400 dark:text-[#64748b]">
                  This may take a few seconds
                </p>
              </div>
            )}

            {/* ── Empty State ── */}
            {!loading && !hasResult && (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#1e2530] text-slate-400 dark:text-[#64748b] mb-4">
                  <BookOpen size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
                  Your AI response will appear here
                </p>
                <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1">
                  Fill in the form and click generate
                </p>
              </div>
            )}

            {/* ── Schedule Result ── */}
            {!loading && activeTab === "schedule" && scheduleResult && (
              <div className="flex-1 overflow-y-auto">
                {/* Stats row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/[0.12] px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    <Calendar size={12} />
                    {scheduleResult.total_prep_days} prep day{scheduleResult.total_prep_days !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/[0.1] px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
                    <Clock size={12} />
                    {dailyHours} hrs/day · {(scheduleResult.total_prep_days * dailyHours).toFixed(1)} total hrs
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/[0.1] px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
                    <Sparkles size={12} />
                    Exam: {scheduleResult.exam_date}
                  </span>
                </div>

                {/* Markdown summary */}
                <div className="mb-5">
                  <MarkdownContent>{scheduleResult.summary}</MarkdownContent>
                </div>

                {/* Daily task cards */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-[#94a3b8] uppercase tracking-wider mb-2">
                    Daily Tasks ({scheduleResult.daily_tasks.length})
                  </h4>
                  {scheduleResult.daily_tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1e2530]/50 p-3"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/[0.15] text-indigo-700 dark:text-indigo-400 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-0.5 line-clamp-2">
                          {task.description}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/[0.12] px-2 py-0.5 rounded-full">
                          {task.date}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === "High"
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-500/[0.1] dark:text-rose-400"
                            : task.priority === "Low"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/[0.1] dark:text-emerald-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-500/[0.1] dark:text-amber-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}

                  {/* Exam task */}
                  <div className="flex items-start gap-3 rounded-xl border-2 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/[0.08] p-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold mt-0.5">
                      🎯
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-rose-800 dark:text-rose-400 truncate">
                        {scheduleResult.exam_task.title}
                      </p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                        {scheduleResult.exam_task.description}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/[0.1] px-2 py-0.5 rounded-full">
                        {scheduleResult.exam_task.date}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/[0.1] dark:text-rose-400">
                      EXAM
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Breakdown Result ── */}
            {!loading && activeTab === "breakdown" && breakdownResult && (
              <div className="flex-1 overflow-y-auto">
                {/* Summary markdown */}
                {breakdownResult.summary && (
                  <div className="mb-5">
                    <MarkdownContent>{breakdownResult.summary}</MarkdownContent>
                  </div>
                )}

                {/* Subtask cards */}
                {Array.isArray(breakdownResult.tasks) && breakdownResult.tasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-[#94a3b8] uppercase tracking-wider mb-2">
                      Subtasks ({breakdownResult.tasks.length})
                    </h4>
                    {breakdownResult.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1e2530]/50 p-3"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/[0.15] text-indigo-700 dark:text-indigo-400 text-xs font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-0.5">
                            {task.description}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.priority === "High"
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-500/[0.1] dark:text-rose-400"
                                : task.priority === "Low"
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/[0.1] dark:text-emerald-400"
                                : "bg-amber-100 text-amber-600 dark:bg-amber-500/[0.1] dark:text-amber-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-[#64748b]">
                            Effort: {task.effort}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Explain Result ── */}
            {!loading && activeTab === "explain" && explainResult && (
              <div className="flex-1 overflow-y-auto">
                <MarkdownContent>{explainResult.explanation}</MarkdownContent>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fade-in-up keyframe */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
