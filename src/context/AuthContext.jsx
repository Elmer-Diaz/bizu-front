// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import api from "../api"; // Usamos la instancia de axios
import { API_URL } from "../config";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔹 Cargar usuario desde API
  const loadUser = async () => {
    const access = localStorage.getItem("access");
    const uuid = localStorage.getItem("uuid");

    if (!access || !uuid) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const { data } = await api.get(`/profile/${uuid}/`);
      setUser(data);

      // Guardamos role y uuid para que el navbar lo tenga de inmediato
      if (data.role) localStorage.setItem("role", data.role);
      if (data.id) localStorage.setItem("uuid", data.id);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("uuid");
    localStorage.removeItem("role");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loadUser, logout, loadingUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
