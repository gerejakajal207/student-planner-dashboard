// STYLES //
import "./App.css";
import { useEffect } from "react";
import TodaysPage from './pages/TodaysMode';

// COMPONENTS //
import Navbar from "./components/layout/Navbar";
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
    <div>
      {/* While rendering your component, DO NOT REMOVE THIS NAVBAR */}
      <Navbar />
       <TodaysPage/>
    </div>
   
  );
}

export default App;
