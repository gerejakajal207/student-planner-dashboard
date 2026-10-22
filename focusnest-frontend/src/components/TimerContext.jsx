import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useTasks } from "./TaskContext";

const TimerContext = createContext();

const STORAGE_KEY = "focusnest_pomodoro_session";

// ── Web Audio Context & Synthesizers ──
let sharedAudioCtx = null;
let currentNodes = [];
let currentMasterGain = null;
let activeSoundscapeType = null;
let fadeTimeoutId = null;

function getSharedAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.warn("AudioContext init error:", e);
    return null;
  }
}

// Audio alert chime using Web Audio API
function playAlertChime() {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic 4-bell chime (C5 -> G5 -> C6 -> E6)
    const notes = [
      { freq: 523.25, time: 0.0,  dur: 0.7, gain: 0.35 },
      { freq: 783.99, time: 0.16, dur: 0.8, gain: 0.38 },
      { freq: 1046.5, time: 0.32, dur: 1.1, gain: 0.42 },
      { freq: 1318.5, time: 0.48, dur: 1.4, gain: 0.35 },
    ];

    notes.forEach(({ freq, time, dur, gain: noteGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(noteGain, now + time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([300, 150, 300]);
    }
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
}

// ── Web Audio API Ambient Soundscapes Synthesizer ──
function stopAmbientSoundscape(immediate = false) {
  if (fadeTimeoutId) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }

  const nodesToStop = currentNodes;
  const gainToStop = currentMasterGain;
  currentNodes = [];
  currentMasterGain = null;
  activeSoundscapeType = null;

  if (!nodesToStop || nodesToStop.length === 0) return;

  if (immediate || !gainToStop || !sharedAudioCtx || sharedAudioCtx.state !== "running") {
    nodesToStop.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {}
    });
    return;
  }

  try {
    const now = sharedAudioCtx.currentTime;
    gainToStop.gain.setValueAtTime(gainToStop.gain.value, now);
    gainToStop.gain.linearRampToValueAtTime(0.0001, now + 0.25);
  } catch {}

  fadeTimeoutId = setTimeout(() => {
    nodesToStop.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {}
    });
    fadeTimeoutId = null;
  }, 300);
}

function setAmbientVolume(vol) {
  if (currentMasterGain && sharedAudioCtx && sharedAudioCtx.state === "running") {
    try {
      const target = Math.max(0.01, Math.min(vol, 1.0));
      currentMasterGain.gain.setValueAtTime(currentMasterGain.gain.value, sharedAudioCtx.currentTime);
      currentMasterGain.gain.linearRampToValueAtTime(target, sharedAudioCtx.currentTime + 0.08);
    } catch {}
  }
}

function playAmbientSoundscape(type, volume = 0.5) {
  if (!type || type === "none") {
    stopAmbientSoundscape();
    return;
  }

  const ctx = getSharedAudioContext();
  if (!ctx) return;

  // If already playing this exact track, just adjust volume
  if (activeSoundscapeType === type && currentMasterGain) {
    setAmbientVolume(volume);
    return;
  }

  // Stop any previous track immediately without touching newly created nodes
  stopAmbientSoundscape(true);

  try {
    const masterGain = ctx.createGain();
    const targetVol = Math.max(0.01, Math.min(volume, 1.0));
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.2);
    masterGain.connect(ctx.destination);

    currentMasterGain = masterGain;
    activeSoundscapeType = type;
    const newNodes = [];

    if (type === "whitenoise") {
      // 5-second seamless looped warm white noise with lowpass
      const bufferSize = ctx.sampleRate * 5;
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
      filter.frequency.setValueAtTime(900, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      newNodes.push(noise, filter);
    } else if (type === "rain") {
      // 5-second pink noise with dual bandpass & soft wind LFO
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.25;
      }
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = buffer;
      rainSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1050, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(200, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      rainSource.connect(filter);
      filter.connect(masterGain);
      rainSource.start();
      newNodes.push(rainSource, filter, lfo, lfoGain);
    } else if (type === "lofi") {
      // Warm chord pad (Fmaj7: F3, A3, C4, E4) + subtle tape drift
      const chordFreqs = [174.61, 220.0, 261.63, 329.63];
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.18, ctx.currentTime);

      chordFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const detuneLfo = ctx.createOscillator();
        const detuneGain = ctx.createGain();
        detuneLfo.frequency.setValueAtTime(0.12 + idx * 0.04, ctx.currentTime);
        detuneGain.gain.setValueAtTime(2.8, ctx.currentTime);
        detuneLfo.connect(detuneGain);
        detuneGain.connect(osc.frequency);
        detuneLfo.start();

        osc.connect(padGain);
        osc.start();
        newNodes.push(osc, detuneLfo, detuneGain);
      });

      padGain.connect(filter);
      filter.connect(masterGain);
      newNodes.push(padGain, filter);
    } else if (type === "coffeeshop") {
      // Warm room murmur simulation + soft background texture
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const chatter = ctx.createBufferSource();
      chatter.buffer = buffer;
      chatter.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, ctx.currentTime);

      chatter.connect(filter);
      filter.connect(masterGain);
      chatter.start();
      newNodes.push(chatter, filter);
    }

    currentNodes = newNodes;
  } catch (e) {
    console.warn("Audio soundscape playback error:", e);
  }
}

// Register Service Worker for background desktop notifications
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .catch((err) => console.warn("SW register error:", err));
}

// Request and send Chrome/Browser Notifications
async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return Notification.permission;
  }
}

function sendBrowserNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }

  const options = {
    body,
    icon: "/logo192.png",
    badge: "/favicon.ico",
    tag: "focusnest-pomodoro-alert",
    renotify: true,
    requireInteraction: true,
    silent: false,
  };

  // 1. Try Service Worker showNotification (works in background tabs & minimized browser)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.showNotification(title, options);
      })
      .catch(() => {
        try {
          const notification = new Notification(title, options);
          notification.onclick = function () {
            window.focus();
            this.close();
          };
        } catch (e) {
          console.warn("Notification error:", e);
        }
      });
  } else {
    // 2. Direct Window Notification
    try {
      const notification = new Notification(title, options);
      notification.onclick = function () {
        window.focus();
        this.close();
      };
    } catch (e) {
      console.warn("Notification error:", e);
    }
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
  const [sessionAlert, setSessionAlert] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const dismissSessionAlert = useCallback(() => {
    setSessionAlert(null);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === "granted") {
      sendBrowserNotification(
        "FocusNest Desktop Notifications Enabled! 🎯",
        "You will now receive desktop notifications even when you are on another tab or app!"
      );
    }
    return perm;
  }, []);

  const testNotification = useCallback(async () => {
    playAlertChime();
    const perm = await handleRequestPermission();
    if (perm === "granted") {
      sendBrowserNotification(
        "FocusNest Desktop Notification 🔔",
        "It works! You will receive desktop notifications when sessions end, even on other tabs or apps."
      );
    }
    setSessionAlert({
      id: Date.now(),
      title: perm === "granted" ? "Desktop Notification Sent! 🔔" : "Permission Needed 🔔",
      message:
        perm === "granted"
          ? "Check your desktop screen for the Windows notification popup!"
          : "Please click 'Allow' in Chrome's permission prompt or check the lock icon in the address bar.",
      mode: "test",
      isTest: true,
    });
    return perm;
  }, [handleRequestPermission]);

  const volumeRef = useRef(soundscapeVolume);
  const workerRef = useRef(null);

  // Background Web Worker to ensure timer ticks accurately even when Chrome is minimized or in a background tab
  useEffect(() => {
    const workerScript = `
      let timerId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (timerId) clearInterval(timerId);
          timerId = setInterval(function() {
            self.postMessage('tick');
          }, 1000);
        } else if (e.data === 'stop') {
          if (timerId) {
            clearInterval(timerId);
            timerId = null;
          }
        }
      };
    `;

    try {
      const blob = new Blob([workerScript], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));
      workerRef.current = worker;
    } catch (e) {
      console.warn("Could not start background timer worker:", e);
      workerRef.current = null;
    }

    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch {}
        workerRef.current = null;
      }
    };
  }, []);

  // Sync volume with active soundscape without recreating nodes
  useEffect(() => {
    volumeRef.current = soundscapeVolume;
    setAmbientVolume(soundscapeVolume);
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
      playAmbientSoundscape(soundscape, volumeRef.current);
    } else {
      stopAmbientSoundscape();
    }
  }, [soundscape, soundscapePlaying]);

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
      if (soundscape !== "none") {
        setSoundscapePlaying(true);
      }
    },
    [focusTime, soundscape]
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
    // 1. Stop ambient soundscape immediately so chime and alert are heard
    stopAmbientSoundscape(false);
    setSoundscapePlaying(false);

    // 2. Play clear chime & trigger vibration
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
      const alertTitle = "Focus Session Complete! 🎯";
      const alertMsg = isLong
        ? `Awesome work! Completed ${nextCount} sessions${taskName}. Time for a well-deserved ${longBreak}-minute Long Break!`
        : `Great job! Logged ${focusTime} mins of focus${taskName}. Enjoy your ${shortBreak}-minute Short Break.`;

      sendBrowserNotification(alertTitle, alertMsg);

      setSessionAlert({
        id: Date.now(),
        title: alertTitle,
        message: alertMsg,
        mode: "focus",
        isLongBreak: isLong,
        nextMode: nextMode,
      });
    } else {
      // Break is finished
      setMode("focus");
      setTimeLeft(focusTime * 60);

      const alertTitle = "Break Over! ⚡";
      const alertMsg = `Ready to jump back in? Time to start your next ${focusTime}-minute Focus session.`;

      sendBrowserNotification(alertTitle, alertMsg);

      setSessionAlert({
        id: Date.now(),
        title: alertTitle,
        message: alertMsg,
        mode: mode,
        isLongBreak: false,
        nextMode: "focus",
      });
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
        if (timerRef.current) clearInterval(timerRef.current);
        if (workerRef.current) workerRef.current.postMessage("stop");
        handleSessionComplete();
      }
    };

    checkTime();

    // 1. Standard interval
    timerRef.current = setInterval(checkTime, 1000);

    // 2. Exact millisecond timeout
    const msToFinish = Math.max(0, endTime - Date.now());
    const exactTimeoutId = setTimeout(checkTime, msToFinish + 50);

    // 3. Web Worker tick for background tabs
    const worker = workerRef.current;
    if (worker) {
      worker.onmessage = (e) => {
        if (e.data === "tick") {
          checkTime();
        }
      };
      worker.postMessage("start");
    }

    // Also check on tab refocus / visibility change
    const onVisibilityChange = () => {
      if (isRunning && endTime) {
        checkTime();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (exactTimeoutId) clearTimeout(exactTimeoutId);
      if (worker) {
        worker.postMessage("stop");
        worker.onmessage = null;
      }
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
    handleRequestPermission();
    if (soundscape !== "none" && !soundscapePlaying) {
      setSoundscapePlaying(true);
    }
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
        requestNotificationPermission: handleRequestPermission,
        notificationPermission,
        testNotification,
        sessionAlert,
        dismissSessionAlert,
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
