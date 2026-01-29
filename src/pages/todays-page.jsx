import { useState } from "react";
import Pomodoro from "../components/Pomodoro";
import PomodoroSettings from "../components/PomodoroSettings";

export default function TodaysPage() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* NAVBAR SPACE */}
      <div className="h-16 w-full bg-blue-600">Nav-Bar</div>

      {/* PAGE CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        
        {/* QUOTE CARD */}
        <div className="mt-10 rounded-xl bg-white p-6 shadow-md">
          <div className="rounded-lg border border-l-8 border-l-blue-600 p-6 sm:p-8">
            <p className="max-w-3xl text-xl sm:text-2xl font-semibold italic text-[#1a2b4d]">
              "Concentrate all your thoughts upon the work in hand."
            </p>
            <p className="mt-2 px-6 sm:px-10 text-[#7d8fb3]">
              — Tim Ferriss
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <button className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600">
              <span className="text-xl">+</span> ADD TASK
            </button>
          </div>
        </div>

        {/* HEAVY DAY DETECTED */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-start gap-4 rounded-lg border border-l-8 border-l-yellow-500 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mt-1 h-6 w-6 text-yellow-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>

            <div>
              <h3 className="text-lg font-semibold text-yellow-600">
                Heavy Day Detected
              </h3>
              <p className="mt-1 text-[#7d8fb3]">
                You have 4 heavy tasks in your to-do list. Low priority tasks are
                visually softened to help you focus on what matters most.
              </p>
            </div>
          </div>
        </div>

        {/* TODAY'S SCHEDULE */}
        <div className="mt-10 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-[#1a2b4d]">
            Today’s Schedule
          </h2>

          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-[#7d8fb3]">
            No tasks scheduled for today. Add a task to get started!
          </div>
        </div>

        {/* TODAY'S PROGRESS + FOCUS TIME */}
        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          
          {/* TODAY'S PROGRESS */}
          <div className="rounded-xl bg-white p-8 shadow-md">
            <h2 className="mb-8 text-center text-xl font-bold text-[#1a2b4d]">
              Today’s Progress
            </h2>

            <div className="mb-8 flex justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">0%</p>
                  <p className="text-[#7d8fb3]">Complete</p>
                </div>
              </div>
            </div>

            <div className="flex justify-around text-center">
              <div>
                <p className="text-xl font-bold">0</p>
                <p className="text-[#7d8fb3]">Completed</p>
              </div>
              <div>
                <p className="text-xl font-bold">1</p>
                <p className="text-[#7d8fb3]">Remaining</p>
              </div>
              <div>
                <p className="text-xl font-bold">1</p>
                <p className="text-[#7d8fb3]">Total</p>
              </div>
            </div>
          </div>

          {/* FOCUS TIME */}
          <div className="rounded-xl bg-white shadow-md">
            <Pomodoro />
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {openSettings && (
        <PomodoroSettings onClose={() => setOpenSettings(false)} />
      )}
    </div>
  );
}
