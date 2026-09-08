import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";

import { TaskProvider } from "./components/TaskContext";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { TimerProvider } from "./components/TimerContext";
import Navbar from "./components/layout/Navbar";  
import TodaysPage from "./pages/TodaysMode";
import AboutUsPage from "./pages/AboutUsPage";
import CalendarPage from "./pages/CalendarPage";
import KanbanPage from "./pages/KanbanBoard";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FlashcardsPage from "./pages/FlashcardsPage";
import McqTestPage from "./pages/McqTestPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/privacy-policy" ||
    location.pathname === "/terms-of-use";

  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-[#e2e8f0] transition-colors">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/login"            element={<Login />}               />
        <Route path="/signup"           element={<SignUp />}              />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />}  />
        <Route path="/reset-password"   element={<ResetPasswordPage />}   />
        <Route path="/privacy-policy"   element={<PrivacyPolicyPage />}   />
        <Route path="/terms-of-use"     element={<TermsOfUsePage />}      />
        <Route path="/"             element={<HomePage />}        />
        <Route path="/home"         element={<HomePage />}        />
        <Route path="/todays-page"  element={<TodaysPage />}      />
        <Route path="/calendar"     element={<CalendarPage />}    /> 
        <Route path="/board"        element={<KanbanPage />}      />
        <Route path="/revise"       element={<FlashcardsPage />}  />
        <Route path="/mcq-test"     element={<McqTestPage />}     />
        <Route path="/ai-assistant" element={<AiAssistantPage />} />
        <Route path="/about-us"     element={<AboutUsPage />}     />
        <Route path="/profile"      element={<Profile />}         />
        {/* 404 — authenticated users see the Not Found page, guests go to login */}
        <Route path="*" element={user ? <NotFoundPage /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <TaskProvider>
        <TimerProvider>
          <Router>
            <AppLayout />
          </Router>
        </TimerProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;