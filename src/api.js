const BASE_URL = "http://localhost:8000";

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

  // ── Tasks ──
  getTasks: () => request("/tasks/"),

  createTask: (taskData) =>
    request("/tasks/", {
      method: "POST",
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

};