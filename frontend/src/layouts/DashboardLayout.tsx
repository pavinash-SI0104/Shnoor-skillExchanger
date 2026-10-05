
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

function DashboardLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "User";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="dashboard-layout">

      {/* ================================
          SIDEBAR
      ================================= */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          Skill<span>Exchanger</span>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/dashboard" className="nav-item">
            🏠
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/discover" className="nav-item">
            🔍
            <span>Discover</span>
          </NavLink>

          <NavLink to="/skills" className="nav-item">
            ⭐
            <span>My Skills</span>
          </NavLink>

          <NavLink to="/matches" className="nav-item">
            🤝
            <span>Matches</span>
          </NavLink>

          <NavLink to="/requests" className="nav-item">
            📩
            <span>Requests</span>
          </NavLink>

          <NavLink to="/chat" className="nav-item">
            💬
            <span>Chat</span>
          </NavLink>

          <NavLink to="/sessions" className="nav-item">
            📅
            <span>Sessions</span>
          </NavLink>

          <NavLink to="/wishlist" className="nav-item">
            ❤️
            <span>Wishlist</span>
          </NavLink>

          <NavLink to="/notifications" className="nav-item">
            🔔
            <span>Notifications</span>
          </NavLink>

        </nav>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">

          <NavLink to="/profile" className="nav-item">
            👤
            <span>Profile</span>
          </NavLink>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            🚪
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* ================================
          MAIN CONTENT
      ================================= */}
      <main className="main-content">

        {/* ================================
            TOP BAR
        ================================= */}
        <header className="topbar">

          <div className="topbar-title">
            <h2>Skill Exchanger</h2>
          </div>

          <div className="topbar-right">

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              type="button"
              className="notification-button"
              aria-label="Open notifications"
              title="Notifications"
              onClick={() => navigate("/notifications")}
            >
              🔔
            </button>

            {/* User Information */}
            <div className="user-mini">

              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="user-mini-info">
                <strong>{userName}</strong>
                <small>Skill Learner</small>
              </div>

            </div>

          </div>

        </header>

        {/* ================================
            PAGE CONTENT
        ================================= */}
        <section className="page-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default DashboardLayout;
