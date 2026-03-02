import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TodaysPage from './pages/TodaysMode';

// Import your pages
import AboutUsPage from './pages/AboutUsPage';
// Import other pages when they're ready
// import HomePage from './pages/HomePage';
// import TodayPage from './pages/TodayPage';
// import BoardPage from './pages/BoardPage';
// import CalendarPage from './pages/CalendarPage';
// import ProfilePage from './pages/ProfilePage';

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
    <Router>
      <Navbar />
      <Routes>
        <Route path="/todays-page" element={<TodaysPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/" element={<TodaysPage />} />
      </Routes>
    </Router>
  );
}

export default App;