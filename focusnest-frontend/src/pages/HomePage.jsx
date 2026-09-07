import { useState } from "react";
import {
  Plus,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  ChevronRight,
  BarChart2,
  Sparkles,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../components/TaskContext";
import { useAuth } from "../components/AuthContext";
import TaskModal from "../components/TaskModal";
import QuoteCard from "../components/QuoteCard";

// ---------- Helpers ----------
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}

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

function isTomorrow(date) {
  if (!date) return false;
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const d = new Date(date);
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d;
  });
}

// ---------- Stat Card ----------
function StatCard({ icon: Icon, value, description, colorClass, bgClass }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-[#161b22] px-5 py-4 shadow-sm border border-slate-100 dark:border-white/[0.07] hover:shadow-md transition-all">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-1">{description}</p>
      </div>
    </div>
  );
}

// ---------- Category Row ----------
function CategoryRow({ icon: Icon, label, count, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 dark:border-white/[0.07]/60 last:border-0">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <span className="flex-1 text-sm text-slate-600 dark:text-[#cbd5e1] font-medium">{label}</span>
      <span className="text-sm font-bold text-slate-800 dark:text-white">{count}</span>
    </div>
  );
}

// ---------- Schedule Task Item ----------
function ScheduleItem({ task, onEdit }) {
  const CATEGORY_COLORS = {
    Exam:       "bg-rose-500",
    Assignment: "bg-amber-500",
    Class:      "bg-emerald-500",
    Hobby:      "bg-pink-500",
  };
  const PRIORITY_TEXT = {
    High:   "text-rose-500",
    Medium: "text-amber-500",
    Low:    "text-slate-400",
  };

  return (
    <div
      onClick={onEdit}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/[0.07] bg-slate-50/70 dark:bg-[#1e2530]/50 hover:bg-white dark:hover:bg-[#1e2530] px-3 py-2.5 cursor-pointer transition-all shadow-xs"
    >
      <div className={`w-1 h-8 rounded-full flex-shrink-0 ${CATEGORY_COLORS[task.category] ?? "bg-slate-300"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-[#e2e8f0] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {task.title}
        </p>
        <p className="text-xs text-slate-400 dark:text-[#64748b] truncate">{task.subject}</p>
      </div>
      <span className={`text-xs font-semibold flex-shrink-0 ${PRIORITY_TEXT[task.priority] ?? "text-slate-400"}`}>
        {task.priority}
      </span>
    </div>
  );
}

// ---------- Main Page ----------
export default function HomePage() {
  const { tasks, addTask, editTask } = useTasks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const todayTasks = tasks.filter((t) => isToday(t.date));
  const tomorrowTasks = tasks.filter((t) => isTomorrow(t.date));
  const completedToday = tasks.filter((t) => isToday(t.date) && t.status === "Done");
  const inProgress = tasks.filter((t) => t.status === "In Progress");
  const pending = tasks.filter((t) => t.status === "Pending" || t.status === "Todo");

  const pendingAssignments = tasks.filter((t) => t.category === "Assignment" && t.status !== "Done");
  const upcomingExams = tasks.filter((t) => t.category === "Exam" && t.status !== "Done");
  const dueAssignments = tasks.filter((t) => {
    const diff = (new Date(t.date) - new Date()) / (1000 * 60 * 60 * 24);
    return t.category === "Assignment" && t.status !== "Done" && diff <= 3 && diff >= 0;
  });

  const last7 = getLast7Days();
  const weeklyData = last7.map((day) => ({
    day: day.toLocaleDateString("en-US", { weekday: "short" }),
    date: day.getDate(),
    total: tasks.filter((t) => {
      const td = new Date(t.date);
      return (
        td.getDate() === day.getDate() &&
        td.getMonth() === day.getMonth() &&
        td.getFullYear() === day.getFullYear()
      );
    }).length,
  }));
  const maxBar = Math.max(...weeklyData.map((d) => d.total), 1);

  const statsData = [
    { icon: Target,      value: todayTasks.length,    description: "Today's Tasks",   colorClass: "text-blue-500",    bgClass: "bg-blue-50 dark:bg-blue-500/[0.1]"    },
    { icon: CheckCircle, value: completedToday.length, description: "Completed Today", colorClass: "text-emerald-500", bgClass: "bg-emerald-50 dark:bg-emerald-500/[0.1]" },
    { icon: TrendingUp,  value: inProgress.length,     description: "In Progress",     colorClass: "text-violet-500",  bgClass: "bg-violet-50 dark:bg-violet-500/[0.1]"  },
    { icon: Clock,       value: pending.length,        description: "Pending / Todo",  colorClass: "text-amber-500",   bgClass: "bg-amber-50 dark:bg-amber-500/[0.1]"   },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">

        {/* ── HERO CARD ── */}
        <div className="relative rounded-3xl bg-white dark:bg-[#161b22] shadow-sm border border-slate-100 dark:border-white/[0.07] px-6 py-8 sm:px-8 sm:py-10 flex flex-col items-center text-center gap-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-50 dark:bg-indigo-500/[0.08] opacity-60 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-violet-50 dark:bg-violet-500/[0.08] opacity-60 pointer-events-none" />

          <div className="relative">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white sm:text-3xl">
              {getGreeting()}, {user?.name?.split(" ")[0] || "Student"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8] mt-1">Ready to make today productive and achieve your goals?</p>
          </div>

          <div className="relative w-full max-w-2xl">
            <QuoteCard />
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95"
            >
              <Plus size={16} /> Add Task
            </button>

            <button
              onClick={() => navigate("/ai-assistant")}
              className="flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-500/[0.1] hover:bg-amber-100 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <Sparkles size={16} /> AI Assistant
            </button>

            <button
              onClick={() => navigate("/revise")}
              className="flex items-center gap-2 rounded-full bg-white dark:bg-[#1e2530] hover:bg-slate-100 dark:hover:bg-[#252d3a] text-slate-700 dark:text-[#e2e8f0] border border-slate-200 dark:border-white/[0.1] px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <BookOpen size={16} /> Flashcards
            </button>

            <button
              onClick={() => navigate("/mcq-test")}
              className="flex items-center gap-2 rounded-full bg-white dark:bg-[#1e2530] hover:bg-slate-100 dark:hover:bg-[#252d3a] text-slate-700 dark:text-[#e2e8f0] border border-slate-200 dark:border-white/[0.1] px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <Brain size={16} /> MCQ Quiz
            </button>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsData.map((item, i) => (
            <StatCard key={i} {...item} />
          ))}
        </div>

        {/* ── MIDDLE ROW ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Academic Overview */}
          <div className="rounded-3xl bg-white dark:bg-[#161b22] shadow-sm border border-slate-100 dark:border-white/[0.07] p-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">Academic Overview</h2>
            <p className="text-xs text-slate-400 dark:text-[#64748b] mb-4">Your current academic workload & deadlines</p>
            <CategoryRow
              icon={BookOpen}
              label="Pending Assignments"
              count={pendingAssignments.length}
              iconBg="bg-blue-50 dark:bg-blue-500/[0.1]"
              iconColor="text-blue-500"
            />
            <CategoryRow
              icon={Calendar}
              label="Upcoming Exams"
              count={upcomingExams.length}
              iconBg="bg-violet-50 dark:bg-violet-500/[0.1]"
              iconColor="text-violet-500"
            />
            <CategoryRow
              icon={AlertCircle}
              label="Due Soon (≤3 days)"
              count={dueAssignments.length}
              iconBg="bg-rose-50 dark:bg-rose-500/[0.1]"
              iconColor="text-rose-500"
            />
            <button
              onClick={() => navigate("/calendar")}
              className="mt-5 w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.07] py-2.5 text-xs font-semibold text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-50 dark:hover:bg-[#1e2530] transition"
            >
              View Calendar <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-3xl bg-white dark:bg-[#161b22] shadow-sm border border-slate-100 dark:border-white/[0.07] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Today's Schedule</h2>
              <button
                onClick={() => navigate("/todays-page")}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold transition"
              >
                View Today's Mode <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-[#64748b] mb-4">Tasks due today</p>
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-slate-600 dark:text-[#cbd5e1] font-semibold">No tasks scheduled for today</p>
                <p className="text-xs text-slate-400 dark:text-[#64748b] mt-0.5">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {todayTasks.slice(0, 5).map((task) => (
                  <ScheduleItem
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Tomorrow's Preview */}
          <div className="rounded-3xl bg-white dark:bg-[#161b22] shadow-sm border border-slate-100 dark:border-white/[0.07] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Tomorrow's Preview</h2>
              <button
                onClick={() => navigate("/calendar")}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold transition"
              >
                Calendar <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-[#64748b] mb-4">What's coming up next</p>
            {tomorrowTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2">✨</div>
                <p className="text-sm text-slate-600 dark:text-[#cbd5e1] font-semibold">Nothing scheduled for tomorrow</p>
                <p className="text-xs text-slate-400 dark:text-[#64748b] mt-0.5">Stay ahead of the curve!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {tomorrowTasks.slice(0, 5).map((task) => (
                  <ScheduleItem
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Weekly Consistency */}
          <div className="rounded-3xl bg-white dark:bg-[#161b22] shadow-sm border border-slate-100 dark:border-white/[0.07] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Weekly Consistency</h2>
              <BarChart2 className="h-4 w-4 text-slate-300 dark:text-[#475569]" />
            </div>
            <p className="text-xs text-slate-400 dark:text-[#64748b] mb-5">Tasks per day this week</p>
            <div className="flex items-end justify-between gap-2 h-24">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: "72px" }}>
                    <div
                      className="w-full rounded-t-lg bg-indigo-300 dark:bg-indigo-800 hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300"
                      style={{
                        height: `${d.total > 0 ? Math.max((d.total / maxBar) * 72, 8) : 4}px`,
                      }}
                      title={`${d.total} task${d.total !== 1 ? "s" : ""}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-[#94a3b8] font-medium">{d.day}</span>
                  <span className="text-[10px] text-slate-400 dark:text-[#475569]">{d.date}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-[#64748b] text-center mt-3">
              Daily task activity breakdown
            </p>
          </div>
        </div>

      </div>

      {/* TASK MODAL */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? editTask : addTask}
        taskToEdit={editingTask}
      />
    </div>
  );
}