import React, { useState, useEffect } from "react";
import { videoAPI } from "../../api/videoAPI";
import Swal from "sweetalert2";
import { FaFileUpload, FaEdit, FaTrash, FaEye, FaFilm } from "react-icons/fa";
import "./AdminVideoManagement.css";

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
      const { data } = await videoAPI.getAllVideos();
      setVideos(Array.isArray(data.videos) ? data.videos : []);
    } catch {
      Swal.fire("❌ Error", "Failed to fetch videos.", "error");
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
        await videoAPI.updateVideo(editVideo._id, { title, courseName });
        Swal.fire("✅ Success", "Video updated successfully!", "success");
      } else {
        await videoAPI.uploadVideo(formData, (progress) => setUploadProgress(progress));
        Swal.fire("✅ Success", "Video uploaded successfully!", "success");
      }

      setTitle("");
      setCourseName("");
      setFile(null);
      setEditVideo(null);
      fetchVideos();
    } catch {
      Swal.fire("❌ Error", "Operation failed. Try again.", "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Delete video
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This video will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      await videoAPI.deleteVideo(id);
      Swal.fire("🗑️ Deleted!", "Video removed successfully.", "success");
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
    Swal.fire("✏️ Edit Mode", `Editing "${video.title}"`, "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Preview video
  const handlePreview = (video) => {
    const url = video.videoPath.startsWith("http")
      ? video.videoPath
      : `${videoAPI.getBaseURL()}${video.videoPath}`;
    setPreviewVideo(url);
  };

  // ✅ Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  return (
    <div className="admin-video-management">
      <h2><FaFilm /> Video Management</h2>

      <form className="video-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />
        {!editVideo && (
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        )}

        <button type="submit">{editVideo ? "Update Video" : "Upload Video"}</button>
        {loading && <div className="progress-bar">{uploadProgress}%</div>}
        {editVideo && (
          <button type="button" onClick={() => {
            setEditVideo(null); setTitle(""); setCourseName(""); setFile(null);
            Swal.fire("❎ Edit Cancelled", "You are now in upload mode.", "info");
          }}>Cancel Edit</button>
        )}
      </form>

      <h3>📂 Uploaded Videos</h3>
      {loading ? (
        <p>Loading videos...</p>
      ) : videos.length === 0 ? (
        <p>No videos uploaded yet.</p>
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
            {videos.map((v) => (
              <tr key={v._id}>
                <td>{v.title}</td>
                <td>{v.courseName}</td>
                <td>{formatFileSize(v.fileSize)}</td>
                <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handlePreview(v)}><FaEye /> View</button>
                  <button onClick={() => handleEdit(v)}><FaEdit /> Edit</button>
                  <button onClick={() => handleDelete(v._id)}><FaTrash /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {previewVideo && (
        <div className="modal" onClick={() => setPreviewVideo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <video src={previewVideo} controls autoPlay width="100%" />
            <button onClick={() => setPreviewVideo(null)}>✖ Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideoManagement;
