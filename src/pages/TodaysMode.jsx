import { useState } from "react";
import Pomodoro from "../components/Pomodoro";
import PomodoroSettings from "../components/PomodoroSettings";
import { Plus, TriangleAlert } from "lucide-react";

export default function TodaysPage() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* NAVBAR SPACE */}
      <div className="h-16 w-full bg-blue-600">Nav-Bar</div>

      {/* PAGE CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">

        {/* QUOTE CARD */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow-md sm:mt-10 sm:p-6">
          <div className="rounded-lg border border-l-8 border-l-blue-600 p-5 sm:p-8">
            <p className="max-w-3xl text-lg sm:text-xl md:text-2xl font-semibold italic text-[#1a2b4d]">
              "Concentrate all your thoughts upon the work in hand."
            </p>
            <p className="mt-2 px-4 sm:px-10 text-sm sm:text-base text-[#7d8fb3]">
              — Tim Ferriss
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <button className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base text-white transition hover:bg-blue-600">
              <Plus size={18} />
              ADD TASK
            </button>
          </div>
        </div>

        {/* HEAVY DAY DETECTED */}
        <div className="mt-6 rounded-xl bg-white p-5 shadow-md sm:mt-8 sm:p-6">
          <div className="flex items-start gap-4 rounded-lg border border-l-8 border-l-yellow-500 p-5 sm:p-6">
            <TriangleAlert className="mt-1 h-6 w-6 text-yellow-600" />

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-600">
                Heavy Day Detected
              </h3>
              <p className="mt-1 text-sm sm:text-base text-[#7d8fb3]">
                You have 4 heavy tasks in your to-do list. Low priority tasks are
                visually softened to help you focus on what matters most.
              </p>
            </div>
          </div>
        </div>

        {/* TODAY'S SCHEDULE */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow-md sm:mt-10 sm:p-6">
          <h2 className="mb-4 text-xl sm:text-2xl font-bold text-[#1a2b4d]">
            Today’s Schedule
          </h2>

          <div className="rounded-lg border border-dashed border-gray-300 p-6 sm:p-8 text-center text-sm sm:text-base text-[#7d8fb3]">
            No tasks scheduled for today. Add a task to get started!
          </div>
        </div>

        {/* TODAY'S PROGRESS + FOCUS TIME */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-2 lg:gap-8">

          {/* TODAY'S PROGRESS */}
          <div className="rounded-xl bg-white p-6 shadow-md sm:p-8">
            <h2 className="mb-6 sm:mb-8 text-center text-lg sm:text-xl font-bold text-[#1a2b4d]">
              Today’s Progress
            </h2>

            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full border-8 border-gray-200">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">0%</p>
                  <p className="text-xs sm:text-sm text-[#7d8fb3]">Complete</p>
                </div>
              </div>
            </div>

            <div className="flex justify-around text-center text-sm sm:text-base">
              <div>
                <p className="font-bold">0</p>
                <p className="text-[#7d8fb3]">Completed</p>
              </div>
              <div>
                <p className="font-bold">1</p>
                <p className="text-[#7d8fb3]">Remaining</p>
              </div>
              <div>
                <p className="font-bold">1</p>
                <p className="text-[#7d8fb3]">Total</p>
              </div>
            </div>
          </div>

          {/* FOCUS TIME */}
          <div className="rounded-xl">
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
