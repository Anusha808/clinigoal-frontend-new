// AdminQuizManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlusCircle, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "./AdminQuizManagement.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    courseName: "",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }]
  });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => fetchQuizzes(), []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/quizzes`);
      setQuizzes(res.data.quizzes || []);
    } catch {
      Swal.fire("Error", "Failed to fetch quizzes", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseName || !form.questions[0].question || form.questions[0].options.some(o => !o) || !form.questions[0].correctAnswer) {
      Swal.fire("Error", "Fill all fields", "warning");
      return;
    }

    try {
      setLoading(true);
      if (editingQuizId) await axios.put(`${API_BASE_URL}/quizzes/${editingQuizId}`, form);
      else await axios.post(`${API_BASE_URL}/quizzes`, form);

      Swal.fire("Success", editingQuizId ? "Updated quiz" : "Added quiz", "success");
      setForm({ title: "", courseName: "", questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }] });
      setEditingQuizId(null);
      fetchQuizzes();
    } catch {
      Swal.fire("Error", "Failed to save quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz) => {
    setForm({ title: quiz.title, courseName: quiz.courseName, questions: quiz.questions });
    setEditingQuizId(quiz._id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This quiz will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes"
    });
    if (!confirm.isConfirmed) return;
    await axios.delete(`${API_BASE_URL}/quizzes/${id}`);
    Swal.fire("Deleted!", "Quiz removed", "success");
    fetchQuizzes();
  };

  return (
    <div className="admin-quiz-management">
      <h2>📋 Quiz Management</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Quiz Title" value={form.title} onChange={e => handleInputChange("title", e.target.value)} required />
        <input type="text" placeholder="Course Name" value={form.courseName} onChange={e => handleInputChange("courseName", e.target.value)} required />
        <textarea placeholder="Question" value={form.questions[0].question} onChange={e => handleQuestionChange(e.target.value)} required />
        {form.questions[0].options.map((opt, i) => (
          <div key={i}>
            <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} required />
            <label>
              <input type="radio" checked={form.questions[0].correctAnswer === opt} onChange={() => handleCorrectAnswerChange(opt)} />
              Correct
            </label>
          </div>
        ))}
        <button type="submit">{editingQuizId ? "Update Quiz" : "Add Quiz"}</button>
      </form>

      <table>
        <thead><tr><th>Title</th><th>Course</th><th>Questions</th><th>Actions</th></tr></thead>
        <tbody>
          {quizzes.map(q => (
            <tr key={q._id}>
              <td>{q.title}</td>
              <td>{q.courseName}</td>
              <td>{q.questions?.length || 0}</td>
              <td>
                <button onClick={() => handleEdit(q)}><FaEdit /></button>
                <button onClick={() => handleDelete(q._id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminQuizManagement;
