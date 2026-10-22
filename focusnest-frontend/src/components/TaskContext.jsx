import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";
import { recordActivity } from "../utils/streak";

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
        due_date:    new Date(form.taskDueDate + "T12:00:00").toISOString(),
      };
      const created = await api.createTask(payload);
      setTasks((prev) => [...prev, { ...created, date: new Date(created.due_date) }]);
      return true;
    } catch (err) {
      console.error("Failed to create task:", err.message);
      return false;
    }
  }

  async function editTask(id, form) {
    try {
      const payload = {
        title:       form.taskName,
        description: form.taskDescription,
        subject:     form.subject,
        category:    form.category,
        priority:    form.priority,
        effort:      form.effort,
        due_date:    new Date(form.taskDueDate + "T12:00:00").toISOString(),
      };
      const updated = await api.updateTask(id, payload);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...updated, date: new Date(updated.due_date) } : t
        )
      );
      return true;
    } catch (err) {
      console.error("Failed to edit task:", err.message);
      return false;
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
      if (status === "Done") {
        recordActivity(user?.id);
      }
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

  async function logFocus(id, minutes = 25) {
    try {
      const updated = await api.logTaskFocus(id, minutes);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, focus_minutes: updated.focus_minutes ?? ((t.focus_minutes || 0) + minutes) } : t
        )
      );
      recordActivity(user?.id);
      return true;
    } catch (err) {
      console.warn("Could not sync task focus to backend, updating locally:", err.message);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, focus_minutes: (t.focus_minutes || 0) + minutes } : t
        )
      );
      recordActivity(user?.id);
      return false;
    }
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      tasksLoading,
      tasksError,
      fetchTasks,
      addTask,
      editTask,
      updateTaskStatus,
      deleteTask,
      logFocus,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}