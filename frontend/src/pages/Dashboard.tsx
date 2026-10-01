function Dashboard() {
  return (
    <div>

      <div className="page-heading">
        <div>
          <h1>Welcome back, Supriya 👋</h1>
          <p>Here's what's happening with your skill exchange.</p>
        </div>

        <button className="primary-button">
          + Add Skill
        </button>
      </div>

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <p>Skills I Teach</p>
            <h2>5</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <p>Skills I Learn</p>
            <h2>3</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div>
            <p>Active Matches</p>
            <h2>4</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div>
            <p>Upcoming Sessions</p>
            <h2>2</h2>
          </div>
        </div>

      </div>

      {/* Main dashboard sections */}

      <div className="dashboard-grid">

        {/* Upcoming Sessions */}

        <div className="dashboard-card">

          <div className="card-header">
            <h3>Upcoming Sessions</h3>
            <a href="/sessions">View all</a>
          </div>

          <div className="session-item">

            <div className="session-icon">
              🐍
            </div>

            <div className="session-info">
              <strong>Python Learning Session</strong>
              <span>With Avinash</span>
              <small>Tomorrow • 5:00 PM</small>
            </div>

            <button className="small-button">
              Join
            </button>

          </div>

          <div className="session-item">

            <div className="session-icon">
              ⚛️
            </div>

            <div className="session-info">
              <strong>React Session</strong>
              <span>With Rahul</span>
              <small>12 Oct • 6:00 PM</small>
            </div>

            <button className="small-button">
              View
            </button>

          </div>

        </div>

        {/* Recent Requests */}

        <div className="dashboard-card">

          <div className="card-header">
            <h3>Recent Requests</h3>
            <a href="/requests">View all</a>
          </div>

          <div className="request-item">

            <div className="user-avatar">
              A
            </div>

            <div className="request-info">
              <strong>Avinash</strong>
              <span>Wants to learn Python</span>
            </div>

            <span className="status pending">
              Pending
            </span>

          </div>

          <div className="request-item">

            <div className="user-avatar">
              R
            </div>

            <div className="request-info">
              <strong>Rahul</strong>
              <span>Wants to learn SQL</span>
            </div>

            <span className="status accepted">
              Accepted
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;