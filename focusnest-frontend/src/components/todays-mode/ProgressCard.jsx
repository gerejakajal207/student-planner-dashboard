import React from "react";
import { useTasks } from "../TaskContext";
import { CheckCircle2, CircleDashed, Clock, Trophy } from "lucide-react";

function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

export default function ProgressCard() {
  const { tasks } = useTasks();

  const todayTasks = tasks.filter((t) => isToday(t.date));
  const completed = todayTasks.filter((t) => t.status === "Done").length;
  const total = todayTasks.length;
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // SVG Circular progress
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#161b22] p-6 shadow-sm border border-slate-100 dark:border-white/[0.07] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Today’s Progress</h2>
          <p className="text-xs text-slate-400 dark:text-[#64748b]">Live completion overview</p>
        </div>
        {percent === 100 && total > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/[0.1] px-2.5 py-1 rounded-full">
            <Trophy className="h-3.5 w-3.5" /> All Done!
          </span>
        )}
      </div>

      <div className="my-2 flex justify-center">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-[#1e2530]"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-indigo-600 dark:text-indigo-500 transition-all duration-700 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {percent}%
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-[#64748b]">
              Completed
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-white/[0.07] pt-4 text-center">
        <div className="rounded-xl bg-slate-50 dark:bg-[#1e2530]/60 p-2.5">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-[#64748b] mb-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Done</span>
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{completed}</p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-[#1e2530]/60 p-2.5">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-[#64748b] mb-0.5">
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Remaining</span>
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{remaining}</p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-[#1e2530]/60 p-2.5">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-[#64748b] mb-0.5">
            <CircleDashed className="h-3 w-3 text-indigo-500" />
            <span>Total</span>
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{total}</p>
        </div>
      </div>
    </div>
  );
}
