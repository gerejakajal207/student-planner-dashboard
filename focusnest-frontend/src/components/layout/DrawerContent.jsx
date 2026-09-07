import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  User,
  Info,
  Brain,
  BookOpen,
  Sparkles,
  Kanban,
} from "lucide-react";

export default function DrawerContent({ close }) {
  return (
    <div className="space-y-6 p-5">
      <Section title="MAIN DASHBOARD">
        <NavItem to="/" icon={Home} label="Home" sub="Dashboard overview" close={close} />
        <NavItem
          to="/todays-page"
          icon={LayoutDashboard}
          label="Today's Mode"
          sub="Daily focus & Pomodoro"
          close={close}
        />
        <NavItem
          to="/board"
          icon={Kanban}
          label="Kanban Board"
          sub="Visual task workflow"
          close={close}
        />
        <NavItem
          to="/calendar"
          icon={Calendar}
          label="Calendar"
          sub="Deadlines & schedule"
          close={close}
        />
        <NavItem
          to="/profile"
          icon={User}
          label="Profile & Stats"
          sub="Streak & settings"
          close={close}
        />
      </Section>

      <Section title="STUDY & AI TOOLS">
        <NavItem
          to="/revise"
          icon={BookOpen}
          label="Flashcards Revision"
          sub="Spaced repetition practice"
          close={close}
        />
        <NavItem
          to="/mcq-test"
          icon={Brain}
          label="MCQ Practice Test"
          sub="Quiz & self assessment"
          close={close}
        />
        <NavItem
          to="/ai-assistant"
          icon={Sparkles}
          label="AI Study Assistant"
          sub="Powered by Gemini"
          highlight={true}
          close={close}
        />
      </Section>

      <Section title="ABOUT">
        <NavItem
          to="/about-us"
          icon={Info}
          label="About FocusNest"
          sub="Our mission & features"
          close={close}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-bold tracking-wider text-slate-400 dark:text-[#475569] uppercase">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, sub, close, highlight }) {
  return (
    <NavLink
      to={to}
      onClick={close}
      className={({ isActive }) =>
        `flex items-start gap-3 rounded-xl p-2.5 transition-all ${
          isActive
            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
            : highlight
            ? "bg-amber-50/70 dark:bg-amber-500/[0.07] hover:bg-amber-100/70 dark:hover:bg-amber-500/[0.12] text-slate-700 dark:text-[#e2e8f0]"
            : "hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-[#cbd5e1]"
        }`
      }
    >
      <div
        className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
          highlight
            ? "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
            : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-[#94a3b8]"
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium leading-tight truncate">{label}</p>
          {highlight && (
            <span className="rounded bg-amber-100 dark:bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-400">
              AI
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-[#64748b] mt-0.5 truncate">{sub}</p>
      </div>
    </NavLink>
  );
}
