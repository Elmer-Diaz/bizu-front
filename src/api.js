// src/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔹 Interceptor para agregar siempre el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor para manejar token expirado y refrescarlo automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 y no hemos intentado refrescar todavía
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        // Intentar refrescar token
        const res = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });

        if (res.status === 200) {
          const newAccessToken = res.data.access;
          localStorage.setItem("access", newAccessToken);

          // Actualizar el Authorization del request original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// 🔹 Función para cerrar sesión
function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
}

export default api;
