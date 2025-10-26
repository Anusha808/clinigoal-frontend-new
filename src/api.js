import axios from "axios";

// Base URL from environment variable or fallback
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://clinigoal-backend.onrender.com");

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes
});

// Request interceptor: attach token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: log errors
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

// Video APIs
export const videoAPI = {
  getAllVideos: () => api.get("/videos"),
  uploadVideo: (formData, config = {}) =>
    api.post("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
};

// Other APIs
export const approvalAPI = {
  getAllApprovals: () => api.get("/approvals").catch(() => ({ data: [] })),
};
export const reviewAPI = {
  getAllReviews: () => api.get("/reviews").catch(() => ({ data: [] })),
};
export const quizAPI = {
  getAllQuizzes: () => api.get("/quizzes").catch(() => ({ data: [] })),
};
export const notesAPI = {
  getAllNotes: () => api.get("/notes").catch(() => ({ data: [] })),
};
export const courseAPI = {
  getAllCourses: () => api.get("/courses").catch(() => ({ data: [] })),
};
export const healthCheck = () => api.get("/health");

export default api;
