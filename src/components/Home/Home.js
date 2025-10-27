import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaAward,
  FaBook,
  FaStar,
} from "react-icons/fa";

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // ✅ Fixed navigation logic
  const handleLogin = (role) => {
    if (role === "student") {
      navigate("/login/user"); // ✅ Goes to User Login page
    } else {
      navigate("/login/admin"); // ✅ Goes to Admin Login page
    }
    setDropdownOpen(false);
  };

  return (
    <div className="clinigoal-home">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          Clinigoal<span>.</span>
        </div>

        <nav className="nav">
          <a href="#about">About</a>
          <a href="#vision">Vision</a>
          <a href="#courses">Courses</a>
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
        </nav>

        <div className="dropdown">
          <button className="btn-login" onClick={toggleDropdown}>
            Login
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => handleLogin("admin")}
              >
                Admin
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleLogin("student")}
              >
                Student
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-container" data-aos="fade-up">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Clinigoal</h1>
            <p className="hero-subtitle">
              Empowering healthcare learning with AI-driven insights, video
              tutorials, and community mentorship.
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="learn-btn"
              onClick={() => navigate("/login/user")} // ✅ Goes to User Login page
            >
              Start Learning →
            </motion.button>
          </div>

          {/* Hero image */}
          <div className="hero-image" data-aos="zoom-in">
            <img
              src="https://images.pexels.com/photos/8621905/pexels-photo-8621905.jpeg"
              alt="Clinigoal Learning"
            />
          </div>
        </div>
      </section>

      {/* ===== LEARNING QUOTE ===== */}
      <div className="learning-quote" data-aos="fade-right">
        <div className="quote-glow">
          <marquee behavior="scroll" direction="left" scrollamount="6">
            🌟 Learning is the heartbeat of growth — every lesson brings you
            closer to mastery. 🌟
          </marquee>
        </div>
      </div>

      {/* ===== ABOUT US ===== */}
      <section id="about" className="about-section" data-aos="fade-up">
        <h2>About Us</h2>
        <p className="about-desc">
          Clinigoal is a next-generation e-learning platform dedicated to
          medical and clinical education. We connect learners with expert
          mentors and provide innovative tools to help you achieve your clinical
          goals.
        </p>

        <div className="about-cards">
          <div className="about-card" data-aos="zoom-in">
            <div className="about-inner">
              <div className="about-front">
                <h3>Interactive</h3>
                <p>Learn through videos, quizzes & case studies.</p>
              </div>
              <div className="about-back">
                <p>
                  Dive into expertly designed modules that make learning
                  effective.
                </p>
              </div>
            </div>
          </div>

          <div className="about-card" data-aos="zoom-in" data-aos-delay="100">
            <div className="about-inner">
              <div className="about-front">
                <h3>Certified</h3>
                <p>Earn recognized credentials to boost your profile.</p>
              </div>
              <div className="about-back">
                <p>Every completed course provides a verified certificate.</p>
              </div>
            </div>
          </div>

          <div className="about-card" data-aos="zoom-in" data-aos-delay="200">
            <div className="about-inner">
              <div className="about-front">
                <h3>Mentor</h3>
                <p>Get advice from experienced medical professionals.</p>
              </div>
              <div className="about-back">
                <p>
                  Our mentors are real-world clinicians sharing practical
                  insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OUR VISION ===== */}
      <section id="vision" className="vision-section" data-aos="fade-up">
        <h2>Our Vision</h2>
        <p>
          To revolutionize healthcare education by integrating technology,
          personalized mentorship, and interactive learning experiences.
        </p>
      </section>

      {/* ===== OUR COURSES ===== */}
      <section id="courses" className="courses-section" data-aos="fade-up">
        <h2>Our Courses</h2>
        <p className="courses-desc">
          Explore a variety of healthcare programs tailored for your success.
        </p>
        <div className="courses-grid">
          <div className="course-card" data-aos="zoom-in">
            <h3>Clinical Anatomy</h3>
            <p>
              Master human anatomy through interactive 3D models and expert
              videos.
            </p>
          </div>

          <div className="course-card" data-aos="zoom-in" data-aos-delay="150">
            <h3>Pharmacology</h3>
            <p>Understand drug mechanisms, interactions, and therapeutic uses.</p>
          </div>

          <div className="course-card" data-aos="zoom-in" data-aos-delay="300">
            <h3>Clinical Diagnostics</h3>
            <p>
              Learn diagnostic techniques and modern lab interpretations.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="features-section" data-aos="fade-up">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <FaChartLine className="icon" />
            <h4>Progress Tracking</h4>
            <p>Monitor your learning milestones in real-time.</p>
          </div>
          <div className="feature-card">
            <FaUsers className="icon" />
            <h4>Community Learning</h4>
            <p>Engage with peers and mentors through live sessions.</p>
          </div>
          <div className="feature-card">
            <FaAward className="icon" />
            <h4>Certification</h4>
            <p>Earn globally recognized certifications after completion.</p>
          </div>
          <div className="feature-card">
            <FaBook className="icon" />
            <h4>Notes & Quizzes</h4>
            <p>Access curated materials and test your understanding.</p>
          </div>
        </div>
      </section>

      {/* ===== MOVING LINE SECTION ===== */}
      <div className="moving-line-section" data-aos="fade-right">
        <div className="moving-line-text">
          🌟 Learning never stops — at Clinigoal, every step takes you closer to
          mastery.
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <section
        id="testimonials"
        className="testimonials-section"
        data-aos="zoom-in"
      >
        <h2>Testimonials</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <FaStar color="#FFD700" />
            <p>“Clinigoal helped me to achieve my dream.”</p>
            <h4>- Nandan</h4>
          </div>
          <div className="testimonial-card">
            <FaStar color="#FFD700" />
            <p>“Clinigoal guided me through my internship with structured learning.”</p>
            <h4>- Sujal</h4>
          </div>
          <div className="testimonial-card">
            <FaStar color="#FFD700" />
            <p>“An amazing platform for medical learners and educators.”</p>
            <h4>- Shreya</h4>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3>Clinigoal</h3>
            <p>Where learning meets innovation.</p>
          </div>

          <div className="footer-col">
            <h3>Links</h3>
            <a href="#about">About</a>
            <a href="#vision">Vision</a>
            <a href="#features">Features</a>
            <a href="#courses">Courses</a>
          </div>

          <div className="footer-col">
            <h3>Address</h3>
            <p className="footer-address">📍 123 Health Avenue, Bengaluru, India</p>
            <p className="footer-phone">📞 +91 98765 43210</p>
            <p className="footer-email">✉️ support@clinigoal.com</p>
          </div>

          <div className="footer-col">
            <h3>Follow Us</h3>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
          </div>
        </div>
        <div className="footer-line"></div>
      </footer>
    </div>
  );
};

export default Home;
