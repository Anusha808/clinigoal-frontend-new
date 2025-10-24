// AdminVideoManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AdminVideoManagement.css";

const API_BASE =
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
      const res = await axios.get(API_BASE);
      setVideos(res.data.videos || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load videos",
        text: err.response?.data?.message || "Server unreachable",
      });
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
      const res = editVideo
        ? await axios.put(`${API_BASE}/${editVideo._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const progress = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(progress);
            },
          })
        : await axios.post(`${API_BASE}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const progress = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(progress);
            },
          });

      Swal.fire({
        icon: "success",
        title: editVideo ? "Video updated successfully!" : "Video uploaded!",
        showConfirmButton: false,
        timer: 1500,
      });

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
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Delete video
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This video will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE}/${id}`);
          setVideos(videos.filter((v) => v._id !== id));
          Swal.fire("Deleted!", "The video has been removed.", "success");
        } catch {
          Swal.fire("Error", "Failed to delete the video.", "error");
        }
      }
    });
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
    });
  };

  // ✅ Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="admin-video-management">
      <h2>🎬 Video Management</h2>

      {/* Video Upload / Edit Form */}
      <form onSubmit={handleSubmit} className="video-form">
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
          <button type="submit" className="upload-btn" disabled={loading}>
            {editVideo ? "💾 Update Video" : "⬆️ Upload Video"}
          </button>
          {editVideo && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditVideo(null);
                setTitle("");
                setCourseName("");
              }}
            >
              ❌ Cancel
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
      </form>

      {/* Uploaded Videos Table */}
      <div className="video-table-container">
        <h3>📂 Uploaded Videos</h3>
        {videos.length === 0 ? (
          <p className="no-videos">No videos uploaded yet.</p>
        ) : (
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
              {videos.map((video) => (
                <tr key={video._id}>
                  <td>{video.title}</td>
                  <td>{video.courseName}</td>
                  <td>{formatFileSize(video.fileSize)}</td>
                  <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() =>
                          setPreviewVideo(
                            window.location.hostname === "localhost"
                              ? `http://localhost:5000/${video.videoPath}`
                              : `https://clinigoal-backend.onrender.com/${video.videoPath}`
                          )
                        }
                      >
                        ▶ View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(video)}
                      >
                        ✏ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(video._id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Video Preview Modal */}
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
