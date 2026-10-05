
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "Arial, sans-serif",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* =========================
          NAVBAR
      ========================== */}

      <nav
        className="animate-fade-down"
        style={{
          height: "70px",
          background: "var(--card-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
          borderBottom: "1px solid var(--border-color)",
          transition:
            "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}

        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--primary-color)",
          }}
        >
          Skill Exchanger
        </div>

        {/* Navigation Links */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <a href="#home" style={navLinkStyle}>
            Home
          </a>

          <a href="#how-it-works" style={navLinkStyle}>
            How It Works
          </a>

          <a href="#features" style={navLinkStyle}>
            Features
          </a>

          <Link to="/login" style={navLinkStyle}>
            Login
          </Link>

          {/* Theme Toggle */}

          <ThemeToggle />

          <Link
            to="/register"
            className="animate-button"
            style={registerButtonStyle}
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
        style={{
          minHeight: "520px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px 100px",
          background: "var(--bg-tertiary)",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Hero Text */}

        <div
          className="animate-fade-left"
          style={{
            maxWidth: "600px",
          }}
        >
          <p
            style={{
              color: "var(--primary-color)",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            WELCOME TO SKILL EXCHANGER
          </p>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: "1.1",
              color: "var(--text-primary)",
              margin: "0 0 20px",
            }}
          >
            Share Your Skills.
            <br />
            Learn Something New.
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              color: "var(--text-secondary)",
              marginBottom: "30px",
            }}
          >
            Connect with people, exchange knowledge, and learn new skills.
            Skill Exchanger helps you find the right people to learn from and
            share what you know.
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >
            <Link
              to="/register"
              className="animate-button"
              style={heroButtonStyle}
            >
              Get Started
            </Link>

            <a
              href="#how-it-works"
              className="animate-button"
              style={secondaryButtonStyle}
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero Visual */}

        <div
          className="hero-visual-animation"
          style={{
            width: "400px",
            height: "350px",
            background: "var(--card-bg)",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 50px var(--shadow-color)",
            border: "1px solid var(--border-color)",
            transition:
              "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "80px",
                marginBottom: "15px",
              }}
            >
              🤝
            </div>

            <h2
              style={{
                color: "var(--text-primary)",
                marginBottom: "10px",
              }}
            >
              Learn & Share
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
              }}
            >
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
        className="animate-fade-up"
        style={{
          padding: "80px 100px",
          background: "var(--bg-primary)",
          textAlign: "center",
          transition: "background-color 0.3s ease",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            color: "var(--text-primary)",
            marginBottom: "15px",
          }}
        >
          How It Works
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "17px",
            marginBottom: "50px",
          }}
        >
          Exchange skills in three simple steps.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
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
        className="animate-fade-up"
        style={{
          padding: "80px 100px",
          background: "var(--bg-secondary)",
          textAlign: "center",
          transition: "background-color 0.3s ease",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            color: "var(--text-primary)",
            marginBottom: "15px",
          }}
        >
          Everything You Need
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "17px",
            marginBottom: "50px",
          }}
        >
          Simple tools to make skill exchange easier.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "25px",
            flexWrap: "wrap",
          }}
        >
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

      <section
        className="animate-fade-up"
        style={{
          padding: "80px 30px",
          background: "var(--primary-color)",
          textAlign: "center",
          color: "#ffffff",
          transition: "background-color 0.3s ease",
        }}
      >
        <h2
          style={{
            fontSize: "38px",
            marginBottom: "15px",
          }}
        >
          Ready to Exchange Your Skills?
        </h2>

        <p
          style={{
            fontSize: "18px",
            marginBottom: "30px",
            opacity: 0.9,
          }}
        >
          Join the community and start learning from others.
        </p>

        <Link
          to="/register"
          className="animate-button"
          style={{
            display: "inline-block",
            padding: "14px 30px",
            background: "#ffffff",
            color: "#2563eb",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Create Your Account
        </Link>
      </section>

      {/* =========================
          FOOTER
      ========================== */}

      <footer
        className="animate-fade-up"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          padding: "50px 60px 25px",
          borderTop: "1px solid var(--border-color)",
          transition:
            "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "50px",
            flexWrap: "wrap",
          }}
        >
          {/* BRAND */}

          <div
            style={{
              maxWidth: "350px",
            }}
          >
            <h2
              style={{
                margin: "0 0 15px",
                fontSize: "24px",
                color: "var(--text-primary)",
              }}
            >
              Skill
              <span
                style={{
                  color: "var(--primary-color)",
                }}
              >
                Exchanger
              </span>
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Share your skills, learn something new, and connect with people
              who believe in learning together.
            </p>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "17px",
                color: "var(--text-primary)",
              }}
            >
              Quick Links
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <a
                href="#home"
                style={footerLinkStyle}
              >
                Home
              </a>

              <a
                href="#how-it-works"
                style={footerLinkStyle}
              >
                How It Works
              </a>

              <a
                href="#features"
                style={footerLinkStyle}
              >
                Features
              </a>

              <Link
                to="/register"
                style={footerLinkStyle}
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* LEGAL */}

          <div>
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "17px",
                color: "var(--text-primary)",
              }}
            >
              Legal
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Link
                to="/terms"
                style={footerLinkStyle}
              >
                Terms & Conditions
              </Link>

              <Link
                to="/privacy"
                style={footerLinkStyle}
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* CONNECT WITH US */}

          <div>
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "17px",
                color: "var(--text-primary)",
              }}
            >
              Connect With Us
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {/* Email */}

              <a
                href="mailto:priyaenjam11@gmail.com"
                style={footerLinkStyle}
              >
                📧 priyaenjam11@gmail.com
              </a>

              {/* GitHub */}

              <a
                href="https://github.com/pavinash-SI0104/Shnoor-skillExchanger"
                target="_blank"
                rel="noopener noreferrer"
                style={footerLinkStyle}
              >
                🐙 GitHub
              </a>

              {/* LinkedIn */}

              <a
                href="https://www.linkedin.com/in/supriya-enjam-751758388"
                target="_blank"
                rel="noopener noreferrer"
                style={footerLinkStyle}
              >
                💼 LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* DIVIDER */}

        <div
          style={{
            maxWidth: "1100px",
            margin: "40px auto 20px",
            borderTop: "1px solid var(--border-color)",
          }}
        />

        {/* COPYRIGHT */}

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            © 2026 Skill Exchanger. All rights reserved.
          </p>
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
    <div
      className="animate-card"
      style={{
        width: "280px",
        padding: "30px",
        border: "1px solid var(--border-color)",
        borderRadius: "15px",
        background: "var(--card-bg)",
        transition:
          "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "var(--primary-color)",
          marginBottom: "15px",
        }}
      >
        {number}
      </div>

      <h3
        style={{
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          lineHeight: "1.6",
        }}
      >
        {description}
      </p>
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
    <div
      className="animate-card"
      style={{
        width: "220px",
        padding: "30px 20px",
        background: "var(--card-bg)",
        borderRadius: "15px",
        border: "1px solid var(--border-color)",
        transition:
          "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          fontSize: "40px",
          marginBottom: "15px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          color: "var(--text-primary)",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================
   STYLES
========================== */

const navLinkStyle = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  fontSize: "15px",
};

const registerButtonStyle = {
  background: "var(--primary-color)",
  color: "#ffffff",
  textDecoration: "none",
  padding: "10px 20px",
  borderRadius: "7px",
  fontWeight: "bold",
};

const heroButtonStyle = {
  background: "var(--primary-color)",
  color: "#ffffff",
  textDecoration: "none",
  padding: "14px 25px",
  borderRadius: "8px",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  background: "var(--card-bg)",
  color: "var(--primary-color)",
  textDecoration: "none",
  padding: "14px 25px",
  borderRadius: "8px",
  fontWeight: "bold",
  border: "1px solid var(--border-color)",
};

const footerLinkStyle = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontSize: "14px",
};

export default LandingPage;
