import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminCourseManagement.css";

// 🌐 Dynamic API URL
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://clinigoal-backend-yfu3.onrender.com/api";

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalType, setModalType] = useState(""); // "add", "edit", "view"
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
      alert("Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  };

  // Add or Edit course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "edit") {
        await axios.put(`${API_BASE_URL}/courses/${selectedCourse._id}`, form);
        alert("✅ Course updated!");
      } else {
        await axios.post(`${API_BASE_URL}/courses`, form);
        alert("✅ Course added!");
      }
      setForm({ title: "", description: "", price: "" });
      setModalType("");
      fetchCourses();
    } catch (err) {
      console.error("❌ Error saving course:", err);
      alert("Failed to save course.");
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/courses/${id}`);
      fetchCourses();
    } catch (err) {
      console.error("❌ Error deleting course:", err);
      alert("Failed to delete course.");
    }
  };

  return (
    <div className="course-management-container">
      <h2>📚 Manage Courses</h2>

      <button
        className="add-course-btn"
        onClick={() => {
          setModalType("add");
          setForm({ title: "", description: "", price: "" });
        }}
      >
        ➕ Add New Course
      </button>

      <div className="course-table-wrapper">
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <table className="course-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.description}</td>
                  <td>{c.price}</td>
                  <td>
                    <button
                      className="action-btn view"
                      onClick={() => {
                        setSelectedCourse(c);
                        setModalType("view");
                      }}
                    >
                      👁️ View
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setSelectedCourse(c);
                        setForm({
                          title: c.title,
                          description: c.description,
                          price: c.price,
                        });
                        setModalType("edit");
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(c._id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalType === "view" && selectedCourse && (
              <div className="view-modal">
                <h3>📘 {selectedCourse.title}</h3>
                <ul>
                  <li>
                    <strong>Description:</strong> {selectedCourse.description}
                  </li>
                  <li>
                    <strong>Price:</strong> ₹{selectedCourse.price}
                  </li>
                </ul>
                <button
                  className="cancel-btn"
                  onClick={() => setModalType("")}
                >
                  Close
                </button>
              </div>
            )}

            {(modalType === "add" || modalType === "edit") && (
              <form onSubmit={handleSubmit} className="course-form-card">
                <h3>
                  {modalType === "add" ? "➕ Add New Course" : "✏️ Edit Course"}
                </h3>
                <input
                  type="text"
                  placeholder="Course Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
                <button type="submit" className="submit-course-btn">
                  {modalType === "add" ? "Add Course" : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setModalType("")}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;
