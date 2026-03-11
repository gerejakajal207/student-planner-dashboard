import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Fetch tasks from backend whenever user logs in
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]); // clear tasks on logout
    }
  }, [user]);

  async function fetchTasks() {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await api.getTasks();
      // Convert due_date strings from API back to Date objects
      // so all existing frontend code (isToday, isTomorrow etc.) still works
      const normalized = data.map((t) => ({
        ...t,
        date: new Date(t.due_date),
      }));
      setTasks(normalized);
    } catch (err) {
      setTasksError(err.message);
    } finally {
      setTasksLoading(false);
    }
  }

  async function addTask(form) {
    try {
      const payload = {
        title:       form.taskName,
        description: form.taskDescription,
        subject:     form.subject,
        category:    form.category,
        priority:    form.priority,
        effort:      form.effort,
        // Backend expects ISO string
        due_date:    new Date(form.taskDueDate + "T00:00:00").toISOString(),
      };
      const created = await api.createTask(payload);
      // Add to local state with date as Date object
      setTasks((prev) => [...prev, { ...created, date: new Date(created.due_date) }]);
    } catch (err) {
      console.error("Failed to create task:", err.message);
    }
  }

  async function updateTaskStatus(id, status) {
    try {
      const updated = await api.updateTaskStatus(id, status);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...updated, date: new Date(updated.due_date) } : t
        )
      );
    } catch (err) {
      console.error("Failed to update task:", err.message);
    }
  }

  async function deleteTask(id) {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err.message);
    }
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      tasksLoading,
      tasksError,
      addTask,
      updateTaskStatus,
      deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}