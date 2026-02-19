import React, { useState } from "react";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const categories = ["Exam", "Assignment", "Class"];

export default function CalendarPage() {

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);

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
    const title = prompt("Enter Event Title:");
    if (!title) return;

    let category = prompt("Enter category: Exam / Assignment / Class");

    category =
      category?.charAt(0).toUpperCase() +
      category?.slice(1).toLowerCase();

    if (!categories.includes(category)) {
      alert("Invalid category! Defaulting to Assignment.");
      category = "Assignment";
    }

    const newEvent = {
      title,
      category,
      date: new Date(year, month, day)
    };

    setEvents([...events, newEvent]);
    setSelectedDate(new Date(year, month, day));
  };

  const getEventsForDay = (day) => {
    return events.filter(
      e =>
        e.date.getDate() === day &&
        e.date.getMonth() === month &&
        e.date.getFullYear() === year
    );
  };

  const exams = events.filter(e => e.category === "Exam");
  const assignments = events.filter(e => e.category === "Assignment");
  const classes = events.filter(e => e.category === "Class");

  const categoryColors = {
    Exam: "bg-red-400",
    Assignment: "bg-yellow-400",
    Class: "bg-green-400"
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {months[month]} {year}
          </h1>

          <div className="flex flex-wrap gap-3 mt-3">

            <select
              value={month}
              onChange={(e) =>
                setCurrentDate(new Date(year, e.target.value, 1))
              }
              className="border p-2 rounded-lg shadow-sm text-sm sm:text-base"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) =>
                setCurrentDate(new Date(e.target.value, month, 1))
              }
              className="border p-2 rounded-lg shadow-sm text-sm sm:text-base"
            >
              {Array.from({ length: 101 }, (_, i) => 2000 + i).map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={goToToday}
              className="bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow hover:bg-indigo-600 text-sm sm:text-base"
            >
              Today
            </button>

          </div>
        </div>

        <div className="flex gap-3 self-start md:self-auto">
          <button
            onClick={prevMonth}
            className="px-3 sm:px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100"
          >
            {"<"}
          </button>

          <button
            onClick={nextMonth}
            className="px-3 sm:px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100"
          >
            {">"}
          </button>
        </div>

      </div>

      {/* CALENDAR WRAPPER FOR SMALL DEVICES */}
      <div className="overflow-x-auto">

        <div className="grid grid-cols-7 gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-lg min-w-[700px]">

          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} className="text-center font-bold text-gray-500 text-sm sm:text-base">
              {d}
            </div>
          ))}

          {blanks.map((_,i)=>(
            <div key={"b"+i}></div>
          ))}

          {days.map(day=>{

            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;

            const dayEvents = getEventsForDay(day);

            return(
              <div
                key={day}
                onClick={()=>handleDateClick(day)}
                className={`
                  min-h-[90px] sm:min-h-[110px]
                  rounded-xl border p-2 cursor-pointer
                  hover:shadow-md transition
                  ${isToday ? "bg-indigo-50 border-indigo-400" : ""}
                `}
              >
                <div className="font-semibold text-sm sm:text-base">{day}</div>

                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0,2).map((event,i)=>(
                    <div
                      key={i}
                      className={`text-[10px] sm:text-xs text-white px-2 py-1 rounded ${categoryColors[event.category]}`}
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

        {[{title:"Exams",data:exams,color:"border-red-400"},
          {title:"Assignments",data:assignments,color:"border-yellow-400"},
          {title:"Classes",data:classes,color:"border-green-400"}]
          .map((section,i)=>(
            <div key={i} className={`bg-white rounded-2xl shadow p-5 border-t-4 ${section.color}`}>
              
              <h2 className="font-bold text-lg mb-4">{section.title}</h2>

              {section.data.length === 0 ? (
                <p className="text-gray-400">No tasks yet 🎉</p>
              ) : (
                <ul className="space-y-2">
                  {section.data.map((event,index)=>(
                    <li
                      key={index}
                      className="bg-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      {event.title} —{" "}
                      {event.date.toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}

            </div>
        ))}

      </div>

    </div>
  );
}
