import { NavLink, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          Skill<span>Exchanger</span>
        </div>

        {/* Main Navigation */}
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

        {/* Bottom Navigation */}
        <div className="sidebar-bottom">

          <NavLink to="/profile" className="nav-item">
            👤
            <span>Profile</span>
          </NavLink>

          <button className="logout-button">
            🚪
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Top Bar */}
        <header className="topbar">

          <div>
            <h2>Skill Exchanger</h2>
          </div>

          <div className="topbar-right">

            <button className="notification-button">
              🔔
            </button>

            <div className="user-mini">
              <div className="user-avatar">
                S
              </div>

              <div>
                <strong>Supriya</strong>
                <small>Skill Learner</small>
              </div>
            </div>

          </div>

        </header>

        {/* Page Content */}
        <section className="page-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default DashboardLayout;