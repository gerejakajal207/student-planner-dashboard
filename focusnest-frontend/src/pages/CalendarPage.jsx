import React, { useState } from "react";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTasks } from "../components/TaskContext";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Trash2 } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const { tasks: events, addTask, editTask, deleteTask } = useTasks();

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedDay, setClickedDay] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(today);

  const handleDateClick = (day) => {
    // Build a Date for the clicked day at midnight local time
    const clickedDate = new Date(year, month, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Block adding tasks to dates strictly before today
    if (clickedDate < todayMidnight) return;
    setClickedDay(day);
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    setEditingTask(task);
    setClickedDay(null);
    setModalOpen(true);
  };

  const getEventsForDay = (day) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

  const exams = events.filter((e) => e.category === "Exam");
  const assignments = events.filter((e) => e.category === "Assignment");
  const classes = events.filter((e) => e.category === "Class");
  const hobbies = events.filter((e) => e.category === "Hobby");

  const categoryColors = {
    Exam: "bg-rose-500 text-white",
    Assignment: "bg-amber-500 text-white",
    Class: "bg-emerald-500 text-white",
    Hobby: "bg-pink-500 text-white",
  };

  const clickedDateISO = clickedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(clickedDay).padStart(2, "0")}`
    : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400">
                <CalendarIcon size={20} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                {months[month]} {year}
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8]">
              Visual monthly calendar of deadlines, exams, and milestones
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={month}
              onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1))}
              className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#161b22] px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#e2e8f0] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setCurrentDate(new Date(Number(e.target.value), month, 1))}
              className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#161b22] px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#e2e8f0] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 15 }, (_, i) => 2022 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={goToToday}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95"
            >
              Today
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#161b22] p-4 sm:p-6 shadow-sm transition-all">
          <div className="grid min-w-[650px] grid-cols-7 gap-2.5 sm:gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#64748b] py-1">
                {d}
              </div>
            ))}

            {blanks.map((_, i) => (
              <div key={"b" + i} className="min-h-[85px] sm:min-h-[105px] rounded-2xl bg-slate-50/50 dark:bg-[#0d1117]/30 border border-transparent" />
            ))}

            {days.map((day) => {
              const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              const isPast =
                new Date(year, month, day) <
                new Date(today.getFullYear(), today.getMonth(), today.getDate());

              const dayEvents = getEventsForDay(day);

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`group relative min-h-[85px] sm:min-h-[105px] rounded-2xl border p-2.5 transition-all ${
                    isPast
                      ? "border-slate-100 dark:border-white/[0.04] bg-slate-50/30 dark:bg-[#0d1117]/20 cursor-default opacity-60"
                      : isToday
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/[0.08] shadow-sm cursor-pointer"
                      : "border-slate-100 dark:border-white/[0.07]/80 bg-slate-50/50 dark:bg-[#1e2530]/30 hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:bg-white dark:hover:bg-[#1e2530] cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? "bg-indigo-600 text-white"
                          : isPast
                          ? "text-slate-400 dark:text-[#475569]"
                          : "text-slate-700 dark:text-[#cbd5e1]"
                      }`}
                    >
                      {day}
                    </span>
                    {/* Only show "+ Add" hint for today and future dates */}
                    {!isPast && (
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold transition-opacity">
                        + Add
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[60px]">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEditClick(e, event)}
                        className={`truncate rounded-lg px-2 py-0.5 text-[10px] sm:text-xs font-medium cursor-pointer shadow-xs transition-opacity hover:opacity-90 ${
                          categoryColors[event.category] ?? "bg-slate-500 text-white"
                        }`}
                        title={`${event.title} (${event.category}) - Click to edit`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="block text-[9px] font-bold text-slate-400">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EVENT CATEGORY BREAKDOWN CARDS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Exams", data: exams, border: "border-rose-400", bg: "bg-rose-50 dark:bg-rose-500/[0.06] text-rose-600 dark:text-rose-400" },
            { title: "Assignments", data: assignments, border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-500/[0.06] text-amber-600 dark:text-amber-400" },
            { title: "Classes", data: classes, border: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400" },
            { title: "Hobbies", data: hobbies, border: "border-pink-400", bg: "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400" },
          ].map((section, i) => (
            <div
              key={i}
              className={`rounded-3xl border-t-4 ${section.border} bg-white dark:bg-[#161b22] border-x border-b border-slate-100 dark:border-white/[0.07] p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{section.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${section.bg}`}>
                  {section.data.length}
                </span>
              </div>

              {section.data.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-[#64748b] py-4 text-center">No tasks in this category 🎉</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {section.data.map((event) => (
                    <li
                      key={event.id}
                      className="group flex items-center justify-between rounded-xl bg-slate-50 dark:bg-[#1e2530]/60 px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#e2e8f0]"
                    >
                      <span className="truncate flex-1">
                        {event.title} · <span className="text-slate-400">{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditClick(e, event)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(event.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* TASK MODAL */}
        <TaskModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? editTask : addTask}
          initialDueDate={clickedDateISO}
          taskToEdit={editingTask}
        />

        <ConfirmDialog
          isOpen={!!confirmDelete}
          message="This task will be permanently deleted from your calendar."
          onConfirm={() => { deleteTask(confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </div>
  );
}