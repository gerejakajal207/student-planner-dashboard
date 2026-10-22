import { useEffect } from "react";
import { CheckCircle2, Sparkles, X, Coffee, Play, Bell } from "lucide-react";
import { useTimer } from "./TimerContext";

export default function SessionAlertToast() {
  const { sessionAlert, dismissSessionAlert, switchMode, startTimer } = useTimer();

  // Auto-dismiss after 14 seconds if user doesn't interact
  useEffect(() => {
    if (!sessionAlert) return;
    const timer = setTimeout(() => {
      dismissSessionAlert();
    }, 14000);
    return () => clearTimeout(timer);
  }, [sessionAlert, dismissSessionAlert]);

  if (!sessionAlert) return null;

  const isFocusComplete = sessionAlert.mode === "focus";
  const isBreakOver = sessionAlert.mode === "shortBreak" || sessionAlert.mode === "longBreak";
  const isTest = sessionAlert.isTest;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-5 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/40 dark:border-indigo-400/30 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md p-4 sm:p-5 shadow-2xl shadow-indigo-500/20">
        {/* Accent top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="flex items-start gap-3.5">
          {/* Animated Icon Avatar */}
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-md ${
              isTest
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                : isFocusComplete
                ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/25"
                : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/25"
            }`}
          >
            {isTest ? (
              <Bell size={22} className="animate-bounce" />
            ) : isFocusComplete ? (
              <Sparkles size={22} className="animate-spin" style={{ animationDuration: "3s" }} />
            ) : (
              <CheckCircle2 size={22} />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                {isTest ? "System Test" : isFocusComplete ? "Focus Goal Achieved" : "Break Complete"}
              </span>
            </div>
            <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
              {sessionAlert.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-[#94a3b8] leading-relaxed">
              {sessionAlert.message}
            </p>

            {/* Action buttons */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {isFocusComplete && (
                <button
                  onClick={() => {
                    dismissSessionAlert();
                    switchMode(sessionAlert.isLongBreak ? "longBreak" : "shortBreak");
                    startTimer();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  <Coffee size={13} /> Take a Break
                </button>
              )}

              {isBreakOver && (
                <button
                  onClick={() => {
                    dismissSessionAlert();
                    switchMode("focus");
                    startTimer();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  <Play size={13} /> Start Next Focus
                </button>
              )}

              <button
                onClick={dismissSessionAlert}
                className="rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] hover:bg-slate-100 dark:hover:bg-[#252d3a] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={dismissSessionAlert}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
