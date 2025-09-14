// src/api.js
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL; // ej: https://bizu-back.onrender.com

if (!API_ROOT) {
  // Ayuda en tiempo de build si te olvidas la env var.
  // (En producción simplemente no tendrías esta consola abierta)
  console.warn("⚠️ VITE_API_URL no está definida");
}

// Instancia principal apuntando a /api
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  // timeout: 15000, // opcional
});

// ------------------------------------------------------
// Storage helpers (puedes cambiarlos por cookies si quieres)
// ------------------------------------------------------
function getAccess() {
  return localStorage.getItem("access");
}
function getRefresh() {
  return localStorage.getItem("refresh");
}
export function setAuthTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}
export function clearAuth() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

// ------------------------------------------------------
// Request interceptor
// - Adjunta Authorization si hay token
// - Si data es FormData, no forces Content-Type (deja que el browser lo ponga)
// ------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = getAccess();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Evitar fijar manualmente 'Content-Type' si es FormData
    if (config.data instanceof FormData) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else {
      // Para JSON normal, nos aseguramos del header estándar
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------
// Refresh token (con cola para múltiples 401 simultáneos)
// ------------------------------------------------------
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}
function onRrefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  const refresh = getRefresh();
  if (!refresh) throw new Error("No refresh token");

  const res = await axios.post(`${API_ROOT}/api/token/refresh/`, { refresh });
  const { access } = res.data || {};
  if (!access) throw new Error("No access in refresh response");

  setAuthTokens({ access });
  return access;
}

// ------------------------------------------------------
// Response interceptor
// - Si 401, intenta refrescar y reintenta la request original
// ------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Si no hay respuesta o no es 401, o ya lo intentamos, salimos
    if (!error.response || error.response.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Evita intentar refrescar el propio endpoint de refresh o login
    const url = (original.url || "").toString();
    if (url.includes("/token/refresh") || url.includes("/token/") || url.includes("/login")) {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    original._retry = true;

    // Si ya hay un refresh en curso, esperamos a que termine
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    // Disparamos un refresh nuevo
    isRefreshing = true;
    try {
      const newAccess = await refreshAccessToken();
      isRefreshing = false;
      onRrefreshed(newAccess);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (err) {
      isRefreshing = false;
      onRrefreshed(null); // Notificar fracaso a los que esperan
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(err);
    }
  }
);

// ------------------------------------------------------
// Helpers opcionales (login/logout)
// ------------------------------------------------------
export async function login({ email, password }) {
  const res = await api.post("/token/", { email, password });
  const { access, refresh } = res.data || {};
  setAuthTokens({ access, refresh });
  return res;
}

export function logout() {
  clearAuth();
  if (typeof window !== "undefined") window.location.href = "/login";
}

export default api;
