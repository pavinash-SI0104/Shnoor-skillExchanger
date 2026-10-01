import { useEffect, useState } from "react";
import { auth } from "../config/firebase";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  interests?: string[];
  expertiseLevel?: string;
  skillsToTeach?: any[];
  skillsToLearn?: any[];
}

function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [skillsToTeach, setSkillsToTeach] = useState(0);
  const [skillsToLearn, setSkillsToLearn] = useState(0);

  const [loading, setLoading] = useState(true);

  const [upcomingSessions] = useState<any[]>([]);
  const [recentRequests] = useState<any[]>([]);

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.log("No logged-in user");
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();

      // ------------------------------------------
      // GET USER PROFILE
      // ------------------------------------------

      const profileResponse = await fetch(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message ||
            "Failed to load user profile"
        );
      }

      setUser(profileData.user);

      // ------------------------------------------
      // GET USER SKILLS
      // ------------------------------------------

      const skillsResponse = await fetch(
        "http://localhost:5000/api/users/skills",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const skillsData = await skillsResponse.json();

      if (!skillsResponse.ok) {
        throw new Error(
          skillsData.message ||
            "Failed to load skills"
        );
      }

      setSkillsToTeach(
        skillsData.skillsToTeach?.length || 0
      );

      setSkillsToLearn(
        skillsData.skillsToLearn?.length || 0
      );

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Loading dashboard...</h1>
            <p>
              Fetching your skill exchange data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // USER NAME
  // ==========================================

  const userName =
    user?.name ||
    auth.currentUser?.displayName ||
    "User";

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div>

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-heading">

        <div>

          <h1>
            Welcome back, {userName} 👋
          </h1>

          <p>
            Here's what's happening with
            your skill exchange.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() => {
            window.location.href =
              "/my-skills";
          }}
        >
          + Add Skill
        </button>

      </div>

      {/* ======================================
          STAT CARDS
      ====================================== */}

      <div className="stats-grid">

        {/* Skills I Teach */}

        <div className="stat-card">

          <div className="stat-icon">
            ⭐
          </div>

          <div>
            <p>Skills I Teach</p>

            <h2>
              {skillsToTeach}
            </h2>
          </div>

        </div>

        {/* Skills I Learn */}

        <div className="stat-card">

          <div className="stat-icon">
            📚
          </div>

          <div>
            <p>Skills I Learn</p>

            <h2>
              {skillsToLearn}
            </h2>
          </div>

        </div>

        {/* Active Matches */}

        <div className="stat-card">

          <div className="stat-icon">
            🤝
          </div>

          <div>
            <p>Active Matches</p>

            <h2>
              0
            </h2>
          </div>

        </div>

        {/* Upcoming Sessions */}

        <div className="stat-card">

          <div className="stat-icon">
            📅
          </div>

          <div>
            <p>Upcoming Sessions</p>

            <h2>
              {upcomingSessions.length}
            </h2>
          </div>

        </div>

      </div>

      {/* ======================================
          DASHBOARD CONTENT
      ====================================== */}

      <div className="dashboard-grid">

        {/* ====================================
            UPCOMING SESSIONS
        ==================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <h3>
              Upcoming Sessions
            </h3>

            <a href="/sessions">
              View all
            </a>

          </div>

          {upcomingSessions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                📅
              </div>

              <strong>
                No upcoming sessions
              </strong>

              <span>
                Your scheduled skill exchange
                sessions will appear here.
              </span>

            </div>

          ) : (

            upcomingSessions.map(
              (session, index) => (
                <div
                  className="session-item"
                  key={session.id || index}
                >

                  <div className="session-icon">
                    📚
                  </div>

                  <div className="session-info">

                    <strong>
                      {session.title}
                    </strong>

                    <span>
                      With {session.partnerName}
                    </span>

                    <small>
                      {session.date} •{" "}
                      {session.time}
                    </small>

                  </div>

                  <button className="small-button">
                    View
                  </button>

                </div>
              )
            )

          )}

        </div>

        {/* ====================================
            RECENT REQUESTS
        ==================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <h3>
              Recent Requests
            </h3>

            <a href="/requests">
              View all
            </a>

          </div>

          {recentRequests.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                🤝
              </div>

              <strong>
                No requests yet
              </strong>

              <span>
                Requests you send or receive
                will appear here.
              </span>

            </div>

          ) : (

            recentRequests.map(
              (request, index) => (
                <div
                  className="request-item"
                  key={request.id || index}
                >

                  <div className="user-avatar">
                    {request.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="request-info">

                    <strong>
                      {request.name}
                    </strong>

                    <span>
                      {request.message}
                    </span>

                  </div>

                  <span
                    className={`status ${request.status}`}
                  >
                    {request.status}
                  </span>

                </div>
              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;