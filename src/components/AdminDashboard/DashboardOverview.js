import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaUserFriends,
  FaBook,
  FaClipboardList,
  FaRupeeSign,
  FaCog,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DashboardOverview.css";

// Use environment variable or fallback
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://clinigoal-backend.onrender.com");

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  });

  const navigate = useNavigate();

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Updated endpoint to include /api
        const res = await axios.get(`${API_BASE_URL}/api/admin/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("❌ Error loading stats:", err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <FaUserFriends />,
      color: "linear-gradient(135deg, #00c6ff, #0072ff)",
    },
    {
      label: "Courses",
      value: stats.totalCourses,
      icon: <FaBook />,
      color: "linear-gradient(135deg, #43e97b, #38f9d7)",
    },
    {
      label: "Enrollments",
      value: stats.totalEnrollments,
      icon: <FaClipboardList />,
      color: "linear-gradient(135deg, #f7971e, #ffd200)",
    },
    {
      label: "Revenue",
      value: `₹${stats.totalRevenue}`,
      icon: <FaRupeeSign />,
      color: "linear-gradient(135deg, #fc466b, #3f5efb)",
    },
    {
      label: "Settings",
      value: "⚙️",
      icon: <FaCog />,
      color: "linear-gradient(135deg, #8e2de2, #4a00e0)",
      onClick: () => navigate("/admin/settings"),
    },
  ];

  return (
    <div className="overview-container">
      {/* Top Bar */}
      <div className="overview-topbar">
        <h2 className="overview-title">📊 Dashboard Overview</h2>
        <div
          className="overview-logo"
          style={{ cursor: "pointer", fontSize: "24px" }}
          onClick={() => navigate("/home")}
          title="Go Home"
        >
          🏠
        </div>
      </div>

      <motion.div
        className="overview-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="overview-card"
            style={{
              background: card.color,
              cursor: card.onClick ? "pointer" : "default",
            }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={card.onClick ? card.onClick : undefined}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-info">
              <h3>{card.label}</h3>
              <p>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
