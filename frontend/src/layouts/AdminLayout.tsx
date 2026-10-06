import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const adminName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Admin";

  const navClassName = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `nav-item ${
      isActive ? "active" : ""
    }`;

  const handleLogout = async () => {
    try {
      sessionStorage.setItem(
        "session-expired",
        "true"
      );

      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin logout failed:",
        error
      );
    }
  };

  return (
    <div className="dashboard-layout">
      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-logo">
          Skill<span>Exchanger</span>
        </div>

        <div
          style={{
            padding: "0 20px 16px",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Administration
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={navClassName}
          >
            <span className="nav-icon">
              📊
            </span>

            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={navClassName}
          >
            <span className="nav-icon">
              👥
            </span>

            <span>Users</span>
          </NavLink>

          <NavLink
            to="/admin/requests"
            className={navClassName}
          >
            <span className="nav-icon">
              📩
            </span>

            <span>Requests</span>
          </NavLink>

          <NavLink
            to="/admin/matches"
            className={navClassName}
          >
            <span className="nav-icon">
              🤝
            </span>

            <span>Matches</span>
          </NavLink>

          <NavLink
            to="/admin/sessions"
            className={navClassName}
          >
            <span className="nav-icon">
              📅
            </span>

            <span>Sessions</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={navClassName}
          >
            <span className="nav-icon">
              📈
            </span>

            <span>Reports</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/admin/profile"
            className={navClassName}
          >
            <span className="nav-icon">
              🏠
            </span>

            <span>Admin Profile</span>
          </NavLink>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="nav-icon">
              🚪
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
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
                  (previous) =>
                    !previous
                )
              }
            >
              ☰
            </button>

            <div className="topbar-title">
              <h2>
                Admin Panel
              </h2>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="user-mini"
              onClick={() =>
                navigate("/admin/profile")
              }
              aria-label="Open profile"
              title="Open profile"
            >
              <div className="user-avatar">
                {adminName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="user-mini-info">
                <strong>
                  {adminName}
                </strong>

                <small>
                  Administrator
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

export default AdminLayout;
