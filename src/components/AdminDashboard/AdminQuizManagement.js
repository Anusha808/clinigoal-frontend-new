// AdminQuizManagement.js
import React, { useState, useEffect } from "react";
import { quizAPI } from "../../api"; // ✅ Updated API import
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";
import "./AdminQuizManagement.css";

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    courseName: "",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
  });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await quizAPI.getAllQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "Failed to fetch quizzes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ✅ Form handlers
  const handleInputChange = (field, value) => setForm({ ...form, [field]: value });
  const handleQuestionChange = (value) => {
    const updated = [...form.questions];
    updated[0].question = value;
    setForm({ ...form, questions: updated });
  };
  const handleOptionChange = (i, value) => {
    const updated = [...form.questions];
    updated[0].options[i] = value;
    setForm({ ...form, questions: updated });
  };
  const handleCorrectAnswerChange = (value) => {
    const updated = [...form.questions];
    updated[0].correctAnswer = value;
    setForm({ ...form, questions: updated });
  };

  // ✅ Submit quiz (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = form.questions[0];

    if (!form.title || !form.courseName || !q.question || q.options.some((o) => !o) || !q.correctAnswer) {
      Swal.fire("⚠️ Warning", "Please fill all fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      if (editingQuizId) {
        await quizAPI.updateQuiz(editingQuizId, form);
        Swal.fire("✅ Updated", "Quiz updated successfully.", "success");
      } else {
        await quizAPI.createQuiz(form);
        Swal.fire("✅ Added", "Quiz added successfully.", "success");
      }

      setForm({
        title: "",
        courseName: "",
        questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
      });
      setEditingQuizId(null);
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "Failed to save quiz.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit quiz
  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      courseName: quiz.courseName,
      questions: quiz.questions,
    });
    setEditingQuizId(quiz._id);
    Swal.fire("✏️ Edit Mode", `You are editing "${quiz.title}"`, "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Delete quiz
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This quiz will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      await quizAPI.deleteQuiz(id);
      Swal.fire("🗑️ Deleted!", "Quiz removed successfully.", "success");
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "Failed to delete quiz.", "error");
    }
  };

  return (
    <div className="admin-quiz-management">
      <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <FaPlusCircle className="icon" /> Quiz Management
      </motion.h2>

      <motion.form className="quiz-form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <input type="text" placeholder="Quiz Title" value={form.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
        <input type="text" placeholder="Course Name" value={form.courseName} onChange={(e) => handleInputChange("courseName", e.target.value)} required />
        <textarea placeholder="Question" value={form.questions[0].question} onChange={(e) => handleQuestionChange(e.target.value)} required />

        {form.questions[0].options.map((opt, i) => (
          <div key={i} className="option-row">
            <input type="text" value={opt} placeholder={`Option ${i + 1}`} onChange={(e) => handleOptionChange(i, e.target.value)} required />
            <label>
              <input type="radio" name="correctAnswer" checked={form.questions[0].correctAnswer === opt} onChange={() => handleCorrectAnswerChange(opt)} />
              Correct
            </label>
          </div>
        ))}

        <div className="form-buttons">
          <button type="submit" disabled={loading}>{editingQuizId ? "💾 Update Quiz" : "➕ Add Quiz"}</button>
          {editingQuizId && (
            <button type="button" onClick={() => {
              setEditingQuizId(null);
              setForm({ title: "", courseName: "", questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }] });
              Swal.fire("❎ Edit Cancelled", "You are now in add mode.", "info");
            }}>Cancel</button>
          )}
        </div>
      </motion.form>

      <div className="quiz-table-container">
        <h3>📂 Uploaded Quizzes</h3>
        {loading ? <p>Loading quizzes...</p> : quizzes.length > 0 ? (
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
              {quizzes.map((quiz, idx) => (
                <motion.tr key={quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <td>{quiz.title}</td>
                  <td>{quiz.courseName}</td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleEdit(quiz)}><FaEdit /> Edit</button>
                    <button onClick={() => handleDelete(quiz._id)}><FaTrash /> Delete</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : <p>No quizzes uploaded yet.</p>}
      </div>
    </div>
  );
};

export default AdminQuizManagement;
