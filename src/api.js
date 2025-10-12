// src/api.js
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL; // ej: https://bizu-back.onrender.com

if (!API_ROOT) {
  console.warn("⚠️ VITE_API_URL no está definida");
}

// Instancia principal apuntando a /api
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  // timeout: 15000,
});

// ----------------------
// Storage helpers
// ----------------------
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

// ----------------------
// Request interceptor
// ----------------------
api.interceptors.request.use(
  (config) => {
    const token = getAccess();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // No fuerces content-type si es FormData
    if (config.data instanceof FormData) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else {
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------
// Refresh token con cola
// ----------------------
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}
function onRefreshed(newToken) {
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

// ----------------------
// Response interceptor
// ----------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error?.response?.status;

    // Si no hay respuesta / no es 401 / ya reintentamos => salir
    if (!error.response || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const url = (original.url || "").toString();

    // Flags/paths para controlar el manejo
    const isLoginEndpoint =
      url.includes("/token/") && !url.includes("/token/refresh"); // POST /token/ (login)
    const isRefreshEndpoint = url.includes("/token/refresh");
    const skipAuthHandler = original._skipAuthHandler === true;

    // ❗ NUNCA redirigir/refresh si:
    // - petición marcada con _skipAuthHandler (por ejemplo login),
    // - es el propio endpoint de login,
    // - es el endpoint de refresh.
    if (skipAuthHandler || isLoginEndpoint || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // Marca para no entrar en bucle
    original._retry = true;

    // Si ya hay un refresh en curso, nos suscribimos
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

    // Disparar refresh
    isRefreshing = true;
    try {
      const newAccess = await refreshAccessToken();
      isRefreshing = false;
      onRefreshed(newAccess);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (err) {
      isRefreshing = false;
      onRefreshed(null); // Notificar fracaso a los que esperan
      clearAuth();
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(err);
    }
  }
);

// ----------------------
// Helpers opcionales
// ----------------------
export async function login({ email, password }) {
  // ⚠️ En login marcamos _skipAuthHandler para que un 401 NO redirija ni refresque
  const res = await api.post(
    "/token/",
    { email, password },
    { _skipAuthHandler: true }
  );
  const { access, refresh } = res.data || {};
  setAuthTokens({ access, refresh });
  return res;
}

export function logout() {
  clearAuth();
  if (typeof window !== "undefined") window.location.assign("/login");
}

export default api;
