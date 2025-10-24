import React, { useState, useEffect, useRef } from "react";
import API from "../../api"; // centralized axios instance
import Swal from "sweetalert2";
import "./AdminApprovalManagement.css";

const AdminApprovalManagement = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [newEnrollmentIds, setNewEnrollmentIds] = useState(new Set());
  const prevApprovalsRef = useRef([]);

  const fetchApprovals = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      else setRefreshing(true);

      const { data } = await API.get("/enrollments"); // ✅ no extra /api
      const currentApprovals = Array.isArray(data.enrollments)
        ? data.enrollments
        : [];

      // Detect new enrollments
      if (prevApprovalsRef.current.length > 0) {
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
      console.error("Fetch approvals error:", err);
      setError("Failed to fetch approvals. Check server connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(() => fetchApprovals(true), 6000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Update enrollment status
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/enrollments/${id}`, { status });
      Swal.fire(
        "Success",
        `Enrollment ${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "set to pending"
        }!`,
        "success"
      );
      fetchApprovals();
    } catch (err) {
      console.error("Update status error:", err);
      Swal.fire("Error", "Failed to update enrollment status.", "error");
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  if (loading) {
    return (
      <div className="approval-management">
        <p>Loading approvals...</p>
      </div>
    );
  }

  return (
    <div className="approval-management">
      <div className="page-header">
        <h2>📋 Enrollment Approvals</h2>
        <button onClick={() => fetchApprovals()} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {approvals.length === 0 ? (
        <p>No enrollment requests yet.</p>
      ) : (
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
                className={newEnrollmentIds.has(a._id) ? "new-enrollment" : ""}
              >
                <td>
                  {a.userName || "Unknown"}
                  {newEnrollmentIds.has(a._id) && <span className="new-badge">NEW</span>}
                </td>
                <td>{a.courseTitle || "Untitled"}</td>
                <td>{a.paymentId || "N/A"}</td>
                <td>{formatDate(a.createdAt)}</td>
                <td>{a.status}</td>
                <td>
                  {a.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(a._id, "approved")}>
                        Approve
                      </button>
                      <button onClick={() => updateStatus(a._id, "rejected")}>
                        Reject
                      </button>
                    </>
                  )}
                  {a.status === "approved" && (
                    <button onClick={() => updateStatus(a._id, "pending")}>
                      Revoke
                    </button>
                  )}
                  {a.status === "rejected" && (
                    <button onClick={() => updateStatus(a._id, "pending")}>
                      Reopen
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminApprovalManagement;
