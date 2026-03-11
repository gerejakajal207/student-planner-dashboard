import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("focusnest_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  async function login(email, password) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await api.login(email, password);
      // Save token and user separately
      localStorage.setItem("focusnest_token", data.access_token);
      localStorage.setItem("focusnest_user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }

  async function signup(name, email, password) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem("focusnest_token", data.access_token);
      localStorage.setItem("focusnest_user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }

  async function updateProfile(name, bio) {
    try {
      const updated = await api.updateProfile({ name, bio });
      const newUser = { ...user, ...updated };
      localStorage.setItem("focusnest_user", JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (err) {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("focusnest_token");
    localStorage.removeItem("focusnest_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      authError,
      authLoading,
      login,
      signup,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}