import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0);

  const [localUserPhoto, setLocalUserPhoto] =
    useState("");

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "User";

  /*
   * ================================
   * LOAD USER PROFILE PHOTO
   * ================================
   */

  useEffect(() => {
    if (!currentUser) {
      setLocalUserPhoto("");
      return;
    }

    const storageKey =
      `skill-exchanger-profile-photo-${currentUser.uid}`;

    const savedPhoto =
      localStorage.getItem(storageKey) || "";

    setLocalUserPhoto(savedPhoto);
  }, [currentUser]);

  /*
   * ================================
   * USER PHOTO
   * ================================
   */

  const userPhoto =
    localUserPhoto ||
    currentUser?.photoURL ||
    "";

  /*
   * ================================
   * LOAD UNREAD NOTIFICATION COUNT
   * ================================
   */

  const loadUnreadNotificationCount =
    async () => {
      if (!currentUser) {
        setUnreadNotificationCount(0);
        return;
      }

      try {
        const token =
          await currentUser.getIdToken();

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api"
          }/users/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load notification count"
          );
        }

        const data =
          await response.json();

        setUnreadNotificationCount(
          typeof data.count === "number"
            ? data.count
            : 0
        );
      } catch (error) {
        console.error(
          "Failed to load unread notification count:",
          error
        );
      }
    };

  /*
   * ================================
   * NOTIFICATION COUNT
   * ================================
   */

  useEffect(() => {
    void loadUnreadNotificationCount();

    const interval =
      window.setInterval(() => {
        void loadUnreadNotificationCount();
      }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentUser]);

  /*
   * Refresh immediately when the user
   * returns to the browser/tab.
   */

  useEffect(() => {
    const handleFocus = () => {
      void loadUnreadNotificationCount();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [currentUser]);

  /*
   * ================================
   * LOGOUT
   * ================================
   */

  const handleLogout = async () => {
    try {
      sessionStorage.setItem("session-expired", "true");
      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  /*
   * ================================
   * NAVIGATION
   * ================================
   */

  const navClassName = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `nav-item ${
      isActive ? "active" : ""
    }`;

  /*
   * ================================
   * LAYOUT
   * ================================
   */

  return (
    <div className="dashboard-layout">
      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-logo">
          Skill<span>Exchanger</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={navClassName}
          >
            <span className="nav-icon">
              🏠
            </span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/discover"
            className={navClassName}
          >
            <span className="nav-icon">
              🔍
            </span>
            <span>Discover</span>
          </NavLink>

          <NavLink
            to="/skills"
            className={navClassName}
          >
            <span className="nav-icon">
              ⭐
            </span>
            <span>My Skills</span>
          </NavLink>

          <NavLink
            to="/matches"
            className={navClassName}
          >
            <span className="nav-icon">
              🤝
            </span>
            <span>Matches</span>
          </NavLink>

          <NavLink
            to="/requests"
            className={navClassName}
          >
            <span className="nav-icon">
              📩
            </span>
            <span>Requests</span>
          </NavLink>

          <NavLink
            to="/chat"
            className={navClassName}
          >
            <span className="nav-icon">
              💬
            </span>
            <span>Chat</span>
          </NavLink>

          <NavLink
            to="/sessions"
            className={navClassName}
          >
            <span className="nav-icon">
              📅
            </span>
            <span>Sessions</span>
          </NavLink>

          <NavLink
            to="/wishlist"
            className={navClassName}
          >
            <span className="nav-icon">
              ❤️
            </span>
            <span>Wishlist</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={navClassName}
          >
            <span className="nav-icon">
              🔔
            </span>

            <span>
              Notifications
            </span>

            {unreadNotificationCount >
              0 && (
              <span className="sidebar-notification-badge">
                {unreadNotificationCount >
                99
                  ? "99+"
                  : unreadNotificationCount}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/profile"
            className={navClassName}
          >
            <span className="nav-icon">
              👤
            </span>

            <span>Profile</span>
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

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

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
                Skill Exchanger
              </h2>
            </div>
          </div>

          <div className="topbar-right">
            {/* ==================================
                NOTIFICATIONS
            ================================== */}

            <button
              type="button"
              className="notification-button"
              aria-label={
                unreadNotificationCount >
                0
                  ? `${unreadNotificationCount} unread notifications`
                  : "No unread notifications"
              }
              title="Notifications"
              onClick={() =>
                navigate(
                  "/notifications"
                )
              }
            >
              <span className="notification-bell">
                🔔
              </span>

              {unreadNotificationCount >
                0 && (
                <span className="notification-badge">
                  {unreadNotificationCount >
                  99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* ==================================
                USER
            ================================== */}

            <button
              type="button"
              className="user-mini"
              onClick={() =>
                navigate("/profile")
              }
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
                <strong>
                  {userName}
                </strong>

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
