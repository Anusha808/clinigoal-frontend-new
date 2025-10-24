// AdminVideoManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AdminVideoManagement.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [editVideo, setEditVideo] = useState(null);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/videos`);
      setVideos(res.data.videos || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load videos",
        text: "Check server connection",
        confirmButtonColor: "#007bff",
      });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Upload or update video
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editVideo && !file) {
      Swal.fire("Missing file", "Please select a video.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("courseName", courseName);
    if (file) formData.append("video", file);

    setLoading(true);
    setUploadProgress(0);

    try {
      if (editVideo) {
        await axios.put(`${API_BASE_URL}/videos/${editVideo._id}`, { title, courseName });
        Swal.fire({ icon: "success", title: "Video updated!", timer: 1500, showConfirmButton: false });
      } else {
        await axios.post(`${API_BASE_URL}/videos/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          },
        });
        Swal.fire({ icon: "success", title: "Video uploaded!", timer: 1500, showConfirmButton: false });
      }

      // Reset form
      setTitle("");
      setCourseName("");
      setFile(null);
      setEditVideo(null);
      setUploadProgress(0);
      fetchVideos();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This video will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/videos/${id}`);
      Swal.fire("Deleted!", "Video removed.", "success");
      fetchVideos();
    } catch {
      Swal.fire("Error", "Failed to delete video.", "error");
    }
  };

  // Edit video
  const handleEdit = (video) => {
    setEditVideo(video);
    setTitle(video.title);
    setCourseName(video.courseName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="admin-video-management">
      <h2>🎬 Video Management</h2>

      <form onSubmit={handleSubmit} className="video-form">
        <div className="input-row">
          <input type="text" placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
          {!editVideo && (
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
          )}
        </div>

        <button type="submit" disabled={loading}>
          {editVideo ? "💾 Update Video" : "⬆️ Upload Video"}
        </button>

        {loading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </form>

      <div className="video-table-container">
        {videos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video._id}>
                  <td>{video.title}</td>
                  <td>{video.courseName}</td>
                  <td>
                    <button onClick={() => handleEdit(video)}>✏ Edit</button>
                    <button onClick={() => handleDelete(video._id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminVideoManagement;
