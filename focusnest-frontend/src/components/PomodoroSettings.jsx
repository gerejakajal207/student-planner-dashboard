import { useState } from "react";
import { X, Check, RotateCcw, Bell, Volume2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTimer } from "./TimerContext";

export default function PomodoroSettings({
  onClose,
  focusTime,
  setFocusTime,
  shortBreak,
  setShortBreak,
  longBreak,
  setLongBreak,
  interval,
  setInterval,
}) {
  const { testNotification, notificationPermission, requestNotificationPermission } = useTimer();
  const [localFocus, setLocalFocus] = useState(focusTime);
  const [localShort, setLocalShort] = useState(shortBreak);
  const [localLong, setLocalLong] = useState(longBreak);
  const [localInterval, setLocalInterval] = useState(interval);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await testNotification();
    setTimeout(() => setTesting(false), 2000);
  };

  const handleSave = () => {
    setFocusTime(localFocus);
    setShortBreak(localShort);
    setLongBreak(localLong);
    setInterval(localInterval);
    onClose();
  };

  const handleResetDefaults = () => {
    setLocalFocus(25);
    setLocalShort(5);
    setLocalLong(20);
    setLocalInterval(4);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-white/[0.07]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Pomodoro Timer Settings</h2>
            <p className="text-xs text-slate-400 dark:text-[#64748b] mt-0.5">Customize your focus intervals and rest periods</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Focus Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
              Focus Session
            </label>
            <select
              value={localFocus}
              onChange={(e) => setLocalFocus(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={25}>25 Minutes (Standard)</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes (Deep)</option>
              <option value={50}>50 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          {/* Short Break */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
              Short Break
            </label>
            <select
              value={localShort}
              onChange={(e) => setLocalShort(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={3}>3 Minutes</option>
              <option value={5}>5 Minutes (Standard)</option>
              <option value={10}>10 Minutes</option>
            </select>
          </div>

          {/* Long Break */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
              Long Break
            </label>
            <select
              value={localLong}
              onChange={(e) => setLocalLong(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes (Standard)</option>
              <option value={25}>25 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
              Long Break Interval
            </label>
            <select
              value={localInterval}
              onChange={(e) => setLocalInterval(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={2}>Every 2 Sessions</option>
              <option value={3}>Every 3 Sessions</option>
              <option value={4}>Every 4 Sessions (Standard)</option>
              <option value={5}>Every 5 Sessions</option>
            </select>
          </div>
        </div>

        {/* ── Notification & Sound Settings ── */}
        <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-[#1e2530]/60 p-3.5 border border-slate-100 dark:border-white/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                Completion Alerts & Notifications
              </span>
            </div>
            {notificationPermission === "granted" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Desktop Active
              </span>
            ) : notificationPermission === "denied" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <AlertTriangle size={12} /> Blocked in Browser
              </span>
            ) : (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Enable Desktop Alerts
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-[#94a3b8] mb-3 leading-relaxed">
            When your focus or break timer finishes, you receive an in-app visual alert, Web Audio chime, and browser desktop notification.
          </p>

          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#252d3a] hover:bg-slate-100 dark:hover:bg-[#2c3545] border border-slate-200/80 dark:border-white/[0.08] py-2 px-3 text-xs font-bold text-slate-700 dark:text-[#e2e8f0] shadow-2xs transition-all active:scale-98"
          >
            <Volume2 size={14} className={testing ? "animate-ping text-indigo-600" : "text-indigo-600"} />
            <span>{testing ? "Testing Sound & Alert..." : "Test Notification & Chime"}</span>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
          >
            <RotateCcw size={12} /> Reset Defaults
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95"
            >
              <Check size={16} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
