import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import AboutUsPage from './pages/aboutUsPage';
// Import other pages when they're ready
// import HomePage from './pages/HomePage';
// import TodayPage from './pages/TodayPage';
// import BoardPage from './pages/BoardPage';
// import CalendarPage from './pages/CalendarPage';
// import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - redirect to about for testing */}
          <Route path="/" element={<Navigate to="/about" replace />} />
          
          {/* About Us Page Route */}
          <Route path="/about" element={<AboutUsPage />} />
          
          {/* Add other routes when pages are ready */}
          {/* <Route path="/home" element={<HomePage />} /> */}
          {/* <Route path="/today" element={<TodayPage />} /> */}
          {/* <Route path="/board" element={<BoardPage />} /> */}
          {/* <Route path="/calendar" element={<CalendarPage />} /> */}
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;