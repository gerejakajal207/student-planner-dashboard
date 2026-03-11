import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import PomodoroSettings from "./PomodoroSettings";

export default function Pomodoro() {
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(20);
  const [interval, setInterval] = useState(4);
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const requestRef = useRef(null);

  // SVG circle config
  const SIZE = 180;
  const STROKE = 10;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const total = focusTime * 60;
  const elapsed = total - timeLeft;
  const progress = elapsed / total;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    resetTimer();
  }, [focusTime]);

  const tick = () => {
    const now = Date.now();
    const elapsedSecs = Math.floor((now - startTimeRef.current) / 1000) + elapsedRef.current;
    const newTimeLeft = Math.max(focusTime * 60 - elapsedSecs, 0);
    setTimeLeft(newTimeLeft);
    if (newTimeLeft > 0) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      setIsRunning(false);
      elapsedRef.current = 0;
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
    elapsedRef.current = focusTime * 60 - timeLeft;
    cancelAnimationFrame(requestRef.current);
  };

  const toggleTimer = () => (isRunning ? pauseTimer() : startTimer());

  const resetTimer = () => {
    setIsRunning(false);
    cancelAnimationFrame(requestRef.current);
    setTimeLeft(focusTime * 60);
    elapsedRef.current = 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getColor = () => {
    if (!isRunning && progress < 0.01) return "#3b82f6"; // blue when idle
    if (progress < 0.5) return "#3b82f6"; // blue first half
    if (progress < 0.8) return "#10b981"; // green second half
    return "#f59e0b"; // amber near end
  };

  const color = getColor();

  return (
    <div className="relative w-full rounded-xl bg-white p-8 shadow-lg">
      {!showSettings && (
        <>
          {/* Settings Icon */}
          <div
            className="absolute right-5 top-5 cursor-pointer"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-6 w-6 text-gray-400 transition-colors hover:text-gray-700" />
          </div>

          <h1 className="mb-6 text-2xl font-bold text-[#1a2b4d]">Focus Time</h1>

          {/* Circular Timer */}
          <div className="mb-2 flex justify-center">
            <div
              className="relative flex items-center justify-center"
              style={{ width: SIZE, height: SIZE }}
            >
              <svg
                width={SIZE}
                height={SIZE}
                className="absolute left-0 top-0"
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* Grey base track */}
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth={STROKE}
                />
                {/* Faint full colored ghost ring */}
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  opacity="0.2"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={0}
                  style={{ transition: "stroke 0.8s ease" }}
                />
                {/* Active progress ring */}
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={progress < 0.01 ? CIRCUMFERENCE : dashOffset}
                  style={{
                    transition: "stroke-dashoffset 0.5s ease, stroke 0.8s ease",
                  }}
                />
              </svg>

              {/* Center text */}
              <div className="relative flex flex-col items-center">
                <span
                  className="text-3xl font-bold tabular-nums transition-colors duration-700"
                  style={{ color }}
                >
                  {formatTime(timeLeft)}
                </span>
                <span className="mt-0.5 text-xs text-slate-400">
                  {isRunning ? "focusing..." : timeLeft === total ? "ready" : "paused"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress label */}
          <p className="mb-6 text-center text-xs text-slate-400">
            {Math.round(progress * 100)}% complete · {focusTime} min session
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className="rounded-xl px-6 py-3 font-medium text-white transition-all active:scale-95"
              style={{
                backgroundColor: color,
                boxShadow: `0 4px 14px ${color}55`,
              }}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={resetTimer}
              className="rounded-xl bg-slate-100 px-6 py-3 font-medium text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
            >
              Reset
            </button>
          </div>
        </>
      )}

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
