import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";
import { api } from "../api";

const COOLDOWN_SECONDS = 30;

export default function ForgotPasswordPage() {
  const [email, setEmail]           = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [cooldown, setCooldown]     = useState(0); // seconds remaining
  const timerRef                    = useRef(null);

  // Tick down the cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setError("");

    try {
      await api.forgotPassword(email.trim());
      setSubmitted(true);
      setCooldown(COOLDOWN_SECONDS); // start 30s cooldown
    } catch (err) {
      // Even on network error keep the safe message shown — don't expose internals
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Allow resending — reset the "submitted" view and start again
  function handleResend() {
    if (cooldown > 0) return;
    setSubmitted(false);
    setError("");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 lg:flex lg:w-5/12 xl:w-1/2">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-5" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-white opacity-5" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-xl">🎯</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FocusNest</span>
        </div>

        <div className="relative space-y-4">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Forgot your<br />
            <span className="text-indigo-200">password?</span>
          </h2>
          <p className="text-sm leading-relaxed text-indigo-200 max-w-xs">
            No worries — it happens. Enter the email you used to sign up and we'll send you a secure reset link within seconds.
          </p>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm max-w-xs">
            <Sparkles className="h-5 w-5 text-amber-300 flex-shrink-0" />
            <p className="text-xs text-indigo-100">
              Reset links expire in <strong>15 minutes</strong> for your security.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-indigo-300">
          Trusted by students worldwide · Free to get started
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md" style={{ animation: "fadeSlideUp 0.4s ease both" }}>

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-lg">🎯</span>
            </div>
            <span className="text-lg font-bold text-slate-800">FocusNest</span>
          </div>

          {!submitted ? (
            <>
              <Link
                to="/login"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>

              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Reset your password</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter your registered email and we'll send a reset link.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative flex items-center rounded-xl border-2 border-slate-200 bg-white transition-all duration-200 focus-within:border-indigo-500 focus-within:shadow-sm focus-within:shadow-indigo-100">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend available in ${cooldown}s`
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Remembered it?{" "}
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-3xl">📬</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Check your inbox</h1>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                If <strong>{email}</strong> is registered with FocusNest, a password reset link has been sent to that address. Check your spam folder too.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                The link expires in <strong>15 minutes</strong>.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend email"}
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
