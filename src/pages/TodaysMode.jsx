import { useState } from "react";
import { Plus, TriangleAlert, Flame, BookOpen } from "lucide-react";
import Pomodoro from "../components/Pomodoro";
import PomodoroSettings from "../components/PomodoroSettings";
import QuoteCard from "../components/QuoteCard";
import ProgressCard from "../components/todays-mode/ProgressCard";
import TaskModal from "../components/TaskModal";
import { useTasks } from "../components/TaskContext";

function isToday(date) {
  const t = new Date();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

const CATEGORY_COLORS = {
  Exam:       { bar: "bg-red-400",     badge: "bg-red-50 text-red-600"         },
  Assignment: { bar: "bg-amber-400",   badge: "bg-amber-50 text-amber-600"     },
  Class:      { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-600" },
  Hobby:      { bar: "bg-pink-400",    badge: "bg-pink-50 text-pink-600"       },
};

const PRIORITY_STYLES = {
  High:   { text: "text-red-500",   bg: "bg-red-50",    dot: "bg-red-400"   },
  Medium: { text: "text-amber-500", bg: "bg-amber-50",  dot: "bg-amber-400" },
  Low:    { text: "text-slate-400", bg: "bg-slate-100", dot: "bg-slate-300" },
};

const STATUS_STYLES = {
  Todo:          { text: "text-blue-600",   bg: "bg-blue-50"   },
  Upcoming:      { text: "text-sky-600",    bg: "bg-sky-50"    },
  Pending:       { text: "text-orange-600", bg: "bg-orange-50" },
  "In Progress": { text: "text-violet-600", bg: "bg-violet-50" },
  Done:          { text: "text-emerald-600",bg: "bg-emerald-50"},
};

function TaskRow({ task, isDeprioritized }) {
  const cat = CATEGORY_COLORS[task.category] ?? { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500" };
  const pri = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
  const sts = STATUS_STYLES[task.status] ?? STATUS_STYLES.Todo;
  const isDone = task.status === "Done";

  return (
    <div
      className={`group flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-150
        ${isDone ? "border-emerald-100 opacity-60" : "border-slate-100 hover:border-indigo-200 hover:shadow-md"}
        ${isDeprioritized && !isDone ? "opacity-40" : ""}
      `}
    >
      {/* Category accent bar */}
      <div className={`w-1 h-12 rounded-full flex-shrink-0 ${cat.bar}`} />

      {/* Icon */}
      <div className={`hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${cat.badge.split(" ")[0]}`}>
        <BookOpen className={`h-4 w-4 ${cat.badge.split(" ")[1]}`} />
      </div>

      {/* Title + subject */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-slate-800 truncate ${isDone ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 truncate">{task.subject}</span>
          <span className="text-slate-200 text-xs">·</span>
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${cat.badge}`}>
            {task.category}
          </span>
        </div>
      </div>

      {/* Priority */}
      <div className={`hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 ${pri.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
        <span className={`text-xs font-medium ${pri.text}`}>{task.priority}</span>
      </div>

      {/* Status */}
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium flex-shrink-0 ${sts.bg} ${sts.text}`}>
        {task.status}
      </span>
    </div>
  );
}

export default function TodaysPage() {
  const { tasks, addTask } = useTasks();
  const [openSettings, setOpenSettings] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);

  const todayTasks = tasks.filter((t) => isToday(t.date));
  const highEffortCount = todayTasks.filter((t) => t.effort === "High").length;
  const isHeavyDay = highEffortCount >= 3;
  const doneTasks = todayTasks.filter((t) => t.status === "Done");
  const completionPct = todayTasks.length > 0
    ? Math.round((doneTasks.length / todayTasks.length) * 100)
    : 0;

  const sortedTasks = [...todayTasks].sort((a, b) => {
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400" />
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-indigo-50 opacity-50" />
          <div className="relative flex flex-col items-center gap-5 text-center">
            <div>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Today's Mode</h1>
              <p className="text-sm text-slate-400 mt-0.5">
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
              onClick={() => setOpenTaskModal(true)}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* ── HEAVY DAY BANNER ── */}
        {isHeavyDay && (
          <div className="mt-5 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <TriangleAlert className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-700">Heavy Day Detected</h3>
              <p className="mt-0.5 text-xs text-amber-600 leading-relaxed">
                You have {highEffortCount} high-effort tasks today. Low priority tasks are softened
                so you can focus on what matters most.
              </p>
            </div>
            <Flame className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          </div>
        )}

        {/* ── TODAY'S SCHEDULE ── */}
        <div className="mt-5 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Today's Schedule</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sorted by priority · high first</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Progress bar — only shown when there are tasks */}
          {todayTasks.length > 0 && (
            <div className="mb-5 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">
                  {doneTasks.length} of {todayTasks.length} completed
                </span>
                <span className="font-bold text-indigo-600">{completionPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Task list */}
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-sm font-semibold text-slate-600">No tasks for today!</p>
              <p className="text-xs text-slate-400 mt-1">
                Tap "Add Task" to plan your day.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {sortedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isDeprioritized={isHeavyDay && task.priority === "Low"}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── PROGRESS + POMODORO ── */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProgressCard />
          <Pomodoro />
        </div>

      </div>

      {openSettings && <PomodoroSettings onClose={() => setOpenSettings(false)} />}

      <TaskModal
        isOpen={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
        onSubmit={addTask}
      />
    </div>
  );
}