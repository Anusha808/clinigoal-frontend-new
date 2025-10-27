// src/components/AdminAnalytics.js

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { analyticsAPI } from "../../api"; 
import "./AdminAnalytics.css";

const COLORS = ["#0078FF", "#00C49F", "#845EC2", "#FFBB28", "#FF8042"];

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
        const res = await analyticsAPI.get();
        const data = res.data;
        
        setLineData(data.lineData || []);
        setBarData(data.barData || []);
        setPieData(data.pieData || []);
        setStats(data.stats || {});
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  // --- Custom Tooltip for a more attractive look ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-dashboard">
      <h2>📊 Platform Analytics Overview</h2>

      <div className="stats-cards">
        <div className="stat-card">👥 Total Users: {stats.totalUsers || 0}</div>
        <div className="stat-card">📚 Total Courses: {stats.totalCourses || 0}</div>
        <div className="stat-card">📈 Monthly Growth: {stats.monthlyGrowth || "0%"}</div>
      </div>

      <div className="charts-grid">
        {/* 🔹 Line Chart with Gradient and Custom Dots */}
        <div className="chart-card">
          <h3>User & Course Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1" startOffset="5%" endOffset="95%">
                  <stop offset="5%" stopColor="#0078FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0078FF" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1" startOffset="5%" endOffset="95%">
                  <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="url(#colorUsers)"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0078FF', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
                name="Users"
              />
              <Line
                type="monotone"
                dataKey="courses"
                stroke="url(#colorCourses)"
                strokeWidth={3}
                dot={{ r: 5, fill: '#00C49F', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
                name="Courses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Bar Chart with Gradient and Rounded Bars */}
        <div className="chart-card">
          <h3>Monthly Engagement (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1" startOffset="5%" endOffset="95%">
                  <stop offset="5%" stopColor="#845EC2" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#845EC2" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="engagement" fill="url(#colorEngagement)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Pie Chart with Outer Border and Custom Label */}
        <div className="chart-card">
          <h3>User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                <linearGradient id="colorGradient0" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0078FF" stopOpacity={1} />
                  <stop offset="100%" stopColor="#00C9A7" stopOpacity={1} />
                </linearGradient>
                 <linearGradient id="colorGradient1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#845EC2" stopOpacity={1} />
                  <stop offset="100%" stopColor="#B39CD0" stopOpacity={1} />
                </linearGradient>
              </defs>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#colorGradient${index % 2})`} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;