import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Play, Pause, RotateCcw, SkipForward, Flame } from "lucide-react";
import PomodoroSettings from "./PomodoroSettings";

// Gentle audio alert chime using Web Audio API
function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    // Chime note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Chime note 2: G#5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(830.61, now + 0.2);
    gain2.gain.setValueAtTime(0.25, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.8);

    // Chime note 3: B5
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(987.77, now + 0.4);
    gain3.gain.setValueAtTime(0.3, now + 0.4);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.4);
    osc3.stop(now + 1.2);
  } catch (e) {
    console.error("Audio chime error:", e);
  }
}

export default function Pomodoro() {
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState("focus"); // "focus" | "shortBreak" | "longBreak"
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(20);
  const [interval, setInterval] = useState(4);
  const [completedSessions, setCompletedSessions] = useState(0);

  const getDurationForMode = useCallback(
    (m) => {
      if (m === "focus") return focusTime * 60;
      if (m === "shortBreak") return shortBreak * 60;
      return longBreak * 60;
    },
    [focusTime, shortBreak, longBreak]
  );

  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const requestRef = useRef(null);

  // Update timer whenever durations or mode change while idle
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
      elapsedRef.current = 0;
    }
  }, [getDurationForMode, isRunning, mode]);

  const total = getDurationForMode(mode);
  const elapsed = total - timeLeft;
  const progress = total > 0 ? elapsed / total : 0;

  // SVG circle config
  const SIZE = 180;
  const STROKE = 10;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const handleSessionComplete = () => {
    playAlertChime();
    setIsRunning(false);
    cancelAnimationFrame(requestRef.current);
    elapsedRef.current = 0;

    if (mode === "focus") {
      const nextSessionCount = completedSessions + 1;
      setCompletedSessions(nextSessionCount);
      if (nextSessionCount % interval === 0) {
        setMode("longBreak");
        setTimeLeft(longBreak * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(shortBreak * 60);
      }
    } else {
      // Break is complete, go back to focus
      setMode("focus");
      setTimeLeft(focusTime * 60);
    }
  };

  const tick = () => {
    const now = Date.now();
    const currentModeTotal = getDurationForMode(mode);
    const elapsedSecs = Math.floor((now - startTimeRef.current) / 1000) + elapsedRef.current;
    const newTimeLeft = Math.max(currentModeTotal - elapsedSecs, 0);

    setTimeLeft(newTimeLeft);

    if (newTimeLeft > 0) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      handleSessionComplete();
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(tick);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    elapsedRef.current = getDurationForMode(mode) - timeLeft;
    cancelAnimationFrame(requestRef.current);
  };

  const toggleTimer = () => (isRunning ? pauseTimer() : startTimer());

  const resetTimer = () => {
    setIsRunning(false);
    cancelAnimationFrame(requestRef.current);
    setTimeLeft(getDurationForMode(mode));
    elapsedRef.current = 0;
  };

  const skipToNext = () => {
    pauseTimer();
    if (mode === "focus") {
      setMode("shortBreak");
      setTimeLeft(shortBreak * 60);
    } else {
      setMode("focus");
      setTimeLeft(focusTime * 60);
    }
    elapsedRef.current = 0;
  };

  const switchMode = (newMode) => {
    pauseTimer();
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
    elapsedRef.current = 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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
                : timeLeft === total ? "Ready" : "Paused"}
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
