import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

function DashboardLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "User";

  const userPhoto = currentUser?.photoURL || "";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-item ${isActive ? "active" : ""}`;

  return (
    <div className="dashboard-layout">
      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          Skill<span>Exchanger</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={navClassName}>
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/discover" className={navClassName}>
            <span className="nav-icon">🔍</span>
            <span>Discover</span>
          </NavLink>

          <NavLink to="/skills" className={navClassName}>
            <span className="nav-icon">⭐</span>
            <span>My Skills</span>
          </NavLink>

          <NavLink to="/matches" className={navClassName}>
            <span className="nav-icon">🤝</span>
            <span>Matches</span>
          </NavLink>

          <NavLink to="/requests" className={navClassName}>
            <span className="nav-icon">📩</span>
            <span>Requests</span>
          </NavLink>

          <NavLink to="/chat" className={navClassName}>
            <span className="nav-icon">💬</span>
            <span>Chat</span>
          </NavLink>

          <NavLink to="/sessions" className={navClassName}>
            <span className="nav-icon">📅</span>
            <span>Sessions</span>
          </NavLink>

          <NavLink to="/wishlist" className={navClassName}>
            <span className="nav-icon">❤️</span>
            <span>Wishlist</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={navClassName}
          >
            <span className="nav-icon">🔔</span>
            <span>Notifications</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/profile" className={navClassName}>
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </NavLink>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">
        <header className="topbar">
          {/* Left */}

          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label={
                sidebarOpen
                  ? "Collapse sidebar"
                  : "Open sidebar"
              }
              title={
                sidebarOpen
                  ? "Collapse sidebar"
                  : "Open sidebar"
              }
              onClick={() =>
                setSidebarOpen(
                  (previous) => !previous
                )
              }
            >
              ☰
            </button>

            <div className="topbar-title">
              <h2>Skill Exchanger</h2>
            </div>
          </div>

          {/* Right */}

          <div className="topbar-right">
            <ThemeToggle />

            <button
              type="button"
              className="notification-button"
              aria-label="Open notifications"
              title="Notifications"
              onClick={() =>
                navigate("/notifications")
              }
            >
              🔔
            </button>

            <button
              type="button"
              className="user-mini"
              onClick={() => navigate("/profile")}
              aria-label="Open profile"
              title="Open profile"
            >
              <div className="user-avatar">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={`${userName}'s profile`}
                  />
                ) : (
                  userName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="user-mini-info">
                <strong>{userName}</strong>

                <small>
                  Skill Learner
                </small>
              </div>
            </button>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
