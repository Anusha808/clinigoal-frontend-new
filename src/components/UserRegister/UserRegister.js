import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./UserRegister.css";

// ✅ Automatically use environment variable or fallback for localhost
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://clinigoal-backend-yfu3.onrender.com/api");

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✏️ Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🚀 Handle Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ Step 1: Register the user
      const res = await axios.post(`${API_BASE_URL}/users/register`, formData);
      const user = res.data.user || res.data;

      // ✅ Step 2: Create initial tracking record
      await axios.post(`${API_BASE_URL}/admin/user-tracking`, {
        userId: user._id,
        name: user.name,
        email: user.email,
        action: "User Registered",
      });

      setSuccess("🎉 Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login/user"), 2000);
    } catch (err) {
      console.error("Registration Error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-register-container">
      <div className="user-register-card" data-aos="zoom-in">
        <h2>📝 Create Your Clinigoal Account</h2>
        <p className="subtitle">Start your learning journey with us today!</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/login/user" className="login-text">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
