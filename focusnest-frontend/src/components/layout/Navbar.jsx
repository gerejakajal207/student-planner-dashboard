import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, Moon, Sun, X, Sparkles } from "lucide-react";
import DrawerContent from "./DrawerContent";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !dark ? "dark" : "light";
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setDark(!dark);
    localStorage.setItem("theme", newTheme);
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "bg-white/15 dark:bg-white/10 text-white font-semibold px-3.5 py-1.5 rounded-full text-sm backdrop-blur-md shadow-sm border border-white/20"
      : "text-white/80 hover:text-white hover:bg-white/10 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all";

  return (
    <>
      <nav className="sticky top-0 z-40 flex h-16 items-center justify-between bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0d1117] border-b border-indigo-500/20 dark:border-white/[0.06] px-4 sm:px-6 shadow-md dark:shadow-black/40 transition-colors">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-xl shadow-inner group-hover:scale-105 transition-transform">
            🎯
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-tight leading-none">FocusNest</span>
            <span className="text-[10px] text-indigo-200 dark:text-indigo-400/70 font-medium">Student Dashboard</span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center justify-center gap-1.5">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/todays-page" className={navClass}>
            Today
          </NavLink>
          <NavLink to="/board" className={navClass}>
            Kanban
          </NavLink>
          <NavLink to="/calendar" className={navClass}>
            Calendar
          </NavLink>
          <NavLink to="/revise" className={navClass}>
            Flashcards
          </NavLink>
          <NavLink to="/mcq-test" className={navClass}>
            MCQ Quiz
          </NavLink>
          <NavLink to="/ai-assistant" className={navClass}>
            <span className="flex items-center gap-1 text-amber-300 dark:text-amber-400">
              <Sparkles size={14} /> AI Assistant
            </span>
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            Profile
          </NavLink>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open Menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Extended Menu  */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            aria-label="Close menu"
            className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <aside className="h-full w-80 max-w-[85vw] overflow-y-auto bg-white dark:bg-[#161b22] text-slate-800 dark:text-[#e2e8f0] shadow-2xl border-l border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span className="font-bold text-base text-slate-800 dark:text-white">Navigation</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <DrawerContent close={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
