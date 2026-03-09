// REACT //
import { useEffect } from "react";
import { TaskProvider } from "./components/TaskContext";


// MODULES //
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// STYLES //
import "./App.css";

// COMPONENTS //
import Navbar from "./components/layout/Navbar";
import TaskModal from "./components/TaskModal";

// OTHERS //
import TodaysPage from "./pages/TodaysMode";
import AboutUsPage from "./pages/AboutUsPage";
import CalendarPage from "./pages/CalendarPage";

function App() {
  // Get the theme from local storage and set accordingly
  // DO NOT REMOVE THI WHILE RENDERING YOUR PAGES
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <TaskProvider>
    <Router>
      <Navbar />

      <Routes>
        <Route path="/todays-page" element={<TodaysPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/" element={<TaskModal />} />
        <Route path="/about-us" element={<AboutUsPage />} />
      </Routes>
    </Router>
    </TaskProvider>
  );
}

export default App;
