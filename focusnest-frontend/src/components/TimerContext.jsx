import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useTasks } from "./TaskContext";

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

// ── Web Audio API Ambient Soundscapes Synthesizer ──
let ambientCtx = null;
let ambientNodes = [];
let ambientGain = null;

function stopAmbientSoundscape() {
  try {
    if (ambientGain && ambientCtx) {
      ambientGain.gain.setValueAtTime(ambientGain.gain.value, ambientCtx.currentTime);
      ambientGain.gain.linearRampToValueAtTime(0.001, ambientCtx.currentTime + 0.3);
    }
    setTimeout(() => {
      ambientNodes.forEach((node) => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch {
          // ignore
        }
      });
      ambientNodes = [];
      ambientGain = null;
    }, 350);
  } catch (e) {
    console.warn("Error stopping soundscape", e);
  }
}

function playAmbientSoundscape(type, volume = 0.5) {
  stopAmbientSoundscape();
  if (!type || type === "none") return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!ambientCtx || ambientCtx.state === "closed") {
      ambientCtx = new AudioCtx();
    }
    if (ambientCtx.state === "suspended") {
      ambientCtx.resume();
    }

    const ctx = ambientCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(Math.max(0.03, Math.min(volume, 1.0)), ctx.currentTime + 0.4);
    masterGain.connect(ctx.destination);
    ambientGain = masterGain;

    if (type === "whitenoise") {
      // 3-second looped white noise with warm lowpass filter
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 950;

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      ambientNodes.push(noise, filter);
    } else if (type === "rain") {
      // Pink/rain noise with bandpass filtering and gentle modulation
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.22;
      }
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = buffer;
      rainSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100;
      filter.Q.value = 0.7;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.25;
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      rainSource.connect(filter);
      filter.connect(masterGain);
      rainSource.start();
      ambientNodes.push(rainSource, filter, lfo, lfoGain);
    } else if (type === "lofi") {
      // Warm chord pad + subtle lo-fi vibrato & vinyl warmth (F3, A3, C4, E4)
      const chordFreqs = [174.61, 220.0, 261.63, 329.63];
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.16;

      chordFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;

        const detuneLfo = ctx.createOscillator();
        const detuneGain = ctx.createGain();
        detuneLfo.frequency.value = 0.15 + Math.random() * 0.08;
        detuneGain.gain.value = 3.0;
        detuneLfo.connect(detuneGain);
        detuneGain.connect(osc.frequency);
        detuneLfo.start();

        osc.connect(padGain);
        osc.start();
        ambientNodes.push(osc, detuneLfo, detuneGain);
      });

      padGain.connect(filter);
      filter.connect(masterGain);
      ambientNodes.push(padGain, filter);
    } else if (type === "coffeeshop") {
      // Brown noise murmur simulation + warm ambience
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.2;
      }
      const chatter = ctx.createBufferSource();
      chatter.buffer = buffer;
      chatter.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 550;

      chatter.connect(filter);
      filter.connect(masterGain);
      chatter.start();
      ambientNodes.push(chatter, filter);
    }
  } catch (e) {
    console.warn("Audio soundscape playback error:", e);
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

  const { logFocus } = useTasks() || {};

  const [activeTask, setActiveTask] = useState(() => {
    try {
      const saved = sessionStorage.getItem("focusnest_pomodoro_task");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (activeTask) {
        sessionStorage.setItem("focusnest_pomodoro_task", JSON.stringify(activeTask));
      } else {
        sessionStorage.removeItem("focusnest_pomodoro_task");
      }
    } catch {
      // ignore storage quota errors
    }
  }, [activeTask]);

  const [mode, setMode] = useState(initial.mode);
  const [focusTime, setFocusTime] = useState(initial.focusTime);
  const [shortBreak, setShortBreak] = useState(initial.shortBreak);
  const [longBreak, setLongBreak] = useState(initial.longBreak);
  const [interval, setIntervalCount] = useState(initial.interval);
  const [completedSessions, setCompletedSessions] = useState(initial.completedSessions);
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [endTime, setEndTime] = useState(initial.endTime);

  const [soundscape, setSoundscape] = useState(() => {
    try {
      return localStorage.getItem("focusnest_soundscape") || "none";
    } catch {
      return "none";
    }
  });

  const [soundscapeVolume, setSoundscapeVolume] = useState(() => {
    try {
      const v = localStorage.getItem("focusnest_soundscape_volume");
      return v ? parseFloat(v) : 0.5;
    } catch {
      return 0.5;
    }
  });

  const [soundscapePlaying, setSoundscapePlaying] = useState(false);

  // Sync volume with active soundscape
  useEffect(() => {
    if (ambientGain && ambientCtx) {
      ambientGain.gain.setValueAtTime(soundscapeVolume, ambientCtx.currentTime);
    }
    try {
      localStorage.setItem("focusnest_soundscape_volume", soundscapeVolume.toString());
    } catch {
      // ignore
    }
  }, [soundscapeVolume]);

  // Persist soundscape type
  useEffect(() => {
    try {
      localStorage.setItem("focusnest_soundscape", soundscape);
    } catch {
      // ignore
    }
  }, [soundscape]);

  // Manage playback based on soundscape state and playing flag
  useEffect(() => {
    if (soundscapePlaying && soundscape !== "none") {
      playAmbientSoundscape(soundscape, soundscapeVolume);
    } else {
      stopAmbientSoundscape();
    }
  }, [soundscape, soundscapePlaying, soundscapeVolume]);

  // Auto-play/pause with timer when soundscape is selected
  useEffect(() => {
    if (soundscape !== "none") {
      if (isRunning && !soundscapePlaying) {
        setSoundscapePlaying(true);
      } else if (!isRunning && soundscapePlaying) {
        setSoundscapePlaying(false);
      }
    }
  }, [isRunning, soundscape, soundscapePlaying]);

  const toggleSoundscape = () => {
    if (soundscape === "none") {
      setSoundscape("lofi");
      setSoundscapePlaying(true);
    } else {
      setSoundscapePlaying((prev) => !prev);
    }
  };

  const timerRef = useRef(null);

  const getDurationForMode = useCallback(
    (m) => {
      if (m === "focus") return focusTime * 60;
      if (m === "shortBreak") return shortBreak * 60;
      return longBreak * 60;
    },
    [focusTime, shortBreak, longBreak]
  );

  const focusOnTask = useCallback(
    (task) => {
      if (!task) return;
      setActiveTask(task);
      setMode("focus");
      const duration = focusTime * 60;
      setTimeLeft(duration);
      setIsRunning(true);
      setEndTime(Date.now() + duration * 1000);
    },
    [focusTime]
  );

  const clearActiveTask = useCallback(() => {
    setActiveTask(null);
  }, []);

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

      // Auto-log focus minutes directly to the task
      if (activeTask?.id && logFocus) {
        logFocus(activeTask.id, focusTime);
      }

      const isLong = nextCount % interval === 0;
      const nextMode = isLong ? "longBreak" : "shortBreak";
      const nextDuration = isLong ? longBreak * 60 : shortBreak * 60;

      setMode(nextMode);
      setTimeLeft(nextDuration);

      const taskName = activeTask?.title ? ` on "${activeTask.title}"` : "";
      sendBrowserNotification(
        "Focus Session Complete! 🎯",
        isLong
          ? `Awesome work! Completed ${nextCount} sessions${taskName}. Time for a well-deserved ${longBreak}-minute Long Break!`
          : `Great job! Logged ${focusTime} mins of focus${taskName}. Enjoy your ${shortBreak}-minute Short Break.`
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
  }, [mode, completedSessions, interval, longBreak, shortBreak, focusTime, activeTask, logFocus]);

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
        activeTask,
        setActiveTask,
        focusOnTask,
        clearActiveTask,
        soundscape,
        setSoundscape,
        soundscapeVolume,
        setSoundscapeVolume,
        soundscapePlaying,
        setSoundscapePlaying,
        toggleSoundscape,
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
