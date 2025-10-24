import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminCourseManagement from "./AdminCourseManagement";
import AdminVideoManagement from "./AdminVideoManagement";
import AdminNoteManagement from "./AdminNoteManagement";
import AdminQuizManagement from "./AdminQuizManagement";
import AdminApprovalManagement from "./AdminApprovalManagement";
import AdminUserTracking from "./AdminUserTracking";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";
import AdminReviewManagement from "./AdminReviewManagement";
import DashboardOverview from "./DashboardOverview";
import { motion } from "framer-motion";
import {
  FaBook,
  FaVideo,
  FaStickyNote,
  FaBrain,
  FaCheckCircle,
  FaBars,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUsers,
  FaChartLine,
  FaCog,
  FaCommentDots,
} from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    alert("You have been logged out successfully!");
    navigate("/"); // Redirect to home
  };

  // Render tab content dynamically
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <AdminUserTracking />;
      case "courses":
        return <AdminCourseManagement />;
      case "videos":
        return <AdminVideoManagement />;
      case "notes":
        return <AdminNoteManagement />;
      case "quizzes":
        return <AdminQuizManagement />;
      case "approvals":
        return <AdminApprovalManagement />;
      case "reviews":
        return <AdminReviewManagement />;
      case "analytics":
        return <AdminAnalytics />;
      case "settings":
        return <AdminSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  // Sidebar Navigation Items
  const navItems = [
    { id: "dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { id: "users", icon: <FaUsers />, label: "Users" },
    { id: "courses", icon: <FaBook />, label: "Courses" },
    { id: "videos", icon: <FaVideo />, label: "Videos" },
    { id: "notes", icon: <FaStickyNote />, label: "Notes" },
    { id: "quizzes", icon: <FaBrain />, label: "Quizzes" },
    { id: "approvals", icon: <FaCheckCircle />, label: "Approvals" },
    { id: "reviews", icon: <FaCommentDots />, label: "Reviews" },
    { id: "analytics", icon: <FaChartLine />, label: "Analytics" },
    { id: "settings", icon: <FaCog />, label: "Settings" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
        initial={{ width: 0 }}
        animate={{ width: sidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sidebar-header">
          {sidebarOpen && <h2>Clinigoal</h2>}
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Dashboard Content */}
      <motion.div
        key={activeTab}
        className="dashboard-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
