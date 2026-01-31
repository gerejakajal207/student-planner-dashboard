import "./App.css";
import McqDemo from "./McqDemo";
import Button from "./ui/Button";

function App() {
  return (
    <div>
      <Button data={{ text: "ADD TEXT" }} />
      <McqDemo/>
    </div>
  );
}

export default App;
