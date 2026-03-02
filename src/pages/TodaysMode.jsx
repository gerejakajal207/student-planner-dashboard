import { useState } from "react";
import Pomodoro from "../components/Pomodoro";
import PomodoroSettings from "../components/PomodoroSettings";
import { Plus, TriangleAlert } from "lucide-react";
import QuoteCard from "../components/QuoteCard";
import ProgressCard from "../components/ProgressCard";

export default function TodaysPage() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <div className="bg-background">
      {/* PAGE CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* QUOTE CARD */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow-md sm:mt-10 sm:p-6">
          <QuoteCard />
          <div className="mt-6 flex justify-center">
            <button className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm text-white transition hover:bg-blue-600 sm:px-6 sm:py-3 sm:text-base">
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
              <h3 className="text-base font-semibold text-yellow-600 sm:text-lg">
                Heavy Day Detected
              </h3>
              <p className="mt-1 text-sm text-[#7d8fb3] sm:text-base">
                You have 4 heavy tasks in your to-do list. Low priority tasks are visually softened
                to help you focus on what matters most.
              </p>
            </div>
          </div>
        </div>

        {/* TODAY'S SCHEDULE */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow-md sm:mt-10 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-[#1a2b4d] sm:text-2xl">Today’s Schedule</h2>

          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-[#7d8fb3] sm:p-8 sm:text-base">
            No tasks scheduled for today. Add a task to get started!
          </div>
        </div>

        {/* TODAY'S PROGRESS + FOCUS TIME */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-2 lg:gap-8">
          {/* TODAY'S PROGRESS */}
          <ProgressCard />

          {/* FOCUS TIME */}
          <div className="rounded-xl">
            <Pomodoro />
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {openSettings && <PomodoroSettings onClose={() => setOpenSettings(false)} />}
    </div>
  );
}
