import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../components/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    login(form.email);
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── LEFT PANEL ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 lg:flex lg:w-5/12 xl:w-1/2">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-5" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-white opacity-5" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500 opacity-20" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-xl">🎯</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FocusNest</span>
        </div>

        {/* Middle */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Welcome back.
              <br />
              <span className="text-indigo-200">Let's get focused.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-indigo-200">
              Your tasks, your calendar, and your goals are waiting. Pick up right where you left off.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm italic leading-relaxed text-indigo-100">
              "FocusNest completely changed how I manage my study sessions. I went from overwhelmed
              to on top of everything."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-300 text-sm font-bold text-indigo-800">
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sarah K.</p>
                <p className="text-xs text-indigo-300">Computer Science student</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "10k+", label: "Students" },
              { value: "98%",  label: "Satisfaction" },
              { value: "Free", label: "Always" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-indigo-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-indigo-300">
          Trusted by students worldwide · Free to get started
        </p>
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

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Sign in</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-indigo-600 transition-colors hover:text-indigo-800">
              Create one free
            </Link>
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

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
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-800">
                  Forgot password?
                </button>
              </div>
              <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${focused === "password" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"}`}>
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-center text-xs text-slate-400">
              By signing in, you agree to our{" "}
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