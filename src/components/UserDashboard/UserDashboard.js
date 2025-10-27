import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaVideo,
  FaStickyNote,
  FaBookOpen,
  FaQuestionCircle,
  FaCertificate,
  FaCommentDots,
  FaSignOutAlt,
  FaBars,
  FaLock,
  FaPlay,
  FaDownload,
  FaFilePdf,
  FaCheckCircle,
  FaStar,
  FaTimes,
  FaTrophy,
  FaCalendarAlt,
  FaUser,
  FaShare,
  FaAward,
  FaGraduationCap,
  FaQuoteLeft,
  FaQuoteRight,
  FaMedal,
  FaPrint,
} from "react-icons/fa";
import "./UserDashboard.css";
import { reviewAPI } from "../../api";

// --- Helper Function for ObjectId Validation ---
const isValidObjectId = (id) => {
  return typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
};

// --- Refactored Components for Better Readability ---

const CourseCard = ({ course, status, isLoading, onEnroll, onContinue }) => {
  const isThisCourseActive = status === "approved";
  let label = "Enroll Now", cls = "enroll-btn", disabled = false;

  if (status === "pending") { 
    label = "Pending Approval ⏳"; 
    cls = "pending-btn"; 
    disabled = true; 
  } else if (status === "approved") { 
    label = isThisCourseActive ? "Continue Learning ▶️" : "Paid ✅"; 
    cls = "paid-btn"; 
  }

  return (
    <motion.div 
      className={`course-card ${isThisCourseActive ? "active-course" : ""}`} 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <button 
        disabled={isLoading || disabled} 
        className={cls} 
        onClick={() => status === "approved" ? onContinue() : onEnroll()}
      >
        {isLoading && status === "not_enrolled" ? "Processing..." : label}
      </button>
    </motion.div>
  );
};

const LockedContent = ({ section, progress, onBackToDashboard }) => (
  <>
    <h3>{section}</h3>
    <div className="locked-content">
      <FaLock size={48} color="#ccc" />
      <h4>Content Locked</h4>
      {progress ? (
        <div className="progress-indicator">
          <p>Please complete all course sections to unlock your certificate.</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(Object.values(progress).filter(Boolean).length / 4) * 100}%`}}
            ></div>
          </div>
          <ul className="progress-list">
            {["videos", "notes", "assignments", "quiz"].map(s => (
              <li key={s} className={progress[s] ? "completed" : ""}>
                <FaCheckCircle /> {s.charAt(0).toUpperCase() + s.slice(1)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Please complete payment and wait for admin approval to access this content.</p>
      )}
      <button onClick={onBackToDashboard} className="back-btn">Back to Dashboard</button>
    </div>
  </>
);

// Quiz Component
const QuizComponent = ({ quizzes, onQuizComplete }) => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const selectAnswer = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    onQuizComplete();
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (!currentQuiz) {
    return (
      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-item">
            <h4>{quiz.title}</h4>
            <p>Number of questions: {quiz.questions?.length || 0}</p>
            <button className="start-quiz-btn" onClick={() => startQuiz(quiz)}>
              <FaPlay /> Start Quiz
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>{currentQuiz.title}</h3>
        <button className="close-quiz-btn" onClick={resetQuiz}>
          <FaTimes />
        </button>
      </div>
      
      {!showResults ? (
        <div className="question-container">
          <div className="question-progress">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </div>
          
          <div className="question-text">
            {currentQuiz.questions[currentQuestionIndex].question}
          </div>
          
          <div className="options-container">
            {currentQuiz.questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${
                  selectedAnswers[currentQuestionIndex] === option ? "selected" : ""
                }`}
                onClick={() => selectAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
          
          <button
            className="next-btn"
            onClick={nextQuestion}
            disabled={!selectedAnswers[currentQuestionIndex]}
          >
            {currentQuestionIndex < currentQuiz.questions.length - 1 
              ? "Next Question" 
              : "Submit Quiz"}
          </button>
        </div>
      ) : (
        <div className="results-container">
          <h3>Quiz Results</h3>
          <div className="score-display">
            <p>Your Score: {score} out of {currentQuiz.questions.length}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(score / currentQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="review-answers">
            <h4>Review Your Answers:</h4>
            {currentQuiz.questions.map((question, index) => (
              <div key={index} className="answer-review">
                <p><strong>Q{index + 1}:</strong> {question.question}</p>
                <p className="user-answer">
                  Your Answer: {selectedAnswers[index] || "Not answered"}
                </p>
                <p className="correct-answer">
                  Correct Answer: {question.correctAnswer}
                </p>
                {selectedAnswers[index] === question.correctAnswer ? (
                  <p className="correct"><FaCheckCircle /> Correct</p>
                ) : (
                  <p className="incorrect">Incorrect</p>
                )}
              </div>
            ))}
          </div>
          
          <button className="reset-btn" onClick={resetQuiz}>
            Back to Quiz List
          </button>
        </div>
      )}
    </div>
  );
};

// Assignment Component
const AssignmentComponent = ({ onAssignmentComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadSuccess(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("assignment", file);

    try {
      setUploading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadSuccess(true);
      onAssignmentComplete();
    } catch (err) {
      setError("Failed to submit assignment. Please try again.");
      console.error("Assignment submission error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="assignment-content">
      <p>Complete the assignment below to unlock the quiz.</p>
      <div className="assignment-placeholder">
        <h4>Assignment: Practical Application</h4>
        <p>Submit your work by following the guidelines provided in the course materials.</p>
        
        <div className="assignment-upload">
          <input 
            type="file" 
            id="assignment-file" 
            style={{display: 'none'}} 
            onChange={handleFileChange}
          />
          <label htmlFor="assignment-file" className="upload-btn">
            {file ? file.name : "Choose File"}
          </label>
          <button 
            className="submit-assignment-btn" 
            onClick={handleSubmit}
            disabled={uploading || !file}
          >
            {uploading ? "Uploading..." : "Submit Assignment"}
          </button>
        </div>
        
        {uploadSuccess && (
          <div className="success-message">
            <FaCheckCircle /> Assignment submitted successfully!
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

// Certificate Component with Corrected Canvas Lifecycle
const CertificateComponent = ({ course, userName, completedSections }) => {
  const [generating, setGenerating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateImage, setCertificateImage] = useState(null);
  const [showFallbackCertificate, setShowFallbackCertificate] = useState(false);
  const canvasRef = useRef(null);
  
  const allSectionsCompleted = Object.values(completedSections).every(Boolean);
  const completionDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    if (!isGenerating) return;

    const drawCertificate = () => {
      console.log("useEffect: Attempting to draw certificate...");
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("useEffect: Canvas element not found even after render.");
        setError("Canvas element not found. Please try again.");
        setGenerating(false);
        setIsGenerating(false);
        return;
      }

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error("Failed to get 2D context from canvas.");
        }
        
        canvas.width = 1200;
        canvas.height = 850;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 15;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(40, 40, canvas.width - 80, 150);

        ctx.font = 'bold 48px Georgia';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', canvas.width / 2, 120);
        
        ctx.font = 'italic 24px Georgia';
        ctx.fillStyle = '#ecf0f1';
        ctx.fillText('This is to certify that', canvas.width / 2, 160);

        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        ctx.fillRect(canvas.width / 2 - 300, 190, 600, 80);

        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 42px Georgia';
        ctx.fillText(userName || 'Student Name', canvas.width / 2, 245);

        ctx.font = '24px Georgia';
        ctx.fillStyle = '#34495e';
        ctx.fillText('has successfully completed the course', canvas.width / 2, 310);

        ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
        ctx.fillRect(canvas.width / 2 - 350, 340, 700, 80);

        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 36px Georgia';
        ctx.fillText(course?.title || 'Course Title', canvas.width / 2, 395);

        ctx.font = '18px Arial';
        ctx.fillStyle = '#7f8c8d';
        ctx.textAlign = 'left';
        ctx.fillText(`Date: ${completionDate}`, 100, 470);
        
        const certificateId = "CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
        ctx.fillText(`Certificate ID: ${certificateId}`, 100, 500);
        ctx.fillText(`Score: 95%`, 100, 530);
        ctx.fillText(`Duration: 6 weeks`, 100, 560);

        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 670);
        ctx.lineTo(400, 670);
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.fillStyle = '#34495e';
        ctx.textAlign = 'center';
        ctx.fillText('Dr. Sarah Johnson', 300, 700);
        ctx.fillText('Course Instructor', 300, 720);

        ctx.beginPath();
        ctx.moveTo(700, 670);
        ctx.lineTo(900, 670);
        ctx.stroke();
        ctx.fillText('Clinigoal Educational Platform', 800, 700);
        ctx.fillText('Issuing Authority', 800, 720);
        
        console.log("useEffect: Drawing complete. Attempting toDataURL...");
        const imageUrl = canvas.toDataURL('image/png');
        console.log("useEffect: Image data URL generated successfully.");

        const certificateInfo = {
          id: certificateId,
          userName,
          courseTitle: course.title,
          completionDate,
          issuedBy: "Clinigoal Educational Platform",
          instructorName: "Dr. Sarah Johnson",
          score: "95%",
          duration: "6 weeks",
          imageUrl: imageUrl
        };
        
        setCertificate(certificateInfo);
        setCertificateImage(imageUrl);
        setShowCertificate(true);
        setError(null);

      } catch (err) {
        console.error("useEffect: CRITICAL ERROR during canvas drawing or toDataURL:", err);
        setShowFallbackCertificate(true);
        setError("Canvas generation failed. Displaying a simple certificate instead.");
      } finally {
        setGenerating(false);
        setIsGenerating(false);
      }
    };

    drawCertificate();

  }, [isGenerating, course, userName, completionDate]);

  const generateCertificate = async () => {
    if (!allSectionsCompleted) {
      setError("Please complete all course sections before generating your certificate.");
      return;
    }
    setGenerating(true);
    setError(null);
    setShowFallbackCertificate(false);
    setShowCertificate(false);
    setIsGenerating(true);
  };

  const downloadCertificate = () => {
    if (showFallbackCertificate) {
      alert("For the fallback certificate, please use the 'Print' option and select 'Save as PDF'.");
      return;
    }
    if (certificateImage) {
      try {
        const link = document.createElement("a");
        link.href = certificateImage;
        link.download = `${certificate.courseTitle.replace(/\s+/g, '_')}_Certificate.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Error downloading certificate:", err);
        setError("Failed to download certificate. Please try again.");
      }
    }
  };

  const shareCertificate = () => {
    const shareText = `🎓 I've successfully completed the ${course?.title || 'a course'} from Clinigoal! Certificate ID: ${certificate?.id || 'N/A'}`;
    if (navigator.share) {
      navigator.share({ title: 'Course Completion', text: shareText }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => alert('Certificate details copied to clipboard!'));
    }
  };

  const printCertificate = () => {
    if (showFallbackCertificate) {
      window.print();
    } else if (certificateImage) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>Certificate</title><style>body{margin:0;padding:20px;}img{max-width:100%;}</style></head>
        <body><img src="${certificateImage}" /></body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const closeCertificate = () => {
    setShowCertificate(false);
    setShowFallbackCertificate(false);
  };

  return (
    <div className="certificate-content">
      {!showCertificate && !showFallbackCertificate ? (
        <div className="certificate-status">
          <div className="status-icon">
            <FaTrophy size={64} color={allSectionsCompleted ? "#f39c12" : "#bdc3c7"} />
          </div>
          <h3>Certificate of Completion</h3>
          <div className="completion-status">
            {allSectionsCompleted ? (
              <div className="status-message success">
                <FaCheckCircle /> Congratulations! You have completed all course requirements.
              </div>
            ) : (
              <div className="status-message pending">
                <p>Complete all course sections to unlock your certificate:</p>
                <ul className="requirements-list">
                  {Object.entries(completedSections).map(([section, completed]) => (
                    <li key={section} className={completed ? "completed" : "pending"}>
                      {completed ? <FaCheckCircle /> : <div className="circle-placeholder"></div>}
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button className={`generate-certificate-btn ${!allSectionsCompleted ? 'disabled' : ''}`} onClick={generateCertificate} disabled={!allSectionsCompleted || generating}>
            {generating ? <> <div className="spinner"></div> Generating Certificate... </> : <> <FaCertificate /> Generate Certificate </>}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : showFallbackCertificate ? (
        <div className="certificate-modal-overlay">
          <div className="certificate-modal">
            <div className="certificate-modal-header">
              <h3>Your Certificate of Completion</h3>
              <button className="close-certificate-btn" onClick={closeCertificate}><FaTimes /></button>
            </div>
            <div className="certificate-modal-body">
              <div id="fallback-certificate" className="fallback-certificate">
                <div className="cert-header">
                  <h1>Clinigoal</h1>
                  <h2>Certificate of Completion</h2>
                </div>
                <div className="cert-body">
                  <p>This is to certify that</p>
                  <h3>{userName || 'Student Name'}</h3>
                  <p>has successfully completed the course</p>
                  <h4>{course?.title || 'Course Title'}</h4>
                  <div className="cert-details">
                    <span>Date: {completionDate}</span>
                    <span>ID: CERT-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
                  </div>
                </div>
                <div className="cert-footer">
                  <div className="signature">
                    <p>Dr. Sarah Johnson</p>
                    <span>Course Instructor</span>
                  </div>
                  <div className="signature">
                    <p>Clinigoal Platform</p>
                    <span>Issuing Authority</span>
                  </div>
                </div>
              </div>
              <div className="certificate-actions">
                <button className="print-certificate-btn" onClick={printCertificate}><FaPrint /> Print / Save as PDF</button>
                <button className="share-certificate-btn" onClick={shareCertificate}><FaShare /> Share</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="certificate-modal-overlay">
          <div className="certificate-modal">
            <div className="certificate-modal-header">
              <h3>Your Certificate of Completion</h3>
              <button className="close-certificate-btn" onClick={closeCertificate}><FaTimes /></button>
            </div>
            <div className="certificate-modal-body">
              <div className="certificate-preview-container">
                <div className="certificate-preview">
                  {certificateImage && <img src={certificateImage} alt="Certificate" className="certificate-image" />}
                </div>
              </div>
              <div className="certificate-info">
                <div className="info-item"><FaCalendarAlt /><span>Completed: {certificate.completionDate}</span></div>
                <div className="info-item"><FaFilePdf /><span>ID: {certificate.id}</span></div>
                <div className="info-item"><FaUser /><span>Student: {certificate.userName}</span></div>
                <div className="info-item"><FaAward /><span>Score: {certificate.score}</span></div>
              </div>
              <div className="certificate-actions">
                <button className="download-certificate-btn" onClick={downloadCertificate}><FaDownload /> Download</button>
                <button className="share-certificate-btn" onClick={shareCertificate}><FaShare /> Share</button>
                <button className="print-certificate-btn" onClick={printCertificate}><FaPrint /> Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isGenerating && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <canvas ref={canvasRef} width={1200} height={850} />
        </div>
      )}
    </div>
  );
};

// ✅ FINAL CORRECTED Review Component
const ReviewComponent = ({ course, user }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (review.trim() === "") {
      setError("Please write a review");
      return;
    }

    // ✅ FIX: Add validation for ObjectIds before sending the request
    if (!isValidObjectId(user._id) || !isValidObjectId(course._id)) {
      setError("Invalid user or course ID. Cannot submit review. Please refresh the page.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const reviewData = {
        userId: user._id,
        userName: user.name,
        courseId: course._id,
        courseTitle: course.title,
        rating: rating,
        review: review.trim(),
      };
      console.log("Submitting review data:", reviewData);

      // ✅ FIX: Use the reviewAPI from the API file
      const response = await reviewAPI.create(reviewData);
      console.log("Review submission response:", response);
      
      setSuccess(true);
      setRating(0);
      setReview("");
    } catch (err) {
      console.error("Review submission error:", err);
      console.error("Server Response:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to submit review. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-content">
      <p>Share your feedback for this course!</p>
      
      {success ? (
        <div className="success-message">
          <FaCheckCircle /> Thank you for your feedback!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(s => (
                <button 
                  key={s} 
                  type="button"
                  className={`star-btn ${s <= rating ? "active" : ""}`}
                  onClick={() => setRating(s)}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Your Review</label>
            <textarea 
              rows={4} 
              placeholder="Share your thoughts about this course..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            ></textarea>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="submit-review-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
};

// --- Main Component ---

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState({});
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [error, setError] = useState(null);
  
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [completedSections, setCompletedSections] = useState(() => {
    const saved = localStorage.getItem('completedSections');
    return saved ? JSON.parse(saved) : { videos: false, notes: false, assignments: false, quiz: false };
  });

 const backendURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// ✅ FIX: Robust User State Initialization
const [user] = useState(() => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && parsedUser._id) {
        return parsedUser;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }
  }
  // FIX: Use a valid-looking ObjectId format for the dummy user for testing
  return { _id: "63f8b8e9a4b7c3d2e1f0a9b8", name: "Anusha Hegde" };
});

  // Add useNavigate hook for navigation
  const navigate = useNavigate();

  // --- useEffect Hooks ---

  useEffect(() => {
    const scriptId = "razorpay-sdk";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) fetchEnrollments();
  }, [courses]);

  useEffect(() => {
    if (activeCourse) {
      fetchCourseContent(activeCourse);
    }
  }, [activeCourse]);

  useEffect(() => {
    localStorage.setItem('completedSections', JSON.stringify(completedSections));
  }, [completedSections]);

  // --- API Fetching Functions ---

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/courses`);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses. Please try again later.");
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/enrollments/user/${user._id}`);
      const data = Array.isArray(res.data) ? res.data : (res.data.enrollments || []);
      setEnrollments(data);

      const approvedCourse = data.find((e) => e.status === "approved");
      if (approvedCourse) {
        const matched = courses.find((c) => c._id === approvedCourse.courseId || c._id === approvedCourse.courseId?._id);
        if (matched) {
          setActiveCourse(matched);
          setActiveSection("videos");
        }
      }
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setError("Failed to fetch enrollments. Please try again later.");
    }
  };

  const fetchCourseContent = async (course) => {
    if (!course) return;
    
    console.log("🔍 [FRONTEND] Fetching content for course:", course.title, "with ID:", course._id);
    setContentLoading(true);
    setContentError(null);

    try {
      const [videosRes, notesRes, quizzesRes] = await Promise.all([
        axios.get(`${backendURL}/api/videos`),
        axios.get(`${backendURL}/api/notes`),
        axios.get(`${backendURL}/api/quizzes`)
      ]);

      const allVideos = videosRes.data.videos || videosRes.data || [];
      const allNotes = notesRes.data.notes || notesRes.data || [];
      const allQuizzes = quizzesRes.data.quizzes || quizzesRes.data || [];

      const courseVideos = allVideos.filter(v => v.courseName === course.title);
      const courseNotes = allNotes.filter(n => n.courseName === course.title);
      const courseQuizzes = allQuizzes.filter(q => q.courseName === course.title);
      
      setVideos(courseVideos);
      setNotes(courseNotes);
      setQuizzes(courseQuizzes);

    } catch (err) {
      console.error("Error fetching course content:", err);
      setContentError("Failed to load course content. Please try again later.");
    } finally {
      setContentLoading(false);
    }
  };

  // --- Helper Functions ---

  const getStatus = (courseId) => {
    const found = enrollments.find((enr) => enr.courseId === courseId || enr.courseId?._id === courseId);
    return found ? found.status : "not_enrolled";
  };

  const isApproved = () => {
    if (!activeCourse) return false;
    return getStatus(activeCourse._id) === "approved";
  };

  const handleEnroll = async (course) => {
    try {
      setLoading(prev => ({ ...prev, [course._id]: true }));
      setError(null);
      const status = getStatus(course._id);

      if (status !== "not_enrolled") {
        alert("Already enrolled or awaiting approval!");
        return;
      }

      const confirmPayment = window.confirm(`💳 Dummy Payment Simulation\n\nCourse: ${course.title}\nAmount: ₹499\n\nClick OK to simulate success.`);
      if (!confirmPayment) return;

      const fakePaymentId = "pay_dummy_" + Math.random().toString(36).substring(2, 8);

      console.log("User ID:", user._id, "Course ID:", course._id);
      
      if (!user?._id || !course?._id) {
        setError("User ID or Course ID is missing. Cannot enroll. Please refresh the page and try again.");
        setLoading(prev => ({ ...prev, [course._id]: false }));
        return;
      }

      const res = await axios.post(`${backendURL}/api/enrollments`, {
        userId: user._id,
        courseId: course._id,
        userName: user.name,
        courseTitle: course.title,
        paymentId: fakePaymentId,
        status: "pending",
      });

      if (res.data.success) {
        alert("Payment successful! Waiting for admin approval.");
        await fetchEnrollments();
      } else {
        setError("Error saving enrollment: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Enrollment error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred";
      setError("Server error during enrollment: " + errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, [course._id]: false }));
    }
  };

  const handleSectionClick = (sectionId) => {
    if (sectionId === "dashboard") { 
      setActiveSection(sectionId); 
      return; 
    }
    if (!isApproved()) { 
      alert("Please complete payment and wait for admin approval to access this content."); 
      return; 
    }
    setActiveSection(sectionId);
  };

  const markSectionComplete = (section) => {
    setCompletedSections(prev => ({ ...prev, [section]: true }));
  };

  // Add logout function with confirmation alert
  const handleLogout = () => {
    // Show confirmation alert
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      // Clear user data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("completedSections");
      
      // Show success message
      alert("Logout successful! Redirecting to home page...");
      
      // Navigate to home page
      navigate("/");
    }
  };

  const navItems = [
    { id: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { id: "videos", icon: <FaVideo />, label: "Videos" },
    { id: "notes", icon: <FaStickyNote />, label: "Notes" },
    { id: "assignments", icon: <FaBookOpen />, label: "Assignments" },
    { id: "quiz", icon: <FaQuestionCircle />, label: "Quiz" },
    { id: "certificate", icon: <FaCertificate />, label: "Certificate" },
    { id: "reviews", icon: <FaCommentDots />, label: "Reviews" },
  ];

  return (
    <div className="user-dashboard">
      {error && (
        <div className="error-notification">
          <span>{error}</span>
          <button onClick={() => setError(null)}><FaTimes /></button>
        </div>
      )}

      <motion.aside 
        className={`sidebar ${sidebarOpen ? "open" : "closed"}`} 
        initial={{ x: -200 }} 
        animate={{ x: sidebarOpen ? 0 : -180 }} 
        transition={{ duration: 0.4 }}
      >
        <div className="sidebar-header">
          <h2>Clinigoal</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
        </div>
        <nav className="nav-menu">
          {navItems.map((item) => {
            const isLocked = item.id !== "dashboard" && (!activeCourse || !isApproved());
            return (
              <button 
                key={item.id} 
                className={activeSection === item.id ? "active" : ""} 
                onClick={() => handleSectionClick(item.id)} 
                title={isLocked ? "Content locked until approval" : item.label}
              >
                {item.icon}
                {sidebarOpen && item.label}
                {isLocked && <span className="lock-icon"><FaLock /></span>}
              </button>
            );
          })}
          <button onClick={handleLogout}>
            <FaSignOutAlt /> {sidebarOpen && "Logout"}
          </button>
        </nav>
      </motion.aside>

      <main className="dashboard-content">
        {activeSection === "dashboard" && (
          <>
            <h2>🎓 Available Courses</h2>
            {courses.length === 0 ? (
              <p>No courses available yet.</p>
            ) : (
              <div className="course-grid">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    status={getStatus(course._id)}
                    isLoading={loading[course._id]}
                    onEnroll={() => handleEnroll(course)}
                    onContinue={() => { setActiveCourse(course); setActiveSection("videos"); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === "videos" && (
          <div className="section-card">
            {isApproved() ? (
              <>
                <h3>🎬 {activeCourse?.title} - Videos</h3>
                {contentLoading ? (
                  <div className="content-loading"><p>Loading videos...</p></div>
                ) : contentError ? (
                  <div className="error-message"><p>{contentError}</p></div>
                ) : videos.length === 0 ? (
                  <div className="no-content"><p>No videos available for this course yet.</p></div>
                ) : (
                  <div className="video-list">
                    {videos.map((video) => (
                      <div key={video._id} className="video-item">
                        <h4>{video.title}</h4>
                        <video controls width="100%">
                          <source src={`${backendURL}/${video.videoPath}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { markSectionComplete("videos"); setActiveSection("notes"); }} className="unlock-btn">
                  ✅ Mark Videos Complete
                </button>
              </>
            ) : (
              <LockedContent section="Videos" onBackToDashboard={() => setActiveSection("dashboard")} />
            )}
          </div>
        )}

        {activeSection === "notes" && (
          <div className="section-card">
            {isApproved() ? (
              <>
                <h3>📝 {activeCourse?.title} - Notes</h3>
                {contentLoading ? (
                  <div className="content-loading"><p>Loading notes...</p></div>
                ) : contentError ? (
                  <div className="error-message"><p>{contentError}</p></div>
                ) : notes.length === 0 ? (
                  <div className="no-content"><p>No notes available for this course yet.</p></div>
                ) : (
                  <div className="notes-list">
                    {notes.map((note) => (
                      <div key={note._id} className="note-item">
                        <h4>{note.title}</h4>
                        <div className="note-actions">
                          <a href={`${backendURL}/${note.notePath}`} target="_blank" rel="noopener noreferrer" className="view-note-btn">
                            <FaFilePdf /> View
                          </a>
                          <a href={`${backendURL}/${note.notePath}`} download className="download-note-btn">
                            <FaDownload /> Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { markSectionComplete("notes"); setActiveSection("assignments"); }} className="unlock-btn">
                  ✅ Done Reading Notes
                </button>
              </>
            ) : (
              <LockedContent section="Notes" onBackToDashboard={() => setActiveSection("dashboard")} />
            )}
          </div>
        )}

        {activeSection === "assignments" && (
          <div className="section-card">
            {isApproved() ? (
              <>
                <h3>📘 {activeCourse?.title} - Assignments</h3>
                <AssignmentComponent onAssignmentComplete={() => {
                 markSectionComplete("assignments");
                 setActiveSection("quiz");
              }} />
              </> 
            ) : (
              <LockedContent section="Assignments" onBackToDashboard={() => setActiveSection("dashboard")} />
            )}
          </div>
        )}

        {activeSection === "quiz" && (
          <div className="section-card">
            {isApproved() ? (
              <>
                <h3>❓ {activeCourse?.title} - Quiz</h3>
                {contentLoading ? (
                  <div className="content-loading"><p>Loading quiz...</p></div>
                ) : contentError ? (
                  <div className="error-message"><p>{contentError}</p></div>
                ) : quizzes.length === 0 ? (
                  <div className="no-content"><p>No quiz available for this course yet.</p></div>
                ) : (
                  <QuizComponent 
                    quizzes={quizzes} 
                    onQuizComplete={() => {
                      markSectionComplete("quiz");
                      setActiveSection("certificate");
                    }} 
                  />
                )}
              </>
            ) : (
              <LockedContent section="Quiz" onBackToDashboard={() => setActiveSection("dashboard")} />
            )}
          </div>
        )}

        {activeSection === "certificate" && (
          <div className="section-card">
            {isApproved() ? (
              <>
                <h3>🏅 Certificate of Completion</h3>
                <CertificateComponent 
                  course={activeCourse} 
                  userName={user.name} 
                  completedSections={completedSections}
                />
              </>
            ) : (
              <LockedContent 
                section="Certificate" 
                progress={completedSections} 
                onBackToDashboard={() => setActiveSection("dashboard")} 
              />
            )}
          </div>
        )}

        {activeSection === "reviews" && (
          <div className="section-card">
            {isApproved() ? (
              <>
                <h3>💬 Course Review</h3>
                <ReviewComponent 
                  course={activeCourse} 
                  user={user} 
                />
              </>
            ) : (
              <LockedContent section="Review" onBackToDashboard={() => setActiveSection("dashboard")} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;