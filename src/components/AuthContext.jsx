import { createContext, useContext, useState } from "react";

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

  function login(email) {
    const userData = { email, name: email.split("@")[0] };
    localStorage.setItem("focusnest_user", JSON.stringify(userData));
    setUser(userData);
  }

  function signup(name, email) {
    const userData = { name, email };
    localStorage.setItem("focusnest_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("focusnest_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}