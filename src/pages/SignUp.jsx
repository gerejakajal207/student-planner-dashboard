import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const features = [
  { emoji: "📅", title: "Smart Calendar", desc: "Plan tasks visually by date" },
  { emoji: "🗂️", title: "Kanban Board",   desc: "Track progress across stages" },
  { emoji: "⏱️", title: "Focus Timer",    desc: "Stay in flow with Pomodoro" },
  { emoji: "📊", title: "Daily Insights", desc: "See your productivity trends" },
];

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [focused, setFocused] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    signup(form.name, form.email);
    navigate("/");
  }

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)  return { label: "Weak",   color: "bg-red-400",    width: "w-1/3" };
    if (p.length < 10) return { label: "Fair",   color: "bg-amber-400",  width: "w-2/3" };
    return               { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = passwordStrength();
  const passwordsMatch = form.confirm && form.password === form.confirm;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white opacity-5 translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-violet-500 opacity-20 -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-xl">🎯</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FocusNest</span>
        </div>

        {/* Middle content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Your productivity,<br />
              <span className="text-indigo-200">reimagined.</span>
            </h2>
            <p className="mt-3 text-indigo-200 text-sm leading-relaxed">
              Join thousands of students who plan smarter, focus deeper, and achieve more every day.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 border border-white/10"
              >
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-indigo-200">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-indigo-300">Trusted by students worldwide · Free to get started</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md" style={{ animation: "fadeSlideUp 0.5s ease both" }}>

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-lg">🎯</span>
            </div>
            <span className="text-lg font-bold text-slate-800">FocusNest</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              Sign in
            </Link>
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${focused === "name" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"}`}>
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${focused === "email" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"}`}>
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${focused === "password" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"}`}>
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`mt-1 text-xs font-medium ${strength.color.replace("bg-", "text-")}`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${
                focused === "confirm"
                  ? "border-indigo-500 shadow-sm shadow-indigo-100"
                  : form.confirm
                  ? passwordsMatch ? "border-emerald-400" : "border-red-400"
                  : "border-slate-200"
              }`}>
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused("")}
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-16 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <div className="absolute right-3.5 flex items-center gap-1.5">
                  {form.confirm && (
                    <CheckCircle className={`h-4 w-4 transition-colors ${passwordsMatch ? "text-emerald-500" : "text-red-400"}`} />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {form.confirm && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Create Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By signing up, you agree to our{" "}
              <span className="cursor-pointer text-indigo-600 hover:underline">Privacy Policy</span>
              {" "}and{" "}
              <span className="cursor-pointer text-indigo-600 hover:underline">Terms of Use</span>
            </p>
          </form>
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