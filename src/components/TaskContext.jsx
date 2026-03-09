import { createContext, useContext, useState } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  function addTask(form) {
    const newTask = {
      id: Date.now(),
      title: form.taskName,
      description: form.taskDescription,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      effort: form.effort,
      date: new Date(form.taskDueDate + "T00:00:00"), // ← must be a Date object
      status: "Todo",
    };
    setTasks((prev) => [...prev, newTask]);
  }

  function updateTaskStatus(id, status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
