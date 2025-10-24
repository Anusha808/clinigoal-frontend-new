import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaFileUpload, FaEdit, FaTrash, FaEye, FaFilm } from "react-icons/fa";
import "./AdminVideoManagement.css";

// ✅ Dynamic API URL depending on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/videos"
    : "https://clinigoal-backend.onrender.com/api/videos";

const AdminVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [editVideo, setEditVideo] = useState(null);

  // ✅ Fetch all videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_URL);
      const data = res.data.videos || res.data || [];
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load videos",
        text: "Please check your server connection.",
        confirmButtonColor: "#007bff",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ✅ Upload or update video
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editVideo && !file) {
      Swal.fire("Missing file", "Please select a video to upload.", "warning");
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
        await axios.put(`${API_BASE_URL}/${editVideo._id}`, {
          title,
          courseName,
        });
        Swal.fire({
          icon: "success",
          title: "Video updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          },
        });
        Swal.fire({
          icon: "success",
          title: "Video uploaded successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      setTitle("");
      setCourseName("");
      setFile(null);
      setEditVideo(null);
      fetchVideos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Operation failed",
        text: error.response?.data?.message || "Try again later.",
        confirmButtonColor: "#007bff",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Delete video
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This video will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      Swal.fire("Deleted!", "The video has been removed.", "success");
      fetchVideos();
    } catch {
      Swal.fire("❌ Error", "Failed to delete the video.", "error");
    }
  };

  // ✅ Edit video
  const handleEdit = (video) => {
    setEditVideo(video);
    setTitle(video.title);
    setCourseName(video.courseName);
    Swal.fire({
      icon: "info",
      title: "Editing Mode",
      text: `You're editing "${video.title}"`,
      confirmButtonColor: "#007bff",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Preview video URL
  const handlePreview = (video) => {
    const url = video.videoPath.startsWith("http")
      ? video.videoPath
      : `${API_BASE_URL.replace("/videos", "")}/${video.videoPath.replace(/^\/?/, "")}`;
    setPreviewVideo(url);
  };

  // ✅ Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="admin-video-management">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FaFilm className="icon" /> Video Management
      </motion.h2>

      <motion.form
        className="video-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="input-row">
          <div className="form-group">
            <label>Video Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              placeholder="Enter course name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>

          {!editVideo && (
            <div className="form-group">
              <label>Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              {file && (
                <small className="file-name">
                  {file.name} ({formatFileSize(file.size)})
                </small>
              )}
            </div>
          )}
        </div>

        <div className="button-row">
          <motion.button
            type="submit"
            className="upload-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <FaFileUpload /> {editVideo ? "Update Video" : "Upload Video"}
          </motion.button>
          {editVideo && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditVideo(null);
                setTitle("");
                setCourseName("");
                setFile(null);
                Swal.fire("❎ Edit Cancelled", "You are now in upload mode.", "info");
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {loading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </motion.form>

      <div className="video-table-container">
        <h3>📂 Uploaded Videos</h3>
        {loading ? (
          <p>Loading videos...</p>
        ) : videos.length > 0 ? (
          <table className="video-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Size</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video, index) => (
                <motion.tr
                  key={video._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>{video.title}</td>
                  <td>{video.courseName}</td>
                  <td>{formatFileSize(video.fileSize)}</td>
                  <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button className="view-btn" onClick={() => handlePreview(video)}>
                      <FaEye /> View
                    </button>
                    <button className="edit-btn" onClick={() => handleEdit(video)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(video._id)}>
                      <FaTrash /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-videos">No videos uploaded yet.</p>
        )}
      </div>

      {previewVideo && (
        <div className="modal" onClick={() => setPreviewVideo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <video src={previewVideo} controls autoPlay width="100%" />
            <button
              className="close-modal"
              onClick={() => setPreviewVideo(null)}
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideoManagement;
