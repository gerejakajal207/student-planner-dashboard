import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { api } from "../api";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_HINT  = "Min. 8 chars · uppercase · lowercase · number · special char (@$!%*?&)";

export default function ResetPasswordPage() {
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const token                       = searchParams.get("token") || "";

  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState(false);

  const passwordValid  = PASSWORD_REGEX.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // If no token in URL show an error state immediately
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-2xl">❌</div>
          <h2 className="text-xl font-bold text-slate-800">Invalid reset link</h2>
          <p className="mt-2 text-sm text-slate-500">This link is missing a token. Please request a new password reset.</p>
          <Link to="/forgot-password" className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:underline">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError(PASSWORD_HINT);
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
      // Auto-redirect to login after 3s
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
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
            Set a new<br />
            <span className="text-indigo-200">password.</span>
          </h2>
          <p className="text-sm leading-relaxed text-indigo-200 max-w-xs">
            Choose a strong password that you haven't used before. Make it memorable but hard to guess.
          </p>
          <ul className="space-y-1.5 text-xs text-indigo-200">
            <li>✓ At least 8 characters</li>
            <li>✓ One uppercase letter (A–Z)</li>
            <li>✓ One lowercase letter (a–z)</li>
            <li>✓ One number (0–9)</li>
            <li>✓ One special character (@$!%*?&)</li>
          </ul>
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

          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Create new password</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Your new password must meet the security requirements.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

                {/* New password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                  <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${
                    newPassword
                      ? passwordValid
                        ? "border-emerald-400"
                        : "border-red-400"
                      : "border-slate-200 focus-within:border-indigo-500 focus-within:shadow-sm focus-within:shadow-indigo-100"
                  }`}>
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      className="w-full rounded-xl bg-transparent py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNew((p) => !p)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && !passwordValid && (
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{PASSWORD_HINT}</p>
                  )}
                  {newPassword && passwordValid && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-600">✓ Password meets all requirements</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${
                    confirmPassword
                      ? passwordsMatch
                        ? "border-emerald-400"
                        : "border-red-400"
                      : "border-slate-200 focus-within:border-indigo-500 focus-within:shadow-sm focus-within:shadow-indigo-100"
                  }`}>
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      className="w-full rounded-xl bg-transparent py-3 pl-10 pr-16 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <div className="absolute right-3.5 flex items-center gap-1.5">
                      {confirmPassword && (
                        <CheckCircle className={`h-4 w-4 ${passwordsMatch ? "text-emerald-500" : "text-red-400"}`} />
                      )}
                      <button type="button" onClick={() => setShowConfirm((p) => !p)}
                        className="text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 leading-relaxed">
                    {error}{" "}
                    {error.includes("expired") && (
                      <Link to="/forgot-password" className="font-semibold underline">Request a new link</Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !passwordValid || !passwordsMatch}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Resetting...
                    </>
                  ) : "Set New Password"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Password reset!</h1>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Your password has been updated successfully.
                You'll be redirected to the login page in a moment.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Go to login
              </Link>
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
