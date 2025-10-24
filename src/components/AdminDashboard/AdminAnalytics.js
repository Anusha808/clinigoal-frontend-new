// AdminAnalytics.js
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import axios from "axios";
import "./AdminAnalytics.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const COLORS = ["#0078FF", "#00C49F", "#845EC2"];

const AdminAnalytics = () => {
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/analytics`);
        const data = res.data;
        setLineData(data.lineData || []);
        setBarData(data.barData || []);
        setPieData(data.pieData || []);
        setStats(data.stats || {});
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="analytics-dashboard">
      <h2>📊 Platform Analytics Overview</h2>

      <div className="stats-cards">
        <div className="stat-card">👥 Total Users: {stats.totalUsers || 0}</div>
        <div className="stat-card">📚 Total Courses: {stats.totalCourses || 0}</div>
        <div className="stat-card">📈 Monthly Growth: {stats.monthlyGrowth || "0%"}</div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>User & Course Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#0078ff" />
              <Line type="monotone" dataKey="courses" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Monthly Engagement (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="engagement" fill="#0078FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
