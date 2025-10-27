// AdminQuizManagement.js
import React, { useState, useEffect } from "react";
import { quizAPI } from "../../api";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBookOpen, 
  FaQuestion, 
  FaSave, 
  FaTimes, 
  FaSpinner,
  FaLayerGroup,
  FaCheck
} from "react-icons/fa";
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
  const [activeView, setActiveView] = useState("form");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await quizAPI.getAll();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch quizzes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

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
    const q = form.questions[0];

    if (!form.title || !form.courseName || !q.question || q.options.some((o) => !o) || !q.correctAnswer) {
      Swal.fire("Warning", "Please fill all fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      if (editingQuizId) {
        await quizAPI.update(editingQuizId, form);
        Swal.fire("Success", "Quiz updated successfully.", "success");
      } else {
        await quizAPI.create(form);
        Swal.fire("Success", "Quiz added successfully.", "success");
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
      Swal.fire("Error", "Failed to save quiz.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      courseName: quiz.courseName,
      questions: quiz.questions,
    });
    setEditingQuizId(quiz._id);
    setActiveView("form");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This quiz will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });
    
    if (result.isConfirmed) {
      try {
        await quizAPI.delete(id);
        Swal.fire("Deleted!", "Quiz removed successfully.", "success");
        fetchQuizzes();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete quiz.", "error");
      }
    }
  };

  return (
    <div className="quiz-management">
      <div className="container">
        <header className="page-header">
          <h1>Quiz Management</h1>
          <p>Create and manage course quizzes</p>
        </header>

        <nav className="view-toggle">
          <button 
            className={`toggle-btn ${activeView === "form" ? "active" : ""}`}
            onClick={() => setActiveView("form")}
          >
            <FaPlus /> {editingQuizId ? "Edit Quiz" : "New Quiz"}
          </button>
          <button 
            className={`toggle-btn ${activeView === "list" ? "active" : ""}`}
            onClick={() => setActiveView("list")}
          >
            <FaLayerGroup /> All Quizzes ({quizzes.length})
          </button>
        </nav>

        {activeView === "form" && (
          <motion.div 
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h2>{editingQuizId ? "Edit Quiz" : "Create New Quiz"}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="quiz-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="title">
                      <FaBookOpen /> Quiz Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Enter quiz title"
                      value={form.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="course">
                      <FaBookOpen /> Course Name
                    </label>
                    <input
                      id="course"
                      type="text"
                      placeholder="e.g., Mathematics 101"
                      value={form.courseName}
                      onChange={(e) => handleInputChange("courseName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="question">
                    <FaQuestion /> Question
                  </label>
                  <textarea
                    id="question"
                    placeholder="Write your question here..."
                    value={form.questions[0].question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="options-section">
                  <h3>Answer Options</h3>
                  <div className="options-grid">
                    {form.questions[0].options.map((opt, i) => (
                      <div key={i} className="option-group">
                        <div className="option-header">
                          <span className="option-label">Option {String.fromCharCode(65 + i)}</span>
                          <label className="radio-container">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={form.questions[0].correctAnswer === opt}
                              onChange={() => handleCorrectAnswerChange(opt)}
                            />
                            <span className="checkmark">
                              <FaCheck />
                            </span>
                            Correct
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder={`Enter option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 
                     editingQuizId ? <><FaSave /> Update Quiz</> : <><FaPlus /> Create Quiz</>}
                  </button>
                  {editingQuizId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingQuizId(null);
                        setForm({ 
                          title: "", 
                          courseName: "", 
                          questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }] 
                        });
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeView === "list" && (
          <motion.div 
            className="list-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h2>Quiz Library</h2>
              </div>
              
              {loading ? (
                <div className="loading">
                  <FaSpinner className="spinner" />
                  <p>Loading quizzes...</p>
                </div>
              ) : quizzes.length > 0 ? (
                <div className="quiz-list">
                  {quizzes.map((quiz) => (
                    <motion.div 
                      key={quiz._id} 
                      className="quiz-item"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="quiz-info">
                        <h3>{quiz.title}</h3>
                        <p className="course">{quiz.courseName}</p>
                        <span className="question-count">
                          {quiz.questions?.length || 0} questions
                        </span>
                      </div>
                      <div className="quiz-actions">
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(quiz)}
                          title="Edit quiz"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(quiz._id)}
                          title="Delete quiz"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaQuestion className="empty-icon" />
                  <h3>No quizzes yet</h3>
                  <p>Create your first quiz to get started</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveView("form")}
                  >
                    <FaPlus /> Create Quiz
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminQuizManagement;