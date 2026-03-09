import { useState } from "react";
import { Plus, TrendingUp, Target, CheckCircle, Clock, BookOpen, Calendar, AlertCircle, ChevronRight, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../components/TaskContext";
import TaskModal from "../components/TaskModal";
import QuoteCard from "../components/QuoteCard";

// ---------- Helpers ----------
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function isToday(date) {
  const t = new Date();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

function isTomorrow(date) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
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
    <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ---------- Category Row ----------
function CategoryRow({ icon: Icon, label, count, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <span className="flex-1 text-sm text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-800">{count}</span>
    </div>
  );
}

// ---------- Schedule Task Item ----------
function ScheduleItem({ task }) {
  const CATEGORY_COLORS = {
    Exam:       "bg-red-400",
    Assignment: "bg-amber-400",
    Class:      "bg-emerald-400",
    Hobby:      "bg-pink-400",
  };
  const PRIORITY_TEXT = {
    High:   "text-red-500",
    Medium: "text-amber-500",
    Low:    "text-slate-400",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className={`w-1 h-8 rounded-full flex-shrink-0 ${CATEGORY_COLORS[task.category] ?? "bg-slate-300"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
        <p className="text-xs text-slate-400">{task.subject}</p>
      </div>
      <span className={`text-xs font-medium flex-shrink-0 ${PRIORITY_TEXT[task.priority] ?? "text-slate-400"}`}>
        {task.priority}
      </span>
    </div>
  );
}

// ---------- Main Page ----------
export default function HomePage() {
  const { tasks, addTask } = useTasks();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const todayTasks = tasks.filter((t) => isToday(t.date));
  const tomorrowTasks = tasks.filter((t) => isTomorrow(t.date));
  const completedToday = tasks.filter((t) => isToday(t.date) && t.status === "Done");
  const inProgress = tasks.filter((t) => t.status === "In Progress");
  const pending = tasks.filter((t) => t.status === "Pending");

  const pendingAssignments = tasks.filter((t) => t.category === "Assignment" && t.status !== "Done");
  const upcomingExams = tasks.filter((t) => t.category === "Exam" && t.status !== "Done");
  const dueAssignments = tasks.filter((t) => {
    const diff = (t.date - new Date()) / (1000 * 60 * 60 * 24);
    return t.category === "Assignment" && t.status !== "Done" && diff <= 3 && diff >= 0;
  });

  const last7 = getLast7Days();
  const weeklyData = last7.map((day) => ({
    day: day.toLocaleDateString("en-US", { weekday: "short" }),
    date: day.getDate(),
    total: tasks.filter(
      (t) =>
        t.date.getDate() === day.getDate() &&
        t.date.getMonth() === day.getMonth() &&
        t.date.getFullYear() === day.getFullYear()
    ).length,
  }));
  const maxBar = Math.max(...weeklyData.map((d) => d.total), 1);

  const statsData = [
    { icon: Target,      value: todayTasks.length,    description: "Today's Tasks",   colorClass: "text-blue-500",    bgClass: "bg-blue-50"    },
    { icon: CheckCircle, value: completedToday.length, description: "Completed Today", colorClass: "text-emerald-500", bgClass: "bg-emerald-50" },
    { icon: TrendingUp,  value: inProgress.length,     description: "In Progress",     colorClass: "text-violet-500",  bgClass: "bg-violet-50"  },
    { icon: Clock,       value: pending.length,         description: "Pending",         colorClass: "text-amber-500",   bgClass: "bg-amber-50"   },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col gap-6 p-4 sm:p-6">

        {/* ── HERO CARD ── */}
        <div className="relative rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-8 flex flex-col items-center text-center gap-5 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400" />
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-indigo-50 opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-50 opacity-60" />

          <div className="relative">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              {getGreeting()}, Student! 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">Ready to make today productive?</p>
          </div>

          <div className="relative w-full max-w-2xl">
            <QuoteCard />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsData.map((item, i) => (
            <StatCard key={i} {...item} />
          ))}
        </div>

        {/* ── MIDDLE ROW ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Academic Overview */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-bold text-slate-800 mb-1">Academic Overview</h2>
            <p className="text-xs text-slate-400 mb-4">Your current academic workload</p>
            <CategoryRow
              icon={BookOpen}
              label="Pending Assignments"
              count={pendingAssignments.length}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            />
            <CategoryRow
              icon={Calendar}
              label="Upcoming Exams"
              count={upcomingExams.length}
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
            />
            <CategoryRow
              icon={AlertCircle}
              label="Due Soon (≤3 days)"
              count={dueAssignments.length}
              iconBg="bg-red-50"
              iconColor="text-red-500"
            />
            <button
              onClick={() => navigate("/calendar")}
              className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
            >
              View Calendar <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800">Today's Schedule</h2>
              <button
                onClick={() => navigate("/todays-page")}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Tasks due today</p>
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-slate-500 font-medium">No tasks scheduled for today</p>
                <p className="text-xs text-slate-400 mt-0.5">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todayTasks.slice(0, 5).map((task) => (
                  <ScheduleItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Tomorrow's Preview */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800">Tomorrow's Preview</h2>
              <button
                onClick={() => navigate("/calendar")}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
              >
                Calendar <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">What's coming up next</p>
            {tomorrowTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2">✨</div>
                <p className="text-sm text-slate-500 font-medium">Nothing scheduled for tomorrow</p>
                <p className="text-xs text-slate-400 mt-0.5">Stay ahead of the curve!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tomorrowTasks.slice(0, 5).map((task) => (
                  <ScheduleItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          {/* Weekly Consistency */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800">Weekly Consistency</h2>
              <BarChart2 className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-xs text-slate-400 mb-5">Tasks per day this week</p>
            <div className="flex items-end justify-between gap-2 h-24">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: "72px" }}>
                    <div
                      className="w-full rounded-t-md bg-indigo-200 hover:bg-indigo-400 transition-all duration-300"
                      style={{
                        height: `${d.total > 0 ? Math.max((d.total / maxBar) * 72, 6) : 4}px`,
                      }}
                      title={`${d.total} task${d.total !== 1 ? "s" : ""}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                  <span className="text-[10px] text-slate-300">{d.date}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">
              Tasks due per day this week
            </p>
          </div>
        </div>

      </div>

      {/* TASK MODAL */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTask}
      />
    </div>
  );
}