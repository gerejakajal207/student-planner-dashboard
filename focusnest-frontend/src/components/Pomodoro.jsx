import { useState } from "react";
import {
  Settings,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Target,
  Check,
  X,
  ChevronDown,
  Headphones,
  Volume2,
  VolumeX,
} from "lucide-react";
import PomodoroSettings from "./PomodoroSettings";
import { useTimer } from "./TimerContext";
import { useTasks } from "./TaskContext";

export default function Pomodoro() {
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  const { tasks, updateTaskStatus } = useTasks() || { tasks: [] };

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
    activeTask,
    focusOnTask,
    clearActiveTask,
    soundscape,
    setSoundscape,
    soundscapeVolume,
    setSoundscapeVolume,
    soundscapePlaying,
    setSoundscapePlaying,
    notificationPermission,
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
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title={
            notificationPermission === "granted"
              ? "Timer & Notification Settings (Alerts Active)"
              : "Timer & Notification Settings"
          }
        >
          <Settings size={18} />
          {notificationPermission === "granted" && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
          )}
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

      {/* Active Task or Link Task Box */}
      <div className="mb-4">
        {activeTask ? (
          <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-500/[0.08] p-3 transition-all">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                <Target size={13} className={isRunning && mode === "focus" ? "animate-spin text-indigo-600" : ""} />
                Focusing on Task
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateTaskStatus && updateTaskStatus(activeTask.id, "Done")}
                  className="flex items-center gap-1 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold transition-colors"
                  title="Mark this task as Done"
                >
                  <Check size={11} /> Done
                </button>
                <button
                  onClick={clearActiveTask}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Detach task (Free Focus)"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
              {activeTask.title}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {activeTask.subject && <span className="font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">{activeTask.subject}</span>}
              {activeTask.subject && <span>·</span>}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">⏱️ {activeTask.focus_minutes || 0}m logged</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowTaskPicker(!showTaskPicker)}
              className="w-full flex items-center justify-between gap-1.5 rounded-xl border border-dashed border-slate-200 dark:border-white/[0.1] hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/[0.05] p-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 transition-all"
            >
              <div className="flex items-center gap-2">
                <Target size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="truncate">Link a task to track focus time...</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showTaskPicker ? "rotate-180" : ""}`} />
            </button>

            {/* Task Picker Dropdown */}
            {showTaskPicker && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-[#1e2530] p-1.5 shadow-xl border border-slate-200 dark:border-white/[0.1] text-left animate-fadeIn">
                {tasks && tasks.filter((t) => t.status !== "Done").length > 0 ? (
                  tasks
                    .filter((t) => t.status !== "Done")
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          focusOnTask(t);
                          setShowTaskPicker(false);
                        }}
                        className="w-full flex items-center justify-between rounded-lg p-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-[#e2e8f0] truncate">{t.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-[#64748b] truncate">{t.subject || t.category}</p>
                        </div>
                        {t.focus_minutes > 0 && (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            {t.focus_minutes}m
                          </span>
                        )}
                      </button>
                    ))
                ) : (
                  <p className="p-3 text-center text-xs text-slate-400 dark:text-[#64748b]">
                    No pending tasks found. Create a task first!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
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

      {/* ── AMBIENT SOUNDSCAPES ── */}
      <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-[#1e2530]/60 p-3.5 border border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                soundscapePlaying && soundscape !== "none"
                  ? "bg-indigo-600 text-white animate-pulse"
                  : "bg-slate-200 dark:bg-white/[0.08] text-slate-500"
              }`}
            >
              <Headphones size={13} />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-[#cbd5e1]">
              Ambient Soundscape
            </span>
            {soundscapePlaying && soundscape !== "none" && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded-full">
                <span className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1">Playing</span>
              </span>
            )}
          </div>

          {/* Play/Pause toggle */}
          {soundscape !== "none" && (
            <button
              onClick={() => setSoundscapePlaying(!soundscapePlaying)}
              className="flex items-center gap-1 rounded-lg bg-white dark:bg-[#252d3a] border border-slate-200/80 dark:border-white/[0.08] px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0] hover:text-indigo-600 shadow-2xs transition-all active:scale-95"
            >
              {soundscapePlaying ? <Volume2 size={12} className="text-indigo-600" /> : <VolumeX size={12} />}
              <span>{soundscapePlaying ? "Mute" : "Play"}</span>
            </button>
          )}
        </div>

        {/* Soundscape Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
          {[
            { id: "lofi", label: "Lo-Fi Beats", icon: "🎧" },
            { id: "rain", label: "Rain", icon: "🌧️" },
            { id: "whitenoise", label: "White Noise", icon: "💨" },
            { id: "coffeeshop", label: "Coffee Shop", icon: "☕" },
          ].map((item) => {
            const isSelected = soundscape === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (soundscape === item.id) {
                    setSoundscapePlaying(!soundscapePlaying);
                  } else {
                    setSoundscape(item.id);
                    setSoundscapePlaying(true);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs font-bold ring-1 ring-indigo-500"
                    : "bg-white dark:bg-[#252d3a] hover:bg-slate-100 dark:hover:bg-[#2e3748] text-slate-700 dark:text-[#cbd5e1] border border-slate-200/60 dark:border-white/[0.05]"
                }`}
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Off & Volume slider */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => {
              setSoundscape("none");
              setSoundscapePlaying(false);
            }}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
              soundscape === "none"
                ? "bg-slate-200 dark:bg-white/[0.1] text-slate-700 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            ⏹️ Off
          </button>

          {soundscape !== "none" && (
            <div className="flex items-center gap-2 flex-1 max-w-[170px]">
              <Volume2 size={13} className="text-slate-400 flex-shrink-0" />
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={soundscapeVolume}
                onChange={(e) => setSoundscapeVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                title={`Volume: ${Math.round(soundscapeVolume * 100)}%`}
              />
              <span className="text-[10px] text-slate-400 font-mono w-6 text-right">
                {Math.round(soundscapeVolume * 100)}%
              </span>
            </div>
          )}
        </div>
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
