// src/api.js

import axios from "axios";
import { io } from "socket.io-client";

// 🌍 Base URL: Environment variable or fallback
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://clinigoal-backend-yfu3.onrender.com");

// 🔍 Debugging helper (can remove in production if desired)
console.log("🔗 API Base URL:", API_BASE_URL);

// ✅ Create Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 300000, // 5 minutes
});

// 🔐 Request Interceptor (Attach token if exists)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response Interceptor (Handle global errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("🌐 Network Error: Please check your internet or server.");
    } else {
      console.error("❌ API Error:", {
        url: error?.config?.url,
        status: error?.response?.status || "No status",
        message: error?.response?.data?.message || error.message,
      });
    }
    return Promise.reject(error);
  }
);

// 🟢 Socket.IO Client
export const socket = io(API_BASE_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

// ========================
// 🎥 Video APIs
// ========================
export const videoAPI = {
  getAll: () => api.get("/videos"),
  upload: (formData, config = {}) =>
    api.post("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
};

// ========================
// 🧾 Approval APIs
// ========================
export const approvalAPI = {
  getAll: () => api.get("/enrollments").catch(() => ({ data: [] })),
};

// ========================
// ⭐ Review APIs
// ========================
export const reviewAPI = {
  getAll: () => api.get("/reviews").catch(() => ({ data: [] })),
  create: (data) => api.post("/reviews", data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ========================
// 🧠 Quiz APIs
// ========================
export const quizAPI = {
  getAll: () => api.get("/quizzes").catch(() => ({ data: [] })),
  create: (data) => api.post("/quizzes", data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

// ========================
// 📝 Notes APIs
// ========================
export const notesAPI = {
  getAll: () => api.get("/notes").catch(() => ({ data: [] })),
};

// ========================
// 🎓 Courses APIs
// ========================
export const courseAPI = {
  getAll: () => api.get("/courses").catch(() => ({ data: [] })),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`), // ✅ Added delete
};

// ========================
// 👤 User APIs
// ========================
export const userAPI = {
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  forgotPassword: (data) => api.post("/users/forgot-password", data),
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  delete: (id) => api.delete(`/users/${id}`), // ✅ Added delete
};

// ========================
// 📊 Analytics APIs
// ========================
export const analyticsAPI = {
  get: () => api.get("/admin/analytics"),
};

// ========================
// ❤️ Health Check
// ========================
export const healthCheck = () => api.get("/health");

// ✅ Default Export
export default api;
