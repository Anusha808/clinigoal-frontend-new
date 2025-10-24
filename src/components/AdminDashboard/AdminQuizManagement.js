import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlusCircle,
  FaTrash,
  FaEdit,
  FaEye,
  FaClipboardList,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import "./AdminQuizManagement.css";

/* 🌐 Dynamic API URL */
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://clinigoal-backend.onrender.com/api";

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    courseName: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ],
  });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🧭 Fetch quizzes on component load
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/quizzes`);
      const data = res.data.quizzes || res.data || [];
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  // 📝 Handle input changes
  const handleInputChange = (field, value) =>
    setForm({ ...form, [field]: value });

  const handleQuestionChange = (value) => {
    const updated = [...form.questions];
    updated[0].question = value;
    setForm({ ...form, questions: updated });
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.questions];
    updated[0].options[index] = value;
    setForm({ ...form, questions: updated });
  };

  const handleCorrectAnswerChange = (value) => {
    const updated = [...form.questions];
    updated[0].correctAnswer = value;
    setForm({ ...form, questions: updated });
  };

  // 💾 Add or Update Quiz
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.courseName.trim() ||
      !form.questions[0].question.trim() ||
      form.questions[0].options.some((opt) => !opt.trim()) ||
      !form.questions[0].correctAnswer.trim()
    ) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      setLoading(true);
      if (editingQuizId) {
        await axios.put(`${API_BASE_URL}/quizzes/${editingQuizId}`, form);
        Swal.fire("✅ Updated!", "Quiz updated successfully.", "success");
      } else {
        await axios.post(`${API_BASE_URL}/quizzes`, form);
        Swal.fire("✅ Added!", "New quiz added successfully.", "success");
      }

      // Reset form
      setForm({
        title: "",
        courseName: "",
        questions: [
          { question: "", options: ["", "", "", ""], correctAnswer: "" },
        ],
      });
      setEditingQuizId(null);
      fetchQuizzes();
    } catch (err) {
      Swal.fire("❌ Error", "Failed to save quiz.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit Quiz
  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      courseName: quiz.courseName,
      questions: quiz.questions || [
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    });
    setEditingQuizId(quiz._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 👁️ View Quiz Details
  const handleView = (quiz) => {
    const htmlContent = `
      <strong>Course:</strong> ${quiz.courseName}<br><br>
      <strong>Question:</strong> ${quiz.questions[0].question}<br><br>
      <strong>Options:</strong>
      <ul style="text-align:left">
        ${quiz.questions[0].options
          .map(
            (opt) =>
              `<li ${
                opt === quiz.questions[0].correctAnswer
                  ? 'style="color:green;font-weight:600"'
                  : ""
              }>${opt}</li>`
          )
          .join("")}
      </ul>
      <strong>Correct Answer:</strong> <span style="color:green;">
        ${quiz.questions[0].correctAnswer}</span>
    `;

    Swal.fire({
      title: quiz.title,
      html: htmlContent,
      icon: "info",
      confirmButtonText: "Close",
      width: 500,
    });
  };

  // 🗑️ Delete Quiz
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This quiz will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/quizzes/${id}`);
      Swal.fire("🗑️ Deleted!", "Quiz removed successfully.", "success");
      fetchQuizzes();
    } catch {
      Swal.fire("❌ Error", "Failed to delete quiz.", "error");
    }
  };

  return (
    <div className="admin-quiz-management">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FaClipboardList className="icon" /> Quiz Management
      </motion.h2>

      {error && <p className="error-message">{error}</p>}

      {/* 🧾 Quiz Form */}
      <motion.form
        className="quiz-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="input-row">
          <div className="form-group">
            <label>Quiz Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>

          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              value={form.courseName}
              onChange={(e) => handleInputChange("courseName", e.target.value)}
              placeholder="Enter course name"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Question</label>
          <textarea
            value={form.questions[0].question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Enter quiz question"
          />
        </div>

        <div className="form-group options-section">
          <label>Options</label>
          {form.questions[0].options.map((opt, i) => (
            <div className="option-line" key={i}>
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              <label className="correct-label">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={form.questions[0].correctAnswer === opt}
                  onChange={() => handleCorrectAnswerChange(opt)}
                />
                Correct
              </label>
            </div>
          ))}
        </div>

        <motion.button
          type="submit"
          className="add-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <FaPlusCircle />{" "}
          {loading
            ? "Saving..."
            : editingQuizId
            ? "Update Quiz"
            : "Add Quiz"}
        </motion.button>
      </motion.form>

      {/* 📋 Quiz Table */}
      <div className="quiz-table-container">
        <h3>📚 Created Quizzes</h3>
        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          <table className="quiz-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <motion.tr
                  key={quiz._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td>{quiz.title}</td>
                  <td>{quiz.courseName}</td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => handleView(quiz)}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(quiz)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(quiz._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-quizzes">No quizzes created yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminQuizManagement;
