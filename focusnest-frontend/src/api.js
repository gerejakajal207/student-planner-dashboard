const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("focusnest_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Something went wrong" }));
    throw new Error(error.detail || "Request failed");
  }

  // 204 No Content (delete) returns no body
  if (res.status === 204) return null;

  return res.json();
}

// ── Auth ──
export const api = {
  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request("/users/me"),

  updateProfile: (data) =>
    request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (current_password, new_password) =>
    request("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ current_password, new_password }),
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, new_password) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    }),

  // ── Tasks ──
  getTasks: () => request("/tasks/"),

  createTask: (taskData) =>
    request("/tasks/", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),

  updateTask: (taskId, taskData) =>
    request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    }),

  updateTaskStatus: (taskId, status) =>
    request(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: "DELETE",
    }),

  getQuote: () => request("/quotes/random"),

  // ── AI Assistant ──
  aiSchedule: (subject, examDate, dailyHours, startDate) =>
    request("/ai/schedule", {
      method: "POST",
      body: JSON.stringify({
        subject,
        exam_date: examDate,
        daily_hours: dailyHours,
        ...(startDate && { start_date: startDate }),
      }),
    }),

  aiBreakdown: (prompt) =>
    request("/ai/breakdown", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  aiExplain: (concept) =>
    request("/ai/explain", {
      method: "POST",
      body: JSON.stringify({ concept }),
    }),

  aiBatchAddTasks: (tasks) =>
    request("/ai/batch-add-tasks", {
      method: "POST",
      body: JSON.stringify({ tasks }),
    }),

  aiFlashcards: (topic, difficulty = "Medium", count = 8) =>
    request("/ai/flashcards", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty, count }),
    }),

  aiMcqs: (topic, difficulty = "Medium", count = 8) =>
    request("/ai/mcqs", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty, count }),
    }),

  validateTopic: (topic) =>
    request("/ai/validate-topic", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),
};