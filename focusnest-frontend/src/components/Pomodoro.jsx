import { useState } from "react";
import { Settings, Play, Pause, RotateCcw, SkipForward, Flame } from "lucide-react";
import PomodoroSettings from "./PomodoroSettings";
import { useTimer } from "./TimerContext";

export default function Pomodoro() {
  const [showSettings, setShowSettings] = useState(false);

  const {
    mode,
    timeLeft,
    isRunning,
    focusTime,
    shortBreak,
    longBreak,
    interval,
    completedSessions,
    totalDuration,
    progress,
    setFocusTime,
    setShortBreak,
    setLongBreak,
    setInterval,
    toggleTimer,
    resetTimer,
    skipToNext,
    switchMode,
    formatTime,
  } = useTimer();

  // SVG circle config
  const SIZE = 180;
  const STROKE = 10;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const getModeColor = () => {
    if (mode === "focus") return "#6366f1"; // indigo
    if (mode === "shortBreak") return "#10b981"; // emerald
    return "#8b5cf6"; // violet
  };

  const color = getModeColor();

  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#161b22] p-6 shadow-sm border border-slate-100 dark:border-white/[0.07] transition-all">
      {/* Header & Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Pomodoro Focus</h2>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/[0.1] px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Flame size={12} /> {completedSessions} done
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Timer Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-[#1e2530] p-1 mb-4">
        <button
          onClick={() => switchMode("focus")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mode === "focus"
              ? "bg-white dark:bg-[#252d3a] text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Focus ({focusTime}m)
        </button>
        <button
          onClick={() => switchMode("shortBreak")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mode === "shortBreak"
              ? "bg-white dark:bg-[#252d3a] text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Short ({shortBreak}m)
        </button>
        <button
          onClick={() => switchMode("longBreak")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mode === "longBreak"
              ? "bg-white dark:bg-[#252d3a] text-violet-600 dark:text-violet-400 shadow-sm"
              : "text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Long ({longBreak}m)
        </button>
      </div>

      {/* Circular Timer Display */}
      <div className="my-2 flex justify-center">
        <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-slate-100 dark:text-[#1e2530]"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={color}
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
            />
          </svg>

          {/* Centered Time & Status */}
          <div className="absolute flex flex-col items-center">
            <span
              className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-800 dark:text-white"
            >
              {formatTime(timeLeft)}
            </span>
            <span className="mt-0.5 text-xs font-semibold capitalize text-slate-400 dark:text-[#64748b]">
              {isRunning
                ? mode === "focus" ? "In Focus" : "Resting"
                : timeLeft === totalDuration ? "Ready" : "Paused"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress detail */}
      <p className="text-center text-xs text-slate-400 dark:text-[#64748b] mb-4">
        Session {completedSessions % interval + 1} of {interval} before long break
      </p>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2.5">
        <button
          onClick={toggleTimer}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95"
          style={{ backgroundColor: color }}
        >
          {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
        </button>

        <button
          onClick={resetTimer}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1e2530] text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-200 dark:hover:bg-[#252d3a] transition-colors"
          title="Reset timer"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={skipToNext}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1e2530] text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-200 dark:hover:bg-[#252d3a] transition-colors"
          title="Skip session"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <PomodoroSettings
          onClose={() => setShowSettings(false)}
          focusTime={focusTime}
          setFocusTime={setFocusTime}
          shortBreak={shortBreak}
          setShortBreak={setShortBreak}
          longBreak={longBreak}
          setLongBreak={setLongBreak}
          interval={interval}
          setInterval={setInterval}
        />
      )}
    </div>
  );
}
