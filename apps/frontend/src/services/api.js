import axios from "axios";

const API_PREFIX = "/api/v1";

function withApiPrefix(baseUrl) {
  return baseUrl.endsWith(API_PREFIX) ? baseUrl : `${baseUrl}${API_PREFIX}`;
}

function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL || "")
    .trim()
    .replace(/\/+$/, "");

  if (configured) {
    return withApiPrefix(configured);
  }

  if (import.meta.env.DEV) {
    return `http://localhost:3000${API_PREFIX}`;
  }

  throw new Error("VITE_API_URL is required in production.");
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default api;
