import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/NavBar";
import TodaysPage from "./pages/TodaysMode";
import CalendarPage from "./pages/CalendarPage";
import QuoteCard from "./components/QuoteCard";

function App() {
  return (
    <CalendarPage/>
  );
}

export default App;
