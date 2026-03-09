import React, { useState } from "react";
import TaskModal from "../components/TaskModal";
import { useTasks } from "../components/TaskContext";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage() {
  const { tasks: events, addTask } = useTasks();

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedDay, setClickedDay] = useState(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (day) => {
    const clicked = new Date(year, month, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (clicked < todayMidnight) return; // ← block past dates

    setClickedDay(day);
    setSelectedDate(clicked);
    setModalOpen(true);
  };

  const getEventsForDay = (day) =>
    events.filter(
      (e) =>
        e.date.getDate() === day && e.date.getMonth() === month && e.date.getFullYear() === year
    );

  const exams = events.filter((e) => e.category === "Exam");
  const assignments = events.filter((e) => e.category === "Assignment");
  const classes = events.filter((e) => e.category === "Class");
  const hobbies = events.filter((e) => e.category === "Hobby"); // ← ADD

  const categoryColors = {
    Exam: "bg-red-400",
    Assignment: "bg-yellow-400",
    Class: "bg-green-400",
    Hobby: "bg-pink-400", // ← ADD
  };

  const clickedDateISO = clickedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(clickedDay).padStart(2, "0")}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            {months[month]} {year}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3">
            <select
              value={month}
              onChange={(e) => setCurrentDate(new Date(year, e.target.value, 1))}
              className="rounded-lg border p-2 text-sm shadow-sm sm:text-base"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setCurrentDate(new Date(e.target.value, month, 1))}
              className="rounded-lg border p-2 text-sm shadow-sm sm:text-base"
            >
              {Array.from({ length: 101 }, (_, i) => 2000 + i).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={goToToday}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white shadow hover:bg-indigo-600 sm:px-4 sm:text-base"
            >
              Today
            </button>
          </div>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <button
            onClick={prevMonth}
            className="rounded-lg bg-white px-3 py-2 shadow hover:bg-gray-100 sm:px-4"
          >
            {"<"}
          </button>
          <button
            onClick={nextMonth}
            className="rounded-lg bg-white px-3 py-2 shadow hover:bg-gray-100 sm:px-4"
          >
            {">"}
          </button>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[700px] grid-cols-7 gap-3 rounded-2xl bg-white p-4 shadow-lg sm:gap-4 sm:p-6">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-sm font-bold text-gray-500 sm:text-base">
              {d}
            </div>
          ))}
          {blanks.map((_, i) => (
            <div key={"b" + i}></div>
          ))}
          {days.map((day) => {
            const isToday =
              today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const isPast =
              new Date(year, month, day) <
              new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`min-h-[90px] rounded-xl border p-2 transition sm:min-h-[110px] ${isToday ? "border-indigo-400 bg-indigo-50" : ""} ${isPast ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:shadow-md"}`}
              >
                <div className="text-sm font-semibold sm:text-base">{day}</div>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className={`rounded px-2 py-1 text-[10px] text-white sm:text-xs ${categoryColors[event.category] ?? "bg-gray-400"}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EVENT LIST */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Exams", data: exams, color: "border-red-400" },
          { title: "Assignments", data: assignments, color: "border-yellow-400" },
          { title: "Classes", data: classes, color: "border-green-400" },
          { title: "Hobbies", data: hobbies, color: "border-pink-400" }, // ← ADD
        ].map((section, i) => (
          <div key={i} className={`rounded-2xl border-t-4 bg-white p-5 shadow ${section.color}`}>
            <h2 className="mb-4 text-lg font-bold">{section.title}</h2>
            {section.data.length === 0 ? (
              <p className="text-gray-400">No tasks yet 🎉</p>
            ) : (
              <ul className="space-y-2">
                {section.data.map((event, index) => (
                  <li key={index} className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                    {event.title} — {event.date.toLocaleDateString()}
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
        onClose={() => setModalOpen(false)}
        onSubmit={addTask}
        initialDueDate={clickedDateISO}
      />
    </div>
  );
}
