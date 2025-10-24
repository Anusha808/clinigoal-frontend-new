// AdminQuizManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaPlusCircle,
  FaTrash,
  FaEdit,
  FaEye,
  FaClipboardList,
} from "react-icons/fa";
import "./AdminQuizManagement.css";

// ✅ Dynamic API URL
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
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ],
  });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔁 Fetch quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/quizzes`);
      setQuizzes(res.data.quizzes || res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Form handlers
  const handleInputChange = (field, value) =>
    setForm({ ...form, [field]: value });

  const handleQuestionChange = (index, value) => {
    const updated = [...form.questions];
    updated[index].question = value;
    setForm({ ...form, questions: updated });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...form.questions];
    updated[qIndex].options[oIndex] = value;
    setForm({ ...form, questions: updated });
  };

  const handleCorrectAnswerChange = (qIndex, option) => {
    const updated = [...form.questions];
    updated[qIndex].correctAnswer = option;
    setForm({ ...form, questions: updated });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updated = [...form.questions];
    updated.splice(index, 1);
    setForm({ ...form, questions: updated });
  };

  // 💾 Add / Update Quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (
      !form.title.trim() ||
      !form.courseName.trim() ||
      form.questions.some(
        (q) =>
          !q.question.trim() ||
          q.options.some((opt) => !opt.trim()) ||
          !q.correctAnswer.trim()
      )
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
        questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
      });
      setEditingQuizId(null);
      fetchQuizzes();
    } catch (err) {
      console.error(err.response?.data || err.message);
      Swal.fire(
        "❌ Error",
        err.response?.data?.message || "Failed to save quiz.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✏ Edit quiz
  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      courseName: quiz.courseName,
      questions: quiz.questions || [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
    });
    setEditingQuizId(quiz._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 👁 View quiz details
  const handleView = (quiz) => {
    const htmlContent = quiz.questions
      .map(
        (q, idx) =>
          `<strong>Q${idx + 1}:</strong> ${q.question}<br>
           <ul style="text-align:left">
            ${q.options
              .map(
                (opt) =>
                  `<li ${
                    opt === q.correctAnswer
                      ? 'style="color:green;font-weight:600"'
                      : ""
                  }>${opt}</li>`
              )
              .join("")}
           </ul>`
      )
      .join("<br>");
    Swal.fire({
      title: quiz.title,
      html: `<strong>Course:</strong> ${quiz.courseName}<br><br>${htmlContent}`,
      icon: "info",
      width: 500,
    });
  };

  // 🗑 Delete quiz
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

      {/* 📝 Quiz Form */}
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
              onChange={(e) =>
                handleInputChange("courseName", e.target.value)
              }
              placeholder="Enter course name"
            />
          </div>
        </div>

        {form.questions.map((q, qIndex) => (
          <div key={qIndex} className="question-block">
            <div className="form-group">
              <label>Question {qIndex + 1}</label>
              <textarea
                value={q.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder="Enter question"
              />
            </div>
            <div className="form-group options-section">
              <label>Options</label>
              {q.options.map((opt, oIndex) => (
                <div className="option-line" key={oIndex}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  <label className="correct-label">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === opt}
                      onChange={() => handleCorrectAnswerChange(qIndex, opt)}
                    />
                    Correct
                  </label>
                </div>
              ))}
            </div>
            {form.questions.length > 1 && (
              <button
                type="button"
                className="remove-question-btn"
                onClick={() => removeQuestion(qIndex)}
              >
                Remove Question
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="add-question-btn"
          onClick={addQuestion}
        >
          + Add Question
        </button>

        <motion.button
          type="submit"
          className="add-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <FaPlusCircle />{" "}
          {loading ? "Saving..." : editingQuizId ? "Update Quiz" : "Add Quiz"}
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
