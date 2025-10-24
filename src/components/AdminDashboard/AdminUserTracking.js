// AdminUserTracking.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaTrash,
  FaCalendarAlt,
  FaEnvelope,
  FaUserCircle,
  FaBook,
  FaCheckCircle,
  FaVideo,
  FaFileAlt,
  FaCertificate,
  FaQuestionCircle,
  FaTimes,
} from "react-icons/fa";
import "./AdminUserTracking.css";

const AdminUserTracking = () => {
  const [users, setUsers] = useState([]);
  const [userProgressData, setUserProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Auto-switch backend URL based on environment
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://clinigoal-backend.onrender.com";

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔁 Fetch users and their progress
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/users`);
      setUsers(res.data);

      const progressPromises = res.data.map((user) =>
        axios
          .get(`${backendURL}/api/progress/user/${user._id}`)
          .then((r) => ({ userId: user._id, progress: r.data }))
          .catch(() => ({ userId: user._id, progress: [] }))
      );

      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      progressResults.forEach((item) => {
        progressMap[item.userId] = item.progress;
      });
      setUserProgressData(progressMap);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete a user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure? This will delete all user data.")) {
      try {
        await axios.delete(`${backendURL}/api/users/${userId}`);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } catch (err) {
        console.error("❌ Failed to delete user:", err);
        setError("Failed to delete user.");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container">Loading users...</div>;

  return (
    <motion.div
      className="user-tracking-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="page-title">
        <FaUsers /> User Progress Tracking
      </h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <motion.div
            key={user._id}
            className="user-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="user-info">
              <div className="user-avatar">
                <FaUserCircle />
              </div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <p>
                  <FaEnvelope /> {user.email}
                </p>
                <p>
                  <FaCalendarAlt /> Registered:{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="user-actions">
              <button
                className="delete-btn"
                onClick={() => handleDeleteUser(user._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>

            {/* 📊 Show progress */}
            {userProgressData[user._id]?.length > 0 && (
              <div className="user-progress-details">
                {userProgressData[user._id].map((progress) => (
                  <div key={progress._id} className="course-progress-card">
                    <h4>
                      <FaBook /> {progress.courseId?.title || "Untitled Course"}
                    </h4>

                    {/* 🎬 Video progress */}
                    <div className="progress-section">
                      <h5>
                        <FaVideo /> Videos
                      </h5>
                      {progress.videos.length > 0 &&
                        progress.videos.map((vid) => (
                          <div key={vid.videoId} className="progress-item">
                            <span>Video ID: {vid.videoId}</span>
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${
                                    (vid.watchedDuration / vid.totalDuration) *
                                      100 || 0
                                  }%`,
                                }}
                              ></div>
                              <span>
                                {Math.round(
                                  (vid.watchedDuration / vid.totalDuration) * 100 || 0
                                )}
                                %
                              </span>
                            </div>
                            {vid.isCompleted && <FaCheckCircle color="green" />}
                          </div>
                        ))}
                    </div>

                    {/* 📝 Assignment progress */}
                    {progress.assignment && (
                      <div className="progress-section">
                        <h5>
                          <FaFileAlt /> Assignment
                        </h5>
                        <div className="progress-item">
                          {progress.assignment.isSubmitted ? (
                            <>
                              <FaCheckCircle color="green" />
                              <span>
                                Submitted on{" "}
                                {new Date(progress.assignment.submissionDate).toLocaleDateString()}
                              </span>
                              <span>({progress.assignment.fileName})</span>
                            </>
                          ) : (
                            <span>Not submitted</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 🧩 Quiz progress */}
                    {progress.quiz && (
                      <div className="progress-section">
                        <h5>
                          <FaQuestionCircle /> Quiz
                        </h5>
                        <div className="progress-item">
                          <span>
                            Latest Score: {progress.quiz.score} / {progress.quiz.totalQuestions}
                          </span>
                          {progress.quiz.isPassed ? (
                            <FaCheckCircle color="green" />
                          ) : (
                            <FaTimes color="red" />
                          )}
                          <span>({progress.quiz.attempts.length} attempts)</span>
                        </div>
                      </div>
                    )}

                    {/* 🎓 Certificate */}
                    {progress.certificate && progress.certificate.isGenerated && (
                      <div className="progress-section">
                        <h5>
                          <FaCertificate /> Certificate
                        </h5>
                        <div className="progress-item">
                          <FaCheckCircle color="green" />
                          <span>
                            Generated on{" "}
                            {new Date(progress.certificate.generatedDate).toLocaleDateString()}
                          </span>
                          <span>ID: {progress.certificate.certificateId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminUserTracking;
