import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Remove trailing slash and ensure /api is added only if not already present
const normalizeApiUrl = (url: string): string => {
  const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
  // If URL already ends with /api, don't add it again
  if (cleanUrl.endsWith("/api")) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
};

export const api = axios.create({
  baseURL: normalizeApiUrl(API_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
