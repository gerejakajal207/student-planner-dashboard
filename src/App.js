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
  return (
    <TodaysPage/>
  );
}

export default App;