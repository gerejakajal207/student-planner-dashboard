
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import DrawerContent from "./DrawerContent";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  
  const toggleTheme = () => {
    const newTheme = dark ? "light" : "dark";
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
    localStorage.setItem("theme", newTheme);
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "bg-white text-primary px-4 py-1 rounded-full font-medium"
      : "font-medium hover:opacity-90";

  return (
    <>
      <nav className="sticky top-0 z-40 flex h-16 items-center justify-between bg-primary px-6 text-primary-foreground shadow-sm">
        {/* LOGO */}
        <Link to="/home">
          <img
            src="/images/focus-nest-logo.jpeg"
            alt="Focus Nest"
            className="h-11 rounded-xl py-0.5 md:h-12 xl:h-14"
          />
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden gap-10 md:flex md:items-center md:justify-center">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/todays-page" className={navClass}>
            Today
          </NavLink>
          <NavLink to="/board" className={navClass}>
            Board
          </NavLink>
          <NavLink to="/calendar" className={navClass}>
            Calendar
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            Profile
          </NavLink>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-5">
          <button onClick={toggleTheme}>{dark ? <Sun size={20} /> : <Moon size={20} />}</button>

          <button onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Extended Menu  */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            aria-label="Close menu"
            className="flex-1 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="h-full w-80 overflow-y-auto bg-card text-foreground shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold text-foreground">Menu</p>
              <button onClick={() => setOpen(false)}>
                <X className="text-foreground" />
              </button>
            </div>
            <DrawerContent close={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
