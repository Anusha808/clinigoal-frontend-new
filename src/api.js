// ✅ src/api.js
import axios from "axios";

// 🌍 Use environment variable or fallback
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://clinigoal-backend.onrender.com");

// 🧩 Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes
});

// 🔐 Request interceptor: attach token + log
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`,
        token ? "(with auth)" : "(no auth)"
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response interceptor: log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", {
      url: error?.config?.url,
      status: error?.response?.status,
      message: error?.response?.data?.message || error?.message,
    });
    return Promise.reject(error);
  }
);

// 🎥 Video APIs
export const videoAPI = {
  getAllVideos: () => api.get("/videos"),
  uploadVideo: (formData) =>
    api.post("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
};

// ✅ Approvals APIs
export const approvalAPI = {
  getAllApprovals: () => api.get("/approvals").catch(() => ({ data: [] })),
};

// 🧠 Review APIs
export const reviewAPI = {
  getAllReviews: () => api.get("/reviews").catch(() => ({ data: [] })),
};

// 📝 Quiz APIs
export const quizAPI = {
  getAllQuizzes: () => api.get("/quizzes").catch(() => ({ data: [] })),
};

// 📚 Notes APIs
export const notesAPI = {
  getAllNotes: () => api.get("/notes").catch(() => ({ data: [] })),
};

// 🎓 Course APIs
export const courseAPI = {
  getAllCourses: () => api.get("/courses").catch(() => ({ data: [] })),
};

// 🩺 Health check endpoint
export const healthCheck = () => api.get("/health");

// ✅ Default export
export default api;
