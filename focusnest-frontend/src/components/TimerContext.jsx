import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const TimerContext = createContext();

const STORAGE_KEY = "focusnest_pomodoro_session";

// Audio alert chime using Web Audio API
function playAlertChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Note 1: E5
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

    // Note 2: G#5
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

    // Note 3: B5
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
    console.warn("Audio chime error:", e);
  }
}

// Request and send Chrome/Browser Notifications
async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

function sendBrowserNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  try {
    const notification = new Notification(title, {
      body,
      icon: "/logo.svg",
      tag: "focusnest-pomodoro",
      requireInteraction: false,
    });
    notification.onclick = function () {
      window.focus();
      this.close();
    };
  } catch (e) {
    console.warn("Notification error:", e);
  }
}

export function TimerProvider({ children }) {
  // Load initial state from sessionStorage (persists across route switching & tab switches, clears when tab/browser closes)
  const getInitialState = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was running when reloaded, calculate true remaining seconds from endTime
        if (parsed.isRunning && parsed.endTime) {
          const remaining = Math.max(0, Math.round((parsed.endTime - Date.now()) / 1000));
          return {
            ...parsed,
            timeLeft: remaining,
            isRunning: remaining > 0,
            endTime: remaining > 0 ? parsed.endTime : null,
          };
        }
        return parsed;
      }
    } catch {
      // fallback to defaults
    }
    return {
      mode: "focus", // "focus" | "shortBreak" | "longBreak"
      focusTime: 25,
      shortBreak: 5,
      longBreak: 20,
      interval: 4,
      completedSessions: 0,
      timeLeft: 25 * 60,
      isRunning: false,
      endTime: null,
    };
  };

  const initial = getInitialState();

  const [mode, setMode] = useState(initial.mode);
  const [focusTime, setFocusTime] = useState(initial.focusTime);
  const [shortBreak, setShortBreak] = useState(initial.shortBreak);
  const [longBreak, setLongBreak] = useState(initial.longBreak);
  const [interval, setIntervalCount] = useState(initial.interval);
  const [completedSessions, setCompletedSessions] = useState(initial.completedSessions);
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [endTime, setEndTime] = useState(initial.endTime);

  const timerRef = useRef(null);

  const getDurationForMode = useCallback(
    (m) => {
      if (m === "focus") return focusTime * 60;
      if (m === "shortBreak") return shortBreak * 60;
      return longBreak * 60;
    },
    [focusTime, shortBreak, longBreak]
  );

  // Sync state to sessionStorage whenever key fields change
  useEffect(() => {
    try {
      const stateToSave = {
        mode,
        focusTime,
        shortBreak,
        longBreak,
        interval,
        completedSessions,
        timeLeft,
        isRunning,
        endTime,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore storage quota errors
    }
  }, [mode, focusTime, shortBreak, longBreak, interval, completedSessions, timeLeft, isRunning, endTime]);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    playAlertChime();
    setIsRunning(false);
    setEndTime(null);

    if (mode === "focus") {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);

      const isLong = nextCount % interval === 0;
      const nextMode = isLong ? "longBreak" : "shortBreak";
      const nextDuration = isLong ? longBreak * 60 : shortBreak * 60;

      setMode(nextMode);
      setTimeLeft(nextDuration);

      sendBrowserNotification(
        "Focus Session Complete! 🎯",
        isLong
          ? `Awesome work! You completed ${nextCount} sessions. Time for a well-deserved ${longBreak}-minute Long Break!`
          : `Great job! Session ${nextCount} finished. Enjoy your ${shortBreak}-minute Short Break.`
      );
    } else {
      // Break is finished
      setMode("focus");
      setTimeLeft(focusTime * 60);

      sendBrowserNotification(
        "Break Over! ⚡",
        `Ready to jump back in? Click here to start your next ${focusTime}-minute Focus session.`
      );
    }
  }, [mode, completedSessions, interval, longBreak, shortBreak, focusTime]);

  // Main countdown tick loop (timestamp-based)
  useEffect(() => {
    if (!isRunning || !endTime) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const checkTime = () => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleSessionComplete();
      }
    };

    checkTime();
    timerRef.current = setInterval(checkTime, 1000);

    // Also check on tab refocus / visibility change
    const onVisibilityChange = () => {
      if (!document.hidden && isRunning && endTime) {
        checkTime();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onVisibilityChange);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onVisibilityChange);
    };
  }, [isRunning, endTime, handleSessionComplete]);

  // Dynamic Browser Tab Title while timer is active
  useEffect(() => {
    const originalTitle = "FocusNest • Student Dashboard";
    if (isRunning) {
      const m = Math.floor(timeLeft / 60);
      const s = timeLeft % 60;
      const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      const icon = mode === "focus" ? "🎯" : "☕";
      const modeLabel = mode === "focus" ? "Focus" : "Break";
      document.title = `${formatted} ${icon} ${modeLabel} | FocusNest`;
    } else {
      document.title = originalTitle;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [isRunning, timeLeft, mode]);

  // Public control methods
  const startTimer = () => {
    requestNotificationPermission();
    const currentDuration = timeLeft > 0 ? timeLeft : getDurationForMode(mode);
    const targetEnd = Date.now() + currentDuration * 1000;
    setEndTime(targetEnd);
    setTimeLeft(currentDuration);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    if (isRunning && endTime) {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }
    setIsRunning(false);
    setEndTime(null);
  };

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setEndTime(null);
    setTimeLeft(getDurationForMode(mode));
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
  };

  const switchMode = (newMode) => {
    pauseTimer();
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = getDurationForMode(mode);
  const elapsed = totalDuration - timeLeft;
  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

  return (
    <TimerContext.Provider
      value={{
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
        setInterval: setIntervalCount,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        skipToNext,
        switchMode,
        formatTime,
        requestNotificationPermission,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
