import { useState } from "react";
import { Plus, Flame, BookOpen, CheckCircle2, Circle, Edit2, Trash2, Zap, Clock, Filter } from "lucide-react";
import Pomodoro from "../components/Pomodoro";
import QuoteCard from "../components/QuoteCard";
import ProgressCard from "../components/todays-mode/ProgressCard";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTasks } from "../components/TaskContext";
import { useTimer } from "../components/TimerContext";

function isToday(date) {
  if (!date) return false;
  const t = new Date();
  const d = new Date(date);
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

const CATEGORY_COLORS = {
  Exam:       { bar: "bg-rose-500",    badge: "bg-rose-50 dark:bg-rose-500/[0.1] text-rose-600 dark:text-rose-400" },
  Assignment: { bar: "bg-amber-500",  badge: "bg-amber-50 dark:bg-amber-500/[0.1] text-amber-600 dark:text-amber-400" },
  Class:      { bar: "bg-emerald-500", badge: "bg-emerald-50 dark:bg-emerald-500/[0.1] text-emerald-600 dark:text-emerald-400" },
  Hobby:      { bar: "bg-pink-500",   badge: "bg-pink-50 dark:bg-pink-500/[0.1] text-pink-600 dark:text-pink-400" },
};

const PRIORITY_STYLES = {
  High:   { text: "text-rose-500",   bg: "bg-rose-50 dark:bg-rose-500/[0.1]",   dot: "bg-rose-500" },
  Medium: { text: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/[0.1]", dot: "bg-amber-500" },
  Low:    { text: "text-slate-400", bg: "bg-slate-100 dark:bg-[#1e2530]",   dot: "bg-slate-400" },
};

function TaskRow({ task, onEdit, onToggleStatus, onDelete }) {
  const cat = CATEGORY_COLORS[task.category] ?? { bar: "bg-slate-400", badge: "bg-slate-100 dark:bg-[#1e2530] text-slate-500" };
  const pri = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
  const isDone = task.status === "Done";

  return (
    <div
      className={`group flex items-center gap-3 sm:gap-4 rounded-2xl border bg-white dark:bg-[#161b22] px-4 py-3.5 shadow-sm transition-all duration-150
        ${isDone ? "border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/[0.04] opacity-75" : "border-slate-100 dark:border-white/[0.07] hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-md"}
      `}
    >
      {/* Checkbox toggle */}
      <button
        onClick={() => onToggleStatus(task.id, isDone ? "Todo" : "Done")}
        className="flex-shrink-0 text-slate-300 hover:text-emerald-500 dark:text-[#475569] dark:hover:text-emerald-400 transition-colors"
        title={isDone ? "Mark as Todo" : "Mark as Done"}
      >
        {isDone ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
      </button>

      {/* Category accent bar */}
      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${cat.bar}`} />

      {/* Icon */}
      <div className={`hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${cat.badge.split(" ")[0]}`}>
        <BookOpen className="h-4 w-4" />
      </div>

      {/* Title + subject */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <p className={`text-sm font-semibold text-slate-800 dark:text-white truncate ${isDone ? "line-through text-slate-400 dark:text-[#64748b]" : ""}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 dark:text-[#64748b] truncate">{task.subject}</span>
          <span className="text-slate-300 dark:text-slate-700 text-xs">·</span>
          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${cat.badge}`}>
            {task.category}
          </span>
        </div>
      </div>

      {/* Priority */}
      <div className={`hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 ${pri.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
        <span className={`text-xs font-semibold ${pri.text}`}>{task.priority}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
          title="Edit task"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TodaysPage() {
  const { tasks, addTask, editTask, updateTaskStatus, deleteTask } = useTasks();
  const { isRunning, startTimer, pauseTimer } = useTimer();

  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterMode, setFilterMode] = useState("all"); // "all" | "high" | "pending"

  const todayTasks = tasks.filter((t) => isToday(t.date));

  // Smart Workload Metrics
  const highPriorityCount = todayTasks.filter((t) => t.priority === "High").length;
  const highEffortCount = todayTasks.filter((t) => t.effort === "High").length;
  const estimatedHours = todayTasks.reduce((acc, t) => {
    if (t.effort === "High") return acc + 2.0;
    if (t.effort === "Low") return acc + 0.5;
    return acc + 1.0;
  }, 0);

  const isHeavyDay = todayTasks.length >= 5 || estimatedHours >= 5 || highEffortCount >= 2;
  const isModerateDay = !isHeavyDay && (todayTasks.length >= 3 || estimatedHours >= 2.5);

  const doneTasks = todayTasks.filter((t) => t.status === "Done");
  const pendingTasks = todayTasks.filter((t) => t.status !== "Done");
  const completionPct = todayTasks.length > 0
    ? Math.round((doneTasks.length / todayTasks.length) * 100)
    : 0;

  // Filter tasks based on student view
  const displayedTasks = todayTasks
    .filter((t) => {
      if (filterMode === "high") return t.priority === "High";
      if (filterMode === "pending") return t.status !== "Done";
      return true;
    })
    .sort((a, b) => {
      if (a.status === "Done" && b.status !== "Done") return 1;
      if (a.status !== "Done" && b.status === "Done") return -1;
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      <div className="mx-auto max-w-7xl pb-12">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] shadow-sm px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-50 dark:bg-indigo-500/[0.08] opacity-50 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-5 text-center">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white sm:text-3xl">Today's Mode</h1>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-[#64748b] mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <QuoteCard />
            </div>
            <button
              onClick={() => {
                setEditingTask(null);
                setOpenTaskModal(true);
              }}
              className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95"
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* ── SMART WORKLOAD ADVISOR (Option A) ── */}
        {isHeavyDay && (
          <div className="mt-6 rounded-3xl border border-amber-200/80 dark:border-amber-500/20 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 dark:from-amber-500/[0.08] dark:via-[#161b22] dark:to-amber-500/[0.04] p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                      Heavy Workload Detected
                    </h3>
                    <span className="rounded-full bg-amber-200/60 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                      {todayTasks.length} Tasks · ~{estimatedHours}h Est.
                    </span>
                    {highPriorityCount > 0 && (
                      <span className="rounded-full bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-400">
                        {highPriorityCount} High Priority
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    You have a full schedule today. Tackle high-priority items first and take structured Pomodoro breaks to maintain peak energy.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                <button
                  onClick={() => setFilterMode(filterMode === "high" ? "all" : "high")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    filterMode === "high"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white dark:bg-[#1e2530] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                  }`}
                >
                  <Filter size={13} /> {filterMode === "high" ? "Showing High Priority" : "Focus on High Priority"}
                </button>
                <button
                  onClick={() => (isRunning ? pauseTimer() : startTimer())}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
                >
                  <Zap size={13} /> {isRunning ? "Pause Focus Timer" : "Start Focus Timer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODERATE WORKLOAD ADVICE ── */}
        {!isHeavyDay && isModerateDay && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-500/[0.04] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <p className="text-xs text-slate-700 dark:text-[#cbd5e1]">
                <strong className="font-semibold text-indigo-600 dark:text-indigo-400">Steady Pace:</strong> You have {todayTasks.length} tasks today (~{estimatedHours}h total). Ready to start your first focus block?
              </p>
            </div>
            <button
              onClick={() => (isRunning ? pauseTimer() : startTimer())}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 ml-2"
            >
              {isRunning ? "Pause Timer" : "Start Focus"}
            </button>
          </div>
        )}

        {/* ── TODAY'S SCHEDULE ── */}
        <div className="mt-6 rounded-3xl bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] shadow-sm p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Today's Schedule</h2>
              <p className="text-xs text-slate-400 dark:text-[#64748b] mt-0.5">
                Sorted by priority · click to edit or check off
              </p>
            </div>

            {/* Quick Filter tabs */}
            {todayTasks.length > 0 && (
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-[#1e2530] p-1 self-start sm:self-auto">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterMode === "all"
                      ? "bg-white dark:bg-[#252d3a] text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  All ({todayTasks.length})
                </button>
                <button
                  onClick={() => setFilterMode("pending")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterMode === "pending"
                      ? "bg-white dark:bg-[#252d3a] text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  To-Do ({pendingTasks.length})
                </button>
                <button
                  onClick={() => setFilterMode("high")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterMode === "high"
                      ? "bg-white dark:bg-[#252d3a] text-rose-600 dark:text-rose-400 shadow-sm"
                      : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  High ({highPriorityCount})
                </button>
              </div>
            )}
          </div>

          {/* Progress bar — only shown when there are tasks */}
          {todayTasks.length > 0 && (
            <div className="mb-5 rounded-2xl bg-slate-50 dark:bg-[#1e2530]/60 border border-slate-100 dark:border-white/[0.07] px-4 py-3">
              <div className="flex justify-between text-xs text-slate-500 dark:text-[#94a3b8] mb-2">
                <span className="font-medium">
                  {doneTasks.length} of {todayTasks.length} completed
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{completionPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-[#252d3a] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Task list */}
          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="text-5xl mb-3">
                {todayTasks.length === 0 ? "🎉" : "✨"}
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-[#e2e8f0]">
                {todayTasks.length === 0
                  ? "No tasks scheduled for today!"
                  : "No tasks matching this filter."}
              </p>
              <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1">
                {todayTasks.length === 0
                  ? "Tap 'Add Task' to organize your study schedule."
                  : "Switch to 'All' to view your full daily agenda."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {displayedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={() => {
                    setEditingTask(task);
                    setOpenTaskModal(true);
                  }}
                  onToggleStatus={updateTaskStatus}
                  onDelete={(id) => setConfirmDelete(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── PROGRESS + POMODORO ── */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProgressCard />
          <Pomodoro />
        </div>

      </div>

      <TaskModal
        isOpen={openTaskModal}
        onClose={() => {
          setOpenTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? editTask : addTask}
        taskToEdit={editingTask}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        message="This task will be removed from today's schedule."
        onConfirm={() => { deleteTask(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}