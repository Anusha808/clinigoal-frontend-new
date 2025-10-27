import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { 
  FaFileUpload, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaBook, 
  FaTimes,
  FaSpinner,
  FaCloud,
  FaFolder,
  FaCheck
} from "react-icons/fa";
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
  const [activeView, setActiveView] = useState("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      Swal.fire("Error", "Failed to fetch notes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.courseName.trim()) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    if (!editNote && !file) {
      Swal.fire("Warning", "Please select a file to upload.", "warning");
      return;
    }

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("File Too Large", "Max size is 10MB.", "warning");
        return;
      }
      if (!/\.(pdf|doc|docx|ppt|pptx)$/i.test(file.name)) {
        Swal.fire(
          "Invalid File",
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
      setIsSubmitting(true);
      if (editNote) {
        await axios.put(`${API_BASE_URL}/notes/${editNote._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          icon: "success",
          title: "Note Updated",
          text: `"${form.title}" updated successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await axios.post(`${API_BASE_URL}/notes/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          icon: "success",
          title: "Note Uploaded",
          text: `"${form.title}" added successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
      setForm({ title: "", courseName: "" });
      setFile(null);
      setEditNote(null);
      fetchNotes();
    } catch (error) {
      Swal.fire("Error", "Failed to upload note.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setForm({ title: note.title, courseName: note.courseName });
    setActiveView("upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this note?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Yes, delete it"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/notes/${id}`);
        Swal.fire("Deleted!", "Note has been removed.", "success");
        fetchNotes();
      } catch {
        Swal.fire("Error", "Failed to delete note.", "error");
      }
    }
  };

  const handleView = (note) => {
    const fileUrl = note.notePath.startsWith("http")
      ? note.notePath
      : `${API_BASE_URL.replace("/api", "")}${note.notePath.startsWith("/") ? note.notePath : "/" + note.notePath}`;

    Swal.fire({
      title: note.title,
      html: `
        <div style="text-align: left; padding: 20px;">
          <p style="margin-bottom: 15px;"><strong>Course:</strong> ${note.courseName}</p>
          <a href="${fileUrl}" target="_blank" 
             style="display: inline-block; padding: 10px 20px; background: #3498db; color: white; 
                    text-decoration: none; border-radius: 5px; margin-top: 10px;">
            📄 View Document
          </a>
        </div>
      `,
      showConfirmButton: false,
      width: 500
    });
  };

  return (
    <div className="note-management">
      <div className="container">
        {/* Header */}
        <motion.header 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <FaBook />
            </div>
            <div>
              <h1>Note Management</h1>
              <p>Upload and organize course materials</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{notes.length}</span>
              <span className="stat-label">Total Notes</span>
            </div>
          </div>
        </motion.header>

        {/* Navigation */}
        <nav className="view-nav">
          <button 
            className={`nav-btn ${activeView === "upload" ? "active" : ""}`}
            onClick={() => setActiveView("upload")}
          >
            <FaCloud /> {editNote ? "Edit Note" : "Upload Note"}
          </button>
          <button 
            className={`nav-btn ${activeView === "library" ? "active" : ""}`}
            onClick={() => setActiveView("library")}
          >
            <FaFolder /> Note Library ({notes.length})
          </button>
        </nav>

        {/* Upload Form */}
        {activeView === "upload" && (
          <motion.section 
            className="upload-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h2>{editNote ? "Edit Note" : "Upload New Note"}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Note Title</label>
                    <input
                      type="text"
                      placeholder="Enter note title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Mathematics 101"
                      value={form.courseName}
                      onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Upload File</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => setFile(e.target.files[0])}
                      id="file-input"
                      className="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                      <FaFileUpload className="upload-icon" />
                      <span>Choose file or drag and drop</span>
                      <small>PDF, DOC, DOCX, PPT, PPTX (Max 10MB)</small>
                    </label>
                    {file && (
                      <div className="file-selected">
                        <FaCheck className="check-icon" />
                        <span>{file.name}</span>
                        <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaFileUpload />
                        {editNote ? "Update Note" : "Upload Note"}
                      </>
                    )}
                  </motion.button>
                  
                  {editNote && (
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditNote(null);
                        setForm({ title: "", courseName: "" });
                        setFile(null);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaTimes />
                      Cancel
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.section>
        )}

        {/* Note Library */}
        {activeView === "library" && (
          <motion.section 
            className="library-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h2>Note Library</h2>
              </div>
              
              {loading ? (
                <div className="loading">
                  <FaSpinner className="spinner" />
                  <p>Loading notes...</p>
                </div>
              ) : notes.length > 0 ? (
                <div className="notes-grid">
                  {notes.map((note, index) => (
                    <motion.div 
                      key={note._id} 
                      className="note-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="note-content">
                        <div className="note-icon">
                          <FaBook />
                        </div>
                        <div className="note-info">
                          <h3>{note.title}</h3>
                          <p>{note.courseName}</p>
                        </div>
                      </div>
                      <div className="note-actions">
                        <motion.button
                          className="action-btn view"
                          onClick={() => handleView(note)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          className="action-btn edit"
                          onClick={() => handleEdit(note)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          className="action-btn delete"
                          onClick={() => handleDelete(note._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaFolder className="empty-icon" />
                  <h3>No notes uploaded</h3>
                  <p>Start by uploading your first course material</p>
                  <motion.button
                    className="btn btn-primary"
                    onClick={() => setActiveView("upload")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaFileUpload />
                    Upload First Note
                  </motion.button>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default AdminNoteManagement;