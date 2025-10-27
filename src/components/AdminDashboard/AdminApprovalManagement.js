// AdminApprovalManagement.js
import React, { useState, useEffect, useRef } from "react";
import api, { approvalAPI } from "../../api"; // ✅ use updated api.js
import "./AdminApprovalManagement.css";

const AdminApprovalManagement = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newEnrollmentIds, setNewEnrollmentIds] = useState(new Set());
  const prevApprovalsRef = useRef();

  // ✅ Fetch approvals
  const fetchApprovals = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      else setRefreshing(true);

      // ✅ FIX: Changed from .getAllApprovals() to .getAll() to match the function name in api.js
      const { data } = await approvalAPI.getAll();

      const currentApprovals = Array.isArray(data.enrollments)
        ? data.enrollments
        : [];

      if (prevApprovalsRef.current) {
        const oldIds = new Set(prevApprovalsRef.current.map((a) => a._id));
        const newIds = currentApprovals
          .filter((a) => !oldIds.has(a._id))
          .map((a) => a._id);

        if (newIds.length > 0) {
          setNewEnrollmentIds((prev) => new Set([...prev, ...newIds]));
          setTimeout(() => {
            setNewEnrollmentIds((prev) => {
              const next = new Set(prev);
              newIds.forEach((id) => next.delete(id));
              return next;
            });
          }, 8000);
        }
      }

      setApprovals(currentApprovals);
      prevApprovalsRef.current = currentApprovals;
      setError(null);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      if (err.response) {
        setError(err.response.data.message || "Failed to fetch approvals.");
      } else if (err.request) {
        setError("⚠️ Cannot reach the server. Please try again later.");
      } else {
        setError("❌ Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(() => fetchApprovals(true), 8000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Update enrollment status
  const updateStatus = async (id, status, successMsg) => {
    try {
      await api.put(`/enrollments/${id}`, { status });
      alert(successMsg);
      fetchApprovals();
    } catch (err) {
      alert("Error updating request.");
      console.error(err);
    }
  };

  const handleApprove = (id) => updateStatus(id, "approved", "✅ Enrollment approved!");
  const handleReject = (id) => updateStatus(id, "rejected", "❌ Enrollment rejected.");
  const handleRevoke = (id) => updateStatus(id, "pending", "⚠️ Approval revoked.");

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  if (loading) {
    return (
      <div className="approval-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-management">
      <div className="page-header">
        <h2 className="page-title">📋 Enrollment Approvals</h2>
        {/* ✅ UPDATED: New Attractive Refresh Button */}
        <button
          type="button"
          onClick={() => fetchApprovals()}
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          disabled={refreshing}
          title="Refresh Data"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button type="button" onClick={() => fetchApprovals()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {approvals.length === 0 && !error ? (
        <div className="no-approvals">
          <div className="no-approvals-icon">📭</div>
          <p>No enrollment requests yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="approval-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Course</th>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr
                  key={a._id}
                  className={`${newEnrollmentIds.has(a._id) ? "new-enrollment" : ""}`}
                >
                  <td>
                    {a.userName || "Unknown"}
                    {newEnrollmentIds.has(a._id) && <span className="new-badge">NEW</span>}
                  </td>
                  <td>{a.courseTitle || "Untitled"}</td>
                  <td>{a.paymentId || "N/A"}</td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${a.status}`}>
                      {a.status === "approved" && "✅ Approved"}
                      {a.status === "rejected" && "❌ Rejected"}
                      {a.status === "pending" && "⏳ Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {a.status === "pending" && (
                        <>
                          <button className="approve-btn" onClick={() => handleApprove(a._id)}>Approve</button>
                          <button className="reject-btn" onClick={() => handleReject(a._id)}>Reject</button>
                        </>
                      )}
                      {a.status === "approved" && (
                        <button className="revoke-btn" onClick={() => handleRevoke(a._id)}>Revoke</button>
                      )}
                      {a.status === "rejected" && (
                        <button className="revoke-btn" onClick={() => handleRevoke(a._id)}>Reopen</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalManagement;