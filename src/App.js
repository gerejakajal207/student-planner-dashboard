// STYLES //
import "./App.css";

// COMPONENTS //
import PomodoroSettings from "./components/PomodoroSettings";
import Pomodoro from "./components/Pomodoro";

// OTHERS //
import Button from "./ui/Button";

function App() {
  return (
    <div>
      <PomodoroSettings />
      <Pomodoro />
    </div>
  );
}

export default App;
