import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import TestAPIButton from "../../TestAPIButton";


const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <div className="clinigoal-home">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo">
          Clinigoal<span>.</span>
        </div>

        <nav className="nav">
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#features">Features</a>
          <a href="#testimonials">Stories</a>
          <a href="#contact">Contact</a>
        </nav>

        {/* ===== DROPDOWN LOGIN MENU ===== */}
        <div
          className="dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="btn-primary dropdown-toggle">Login ▾</button>
          {dropdownOpen && (
            <motion.div
              className="dropdown-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="dropdown-item"
                onClick={() => navigate("/login/admin")}
              >
                🧑‍💼 Admin Login
              </button>
              <button
                className="dropdown-item"
                onClick={() => navigate("/login/user")}
              >
                👨‍⚕️ User Login
              </button>
            </motion.div>
          )}
        </div>
      </header>

      <br />
      <br />

      {/* ===== HERO ===== */}
      <section className="hero hero-white">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1>
            Empowering the <span>Future of Medicine</span>
          </h1>
          <br />
          <p>
            Clinigoal transforms medical education through 3D visuals,
            AI-driven learning, and real-world case simulations.
          </p>
          <motion.button
            className="btn-primary hero-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login/user")}
          >
            Explore Programs
          </motion.button>
        </motion.div>

        <motion.img
          src="https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg"
          alt="Medical Learning"
          className="hero-image"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        />

        <div className="glass-circles">
          <span className="glass blue"></span>
          <span className="glass cyan"></span>
          <span className="glass navy"></span>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="trusted-by" data-aos="fade-up">
        <h2>Trusted by Leading Medical Institutions</h2>
        <div className="trust-marquee">
          <div className="trust-track">
            {[
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST9ZjgyRYP-wbGTRs_qmfWyuItR7PiH6-dyA&s",
              "https://media.istockphoto.com/id/520691843/photo/dollar-sign-on-blue-background.jpg?s=612x612&w=0&k=20&c=ZxFJfN_Y3khK1-6UT_zvwneCo0AGCa0gua0K6qbNTwk=",
              "https://media.istockphoto.com/id/1476200876/photo/modern-stopwatch-cartoon-person-character-mascot-with-golden-medical-caduceus-symbol-3d.jpg?s=612x612&w=0&k=20&c=1RCIBPQaW-tUhn7EMRgl1LpJHDW8EHTsNwT1uYwGeTA=",
              "https://images.pexels.com/photos/33016276/pexels-photo-33016276.jpeg",
            ]
              .flatMap((logo) => Array(5).fill(logo))
              .map((logo, i) => (
                <img key={i} src={logo} alt="Trusted Partner" />
              ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="about" data-aos="fade-up">
        <h2>About Clinigoal</h2>
        <p>
          Clinigoal is an advanced online medical learning ecosystem that
          bridges the gap between theory and clinical practice. Our mission is
          to train healthcare professionals through immersive, visual, and
          interactive learning experiences.
        </p>
      </section>

      {/* ===== COURSES ===== */}
      <section id="courses" className="courses" data-aos="fade-up">
        <h2>Courses & Learning Paths</h2>
        <div className="course-grid">
          {[
            "BioInformatics",
            "Medical Coding",
            "Pharmainfomatics",
            "Clinical course",
          ].map((title, i) => (
            <motion.div
              key={i}
              className="course-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h3>{title}</h3>
              <p>
                Structured modules designed to enhance medical understanding
                using interactive 3D visuals and assessments.
              </p>
              <button
                className="btn-outline"
                onClick={() => navigate("/login/user")}
              >
                Learn More
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="features" data-aos="fade-up">
        <h2>Platform Features</h2>
        <div className="feature-grid">
          <div className="feature">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
              alt="AI"
            />
            <h4>AI-Guided Study</h4>
            <p>Smart recommendations based on your learning progress.</p>
          </div>
          <div className="feature">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2909/2909769.png"
              alt="3D"
            />
            <h4>3D Anatomy Models</h4>
            <p>
              Visualize the human body like never before with interactive 3D
              models.
            </p>
          </div>
          <div className="feature">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Assessments"
            />
            <h4>Interactive Assessments</h4>
            <p>
              Engaging case studies and challenges to test your expertise.
            </p>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="testimonials" data-aos="fade-up">
        <h2>What Students Say</h2>
        <div className="testimonial-slider">
          <motion.div className="testimonial-card" whileHover={{ scale: 1.02 }}>
            <p>
              “Clinigoal changed the way I study. Visuals made everything so
              much easier to understand!”
            </p>
            <h4>– Aisha Khan</h4>
          </motion.div>
          <motion.div className="testimonial-card" whileHover={{ scale: 1.02 }}>
            <p>
              “I never thought online medical learning could be this engaging
              and practical.”
            </p>
            <h4>– Rahul Sharma</h4>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="contact" data-aos="fade-up">
        <h2>Contact Us</h2>
        <p>Reach out for partnerships, support, or course inquiries.</p>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" required></textarea>
          <button className="btn-primary">Send Message</button>
        </form>
      </section>


<TestAPIButton />

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-section">
          <h3>About Clinigoal</h3>
          <p>
            Clinigoal revolutionizes medical education through AI-driven
            courses, immersive visuals, and expert mentorship.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>Email: support@clinigoal.com</p>
          <p>Phone: +91 98765 43210</p>
          <div className="social-icons">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-linkedin-in"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Clinigoal — Transforming Medical Education</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
