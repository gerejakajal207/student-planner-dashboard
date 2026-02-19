import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, Calendar, User, Info, Brain, BookOpen } from "lucide-react";

export default function DrawerContent({ close }) {
  return (
    <div className="space-y-6 p-5">
      <Section title="MAIN MENU">
        <NavItem to="/home" icon={Home} label="Home" sub="Dashboard overview" close={close} />
        <NavItem
          to="/todays-page"
          icon={LayoutDashboard}
          label="Today"
          sub="Tasks & schedule"
          close={close}
        />
        <NavItem
          to="/board"
          icon={LayoutDashboard}
          label="Board"
          sub="Kanban management"
          close={close}
        />
        <NavItem to="/calendar" icon={Calendar} label="Calendar" sub="Deadlines" close={close} />
        <NavItem to="/profile" icon={User} label="Profile" sub="Stats & settings" close={close} />
        <NavItem
          to="/about-us"
          icon={Info}
          label="About Us"
          sub="Learn about Focus Nest"
          close={close}
        />
      </Section>

      <Section title="STUDY TOOLS">
        <NavItem to={"/mcq-test"} icon={Brain} label="Take a MCQ Test" />
        <NavItem to={"/revise"} icon={BookOpen} label="Revise with Flashcards" />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, sub, close }) {
  return (
    <NavLink
      to={to}
      onClick={close}
      className="flex items-start gap-3 rounded-md p-2 hover:bg-muted"
    >
      <Icon size={18} className="mt-1 text-n-primary" />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </NavLink>
  );
}