import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";

import { TaskProvider } from "./components/TaskContext";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Navbar from "./components/layout/Navbar";

import TodaysPage from "./pages/TodaysMode";
import AboutUsPage from "./pages/AboutUsPage";
import CalendarPage from "./pages/CalendarPage";
import KanbanPage from "./pages/KanbanBoard";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/login"       element={<Login />}       />
        <Route path="/signup"      element={<SignUp />}      />
        <Route path="/"            element={<HomePage />}    />
        <Route path="/todays-page" element={<TodaysPage />}  />
        <Route path="/calendar"    element={<CalendarPage />}/>
        <Route path="/board"       element={<KanbanPage />}  />
        <Route path="/about-us"    element={<AboutUsPage />} />
        <Route path="/profile"     element={<Profile />}     />
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
        <Router>
          <AppLayout />
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;