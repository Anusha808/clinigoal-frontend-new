import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaUserFriends,
  FaBook,
  FaClipboardList,
  FaRupeeSign,
} from "react-icons/fa";
import API_BASE_URL from "../../api"; // ✅ Correct import
import "./DashboardOverview.css";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/stats`);
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
  ];

  return (
    <div className="overview-container">
      <motion.h2
        className="overview-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        📊 Dashboard Overview
      </motion.h2>

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
            style={{ background: card.color }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
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

