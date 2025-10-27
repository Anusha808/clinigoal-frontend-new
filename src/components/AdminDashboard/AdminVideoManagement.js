import React, { useState, useEffect, useRef } from "react";
import { videoAPI, socket } from "../../api";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEye, FaFilm } from "react-icons/fa";
import "./AdminVideoManagement.css";

// ✅ Always use your Render backend (no localhost risk)
const BASE_URL = "https://clinigoal-backend-yfu3.onrender.com";

const AdminVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [editVideo, setEditVideo] = useState(null);
  const wsConnected = useRef(false);

  // ✅ Fetch all videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data } = await videoAPI.getAll();
      setVideos(Array.isArray(data.videos) ? data.videos : []);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      Swal.fire("❌ Error", "Failed to fetch videos.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch videos and setup WebSocket
  useEffect(() => {
    fetchVideos();

    if (!wsConnected.current) {
      socket.on("connect", () => {
        console.log("🟢 Connected to WebSocket:", socket.id);
      });

      socket.on("message", (msg) => {
        try {
          const data = JSON.parse(msg);
          if (data.type === "VIDEO_UPDATED") fetchVideos();
        } catch (e) {
          console.error("❌ Invalid WebSocket message:", msg);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔴 WebSocket disconnected");
      });

      wsConnected.current = true;
    }

    return () => {
      socket.off("message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // ✅ Upload or update video
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editVideo && !file) {
      Swal.fire("Missing file", "Please select a video to upload.", "warning");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      if (editVideo) {
        // 🔧 Edit existing video
        if (file) {
          const formData = new FormData();
          formData.append("title", title);
          formData.append("courseName", courseName);
          formData.append("video", file);

          await videoAPI.update(editVideo._id, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const percent = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percent);
            },
          });
        } else {
          await videoAPI.update(editVideo._id, { title, courseName });
        }
        Swal.fire("✅ Success", "Video updated successfully!", "success");
      } else {
        // 🆕 New video upload
        const formData = new FormData();
        formData.append("title", title);
        formData.append("courseName", courseName);
        formData.append("video", file);

        await videoAPI.upload(formData, {
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percent);
          },
        });
        Swal.fire("✅ Success", "Video uploaded successfully!", "success");
      }

      // Reset form after success
      setTitle("");
      setCourseName("");
      setFile(null);
      setEditVideo(null);
      fetchVideos();
    } catch (error) {
      console.error("Upload/Update failed:", error);
      Swal.fire("❌ Error", "Operation failed. Check console for details.", "error");
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
      await videoAPI.delete(id);
      Swal.fire("🗑️ Deleted!", "Video removed successfully.", "success");
      fetchVideos();
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire("❌ Error", "Failed to delete the video.", "error");
    }
  };

  // ✅ Edit video mode
  const handleEdit = (video) => {
    setEditVideo(video);
    setTitle(video.title);
    setCourseName(video.courseName);
    setFile(null);
    Swal.fire("✏️ Edit Mode", `Editing "${video.title}"`, "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Preview video
  const handlePreview = (video) => {
    const url = video.videoPath.startsWith("http")
      ? video.videoPath
      : `${BASE_URL}/${video.videoPath}`;
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
      <h2>
        <FaFilm /> Video Management
      </h2>

      {/* 🎥 Upload / Edit Form */}
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
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit">
          {editVideo ? "Update Video" : "Upload Video"}
        </button>

        {loading && <div className="progress-bar">{uploadProgress}%</div>}

        {editVideo && (
          <button
            type="button"
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
      </form>

      {/* 📂 Uploaded Videos */}
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
                  <button onClick={() => handlePreview(v)}>
                    <FaEye /> View
                  </button>
                  <button onClick={() => handleEdit(v)}>
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(v._id)}>
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🎬 Video Preview Modal */}
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
