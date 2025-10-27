// AdminReviewManagement.js
import React, { useState, useEffect } from "react";
import api, { reviewAPI } from "../../api"; // ✅ FIXED: Correctly import default and named exports
import {
  FaStar,
  FaTrash,
  FaCommentDots,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import "./AdminReviewManagement.css";

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔁 Fetch all reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewAPI.getAll();
      
      // ✅ DETAILED LOGGING: Check what the backend actually sends
      console.log("Full API Response from /reviews:", response);
      console.log("Response Data:", response.data);

      // ✅ ROBUST DATA HANDLING: Handle different possible response structures
      let reviewsData = response.data;
      if (reviewsData && reviewsData.reviews) {
        // If the backend sends { reviews: [...] }
        reviewsData = reviewsData.reviews;
      }
      
      // Ensure we always set an array
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("⚠️ Failed to fetch reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this review?")) return;
    
    const originalReviews = [...reviews]; // Keep a copy in case of failure

    // NOTE: This is an "optimistic update". The UI is updated immediately
    // for a better user experience, assuming the server request will succeed.
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));

    try {
      // Use the specific reviewAPI.delete method for consistency
      await reviewAPI.delete(reviewId);
    } catch (err) {
      console.error("Error deleting review:", err);
      // If the delete fails, revert the state to its original form
      setReviews(originalReviews);
      setError("❌ Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchReviews}>🔄 Try Again</button>
      </div>
    );
  }

  return (
    <div className="review-management">
      <h2>📝 Course Reviews</h2>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <FaCommentDots size={48} color="#ccc" />
          <p>No reviews available yet.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <FaUser />
                  <span>{review.userName || "Anonymous User"}</span>
                </div>
                <div className="review-date">
                  <FaCalendarAlt />
                  <span>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="review-course">
                <strong>📘 Course:</strong>{" "}
                {review.courseTitle || "Unknown Course"}
              </div>

              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={
                      star <= review.rating ? "star-active" : "star-inactive"
                    }
                  />
                ))}
              </div>

              <div className="review-content">
                <p>{review.review || "No review text provided."}</p>
              </div>

              <div className="review-actions">
                <button
                  className="delete-btn"
                  onClick={() => deleteReview(review._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewManagement;