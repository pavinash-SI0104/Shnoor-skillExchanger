import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* =========================
          NAVBAR
      ========================== */}

      <nav
        style={{
          height: "70px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#2563eb",
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

          <Link to="/register" style={registerButtonStyle}>
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
          background: "#eff6ff",
        }}
      >
        {/* Hero Text */}
        <div style={{ maxWidth: "600px" }}>
          <p
            style={{
              color: "#2563eb",
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
              color: "#111827",
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
              color: "#4b5563",
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
            <Link to="/register" style={heroButtonStyle}>
              Get Started
            </Link>

            <a href="#how-it-works" style={secondaryButtonStyle}>
              Learn More
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div
          style={{
            width: "400px",
            height: "350px",
            background: "#ffffff",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ textAlign: "center" }}>
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
                color: "#111827",
                marginBottom: "10px",
              }}
            >
              Learn & Share
            </h2>

            <p style={{ color: "#6b7280" }}>
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
        style={{
          padding: "80px 100px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            color: "#111827",
            marginBottom: "15px",
          }}
        >
          How It Works
        </h2>

        <p
          style={{
            color: "#6b7280",
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
        style={{
          padding: "80px 100px",
          background: "#f8fafc",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            color: "#111827",
            marginBottom: "15px",
          }}
        >
          Everything You Need
        </h2>

        <p
          style={{
            color: "#6b7280",
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
        style={{
          padding: "80px 30px",
          background: "#2563eb",
          textAlign: "center",
          color: "#ffffff",
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
        style={{
          background: "#111827",
          color: "#ffffff",
          padding: "50px 60px 25px",
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

          <div style={{ maxWidth: "350px" }}>
            <h2
              style={{
                margin: "0 0 15px",
                fontSize: "24px",
                color: "#ffffff",
              }}
            >
              Skill
              <span style={{ color: "#60a5fa" }}>
                Exchanger
              </span>
            </h2>

            <p
              style={{
                color: "#9ca3af",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Share your skills, learn something new,
              and connect with people who believe in
              learning together.
            </p>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "17px",
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
              <a href="#home" style={footerLinkStyle}>
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
            borderTop: "1px solid #374151",
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
              color: "#9ca3af",
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
      style={{
        width: "280px",
        padding: "30px",
        border: "1px solid #e5e7eb",
        borderRadius: "15px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#2563eb",
          marginBottom: "15px",
        }}
      >
        {number}
      </div>

      <h3
        style={{
          color: "#111827",
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#6b7280",
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
      style={{
        width: "220px",
        padding: "30px 20px",
        background: "#ffffff",
        borderRadius: "15px",
        border: "1px solid #e5e7eb",
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
          color: "#111827",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#6b7280",
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
  color: "#374151",
  textDecoration: "none",
  fontSize: "15px",
};

const registerButtonStyle = {
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  padding: "10px 20px",
  borderRadius: "7px",
  fontWeight: "bold",
};

const heroButtonStyle = {
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  padding: "14px 25px",
  borderRadius: "8px",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  background: "#ffffff",
  color: "#2563eb",
  textDecoration: "none",
  padding: "14px 25px",
  borderRadius: "8px",
  fontWeight: "bold",
  border: "1px solid #dbeafe",
};

const footerLinkStyle = {
  color: "#9ca3af",
  textDecoration: "none",
  fontSize: "14px",
};

export default LandingPage;