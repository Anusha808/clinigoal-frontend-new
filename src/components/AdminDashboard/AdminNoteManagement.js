import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaFileUpload, FaEdit, FaTrash, FaEye, FaBook } from "react-icons/fa";
import "./AdminNoteManagement.css";

/* Dynamic API URL */
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://clinigoal-backend-yfu3.onrender.com/api";

const AdminNoteManagement = () => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", courseName: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editNote, setEditNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notes`);
      const data = res.data.notes || res.data || [];
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire("❌ Error", "Failed to fetch notes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.courseName.trim()) {
      Swal.fire("⚠️ Warning", "Please fill in all fields.", "warning");
      return;
    }

    if (!editNote && !file) {
      Swal.fire("⚠️ Warning", "Please select a file to upload.", "warning");
      return;
    }

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("⚠️ File Too Large", "Max size is 10MB.", "warning");
        return;
      }
      if (!/\.(pdf|doc|docx|ppt|pptx)$/i.test(file.name)) {
        Swal.fire(
          "⚠️ Invalid File",
          "Only PDF, DOC, DOCX, PPT, PPTX allowed.",
          "warning"
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("courseName", form.courseName);
    if (file) formData.append("note", file);

    try {
      setLoading(true);
      if (editNote) {
        await axios.put(`${API_BASE_URL}/notes/${editNote._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          icon: "success",
          title: "✅ Note Updated",
          text: `"${form.title}" updated successfully.`,
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        await axios.post(`${API_BASE_URL}/notes/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          icon: "success",
          title: "✅ Note Uploaded",
          text: `"${form.title}" added successfully.`,
          showConfirmButton: false,
          timer: 1800,
        });
      }
      setForm({ title: "", courseName: "" });
      setFile(null);
      setEditNote(null);
      fetchNotes();
    } catch (error) {
      Swal.fire("❌ Error", "Failed to upload note.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setForm({ title: note.title, courseName: note.courseName });
    Swal.fire({
      icon: "info",
      title: "✏️ Edit Mode Enabled",
      text: `You can now edit "${note.title}".`,
      showConfirmButton: false,
      timer: 1800,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/notes/${id}`);
      Swal.fire("🗑️ Deleted!", "The note has been removed.", "success");
      fetchNotes();
    } catch {
      Swal.fire("❌ Error", "Failed to delete note.", "error");
    }
  };

  const handleView = (note) => {
    const fileUrl = note.notePath.startsWith("http")
      ? note.notePath
      : `${API_BASE_URL.replace("/api", "")}${note.notePath.startsWith("/") ? note.notePath : "/" + note.notePath}`;

    Swal.fire({
      title: note.title,
      html: `
        <p><strong>Course:</strong> ${note.courseName}</p>
        <a href="${fileUrl}" target="_blank" style="color:#3085d6; text-decoration:none; font-weight:bold;">
          📄 Click to View Note
        </a>
      `,
      icon: "info",
      confirmButtonText: "Close",
      width: 500,
    });
  };

  return (
    <div className="admin-note-management">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FaBook className="icon" /> Note Management
      </motion.h2>

      <motion.form
        className="note-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="input-row">
          <div className="form-group">
            <label>Note Title</label>
            <input
              type="text"
              placeholder="Enter Note Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              placeholder="Enter Course Name"
              value={form.courseName}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Upload File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && (
            <p className="file-name">
              📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          className="add-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <FaFileUpload /> {loading ? "Saving..." : editNote ? "Update Note" : "Upload Note"}
        </motion.button>

        {editNote && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditNote(null);
              setForm({ title: "", courseName: "" });
              setFile(null);
              Swal.fire("❎ Edit Cancelled", "You are now in upload mode.", "info");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Cancel Edit
          </button>
        )}
      </motion.form>

      <div className="note-table-container">
        <h3>📂 Uploaded Notes</h3>
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length > 0 ? (
          <table className="note-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => (
                <motion.tr
                  key={note._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>{note.title}</td>
                  <td>{note.courseName}</td>
                  <td className="action-buttons">
                    <button className="view-btn" onClick={() => handleView(note)}>
                      <FaEye /> View
                    </button>
                    <button className="edit-btn" onClick={() => handleEdit(note)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(note._id)}>
                      <FaTrash /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-notes">No notes uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNoteManagement;
