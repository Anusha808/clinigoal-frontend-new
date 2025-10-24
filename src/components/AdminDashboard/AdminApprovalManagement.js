// AdminApprovalManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminApprovalManagement.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminApprovalManagement = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/enrollments`);
      setApprovals(res.data.enrollments || []);
    } catch {
      alert("Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => fetchApprovals(), []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/enrollments/${id}`, { status });
      fetchApprovals();
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="approval-management">
      <h2>📋 Enrollment Approvals</h2>
      <table>
        <thead><tr><th>User</th><th>Course</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {approvals.map(a => (
            <tr key={a._id}>
              <td>{a.userName}</td>
              <td>{a.courseTitle}</td>
              <td>{a.status}</td>
              <td>
                {a.status === "pending" && <>
                  <button onClick={() => updateStatus(a._id, "approved")}>Approve</button>
                  <button onClick={() => updateStatus(a._id, "rejected")}>Reject</button>
                </>}
                {a.status !== "pending" && <button onClick={() => updateStatus(a._id, "pending")}>Revoke</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminApprovalManagement;
