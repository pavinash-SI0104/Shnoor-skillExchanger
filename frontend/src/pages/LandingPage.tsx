import { Link } from "react-router-dom";

import {
  faGithub,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function LandingPage() {
  return (
    <div className="landing-page">
<nav
  className="landing-navbar animate-fade-down"
>
  <div className="landing-logo">
    Skill <span>Exchanger</span>
  </div>

  <div className="landing-nav-links">
    <a
      href="#home"
      className="landing-nav-link"
    >
      Home
    </a>

    <a
      href="#how-it-works"
      className="landing-nav-link"
    >
      How It Works
    </a>

    <a
      href="#features"
      className="landing-nav-link"
    >
      Features
    </a>

    <Link
      to="/login"
      className="landing-nav-link"
    >
      Login
    </Link>

    <Link
      to="/login"
      className="landing-admin-button"
    >
      Admin Login
    </Link>

    <Link
      to="/register"
      className="landing-nav-button animate-button"
    >
      Get Started
    </Link>
  </div>
</nav>

      {/* =========================
          HERO SECTION
      ========================== */}

      <section
        id="home"
        className="landing-hero"
      >
        <div
          className="landing-hero-content animate-fade-left"
        >
          <p className="landing-eyebrow">
            WELCOME TO SKILL EXCHANGER
          </p>

          <h1 className="landing-hero-title">
            Share Your Skills.
            <br />
            <span>Learn Something New.</span>
          </h1>

          <p className="landing-hero-description">
            Connect with people, exchange knowledge,
            and learn new skills. Skill Exchanger
            helps you find the right people to learn
            from and share what you know.
          </p>

          <div className="landing-hero-actions">
            <Link
              to="/register"
              className="landing-primary-button animate-button"
            >
              Get Started
            </Link>

            <a
              href="#how-it-works"
              className="landing-secondary-button animate-button"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero Visual */}

        <div
          className="landing-hero-visual hero-visual-animation"
        >
          <div className="landing-hero-visual-content">
            <div className="landing-hero-icon">
              🤝
            </div>

            <h2>
              Learn &amp; Share
            </h2>

            <p>
              Connect. Exchange. Grow.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================== */}

      <section
        id="how-it-works"
        className="landing-section animate-fade-up"
      >
        <div className="landing-section-heading">
          <h2>How It Works</h2>

          <p>
            Exchange skills in three simple steps.
          </p>
        </div>

        <div className="landing-info-grid">
          <InfoCard
            number="01"
            title="Add Your Skills"
            description="Tell the community what skills you can teach and what you want to learn."
          />

          <InfoCard
            number="02"
            title="Discover People"
            description="Find people whose skills match your learning interests."
          />

          <InfoCard
            number="03"
            title="Exchange Skills"
            description="Connect, chat, arrange sessions, and learn from each other."
          />
        </div>
      </section>

      {/* =========================
          FEATURES
      ========================== */}

      <section
        id="features"
        className="landing-section landing-section-alt animate-fade-up"
      >
        <div className="landing-section-heading">
          <h2>Everything You Need</h2>

          <p>
            Simple tools to make skill exchange
            easier.
          </p>
        </div>

        <div className="landing-feature-grid">
          <FeatureCard
            icon="🔍"
            title="Discover"
            description="Find users and skills that match your interests."
          />

          <FeatureCard
            icon="🤝"
            title="Skill Matching"
            description="Find people who can teach what you want to learn."
          />

          <FeatureCard
            icon="💬"
            title="Chat"
            description="Communicate with your matches and plan your sessions."
          />

          <FeatureCard
            icon="📅"
            title="Sessions"
            description="Organize and manage your skill-learning sessions."
          />
        </div>
      </section>

      {/* =========================
          CALL TO ACTION
      ========================== */}

      <section className="landing-cta animate-fade-up">
        <h2>
          Ready to Exchange Your Skills?
        </h2>

        <p>
          Join the community and start learning
          from others.
        </p>

        <Link
          to="/register"
          className="landing-cta-button animate-button"
        >
          Create Your Account
        </Link>
      </section>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="landing-footer animate-fade-up">
        <div className="landing-footer-grid">
          {/* BRAND */}

          <div className="landing-footer-brand">
            <h2>
              Skill
              <span>Exchanger</span>
            </h2>

            <p>
              Share your skills, learn something new,
              and connect with people who believe in
              learning together.
            </p>
          </div>

          {/* QUICK LINKS */}

          <div className="landing-footer-column">
            <h3>Quick Links</h3>

            <div className="landing-footer-links">
              <a
                href="#home"
                className="landing-footer-link"
              >
                Home
              </a>

              <a
                href="#how-it-works"
                className="landing-footer-link"
              >
                How It Works
              </a>

              <a
                href="#features"
                className="landing-footer-link"
              >
                Features
              </a>

              <Link
                to="/register"
                className="landing-footer-link"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* LEGAL */}

          <div className="landing-footer-column">
            <h3>Legal</h3>

            <div className="landing-footer-links">
              <Link
                to="/terms"
                className="landing-footer-link"
              >
                Terms &amp; Conditions
              </Link>

              <Link
                to="/privacy"
                className="landing-footer-link"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* CONNECT WITH US */}

          <div className="landing-footer-column">
            <h3>Connect With Us</h3>

            <div className="landing-social-links">
              <a
                href="mailto:priyaenjam11@gmail.com"
                aria-label="Email"
                title="Email"
                className="landing-social-link"
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>

              <a
                href="https://github.com/pavinash-SI0104/Shnoor-skillExchanger"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="landing-social-link"
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>

              <a
                href="https://www.linkedin.com/in/supriya-enjam-751758388"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="landing-social-link"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>
        </div>

        <div className="landing-footer-divider" />

        <div className="landing-footer-copyright">
          © 2026 Skill Exchanger. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================== */

function InfoCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="landing-info-card animate-card">
      <div className="landing-card-number">
        {number}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="landing-feature-card animate-card">
      <div className="landing-feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

export default LandingPage;
