import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

type Session = {
  id: string;
  requestId: string;
  teacherId: string;
  learnerId: string;
  teacherName: string;
  learnerName: string;
  skillId: string;
  skillName: string;
  type: "online" | "offline";
  meetingLink?: string;
  location?: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
};

type SessionsResponse = {
  sessions?: Session[];
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<SessionsResponse>(
          "/users/sessions"
        );

        setSessions(response.data.sessions ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load session data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const now = new Date();

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status === "scheduled" &&
          new Date(session.scheduledAt).getTime() >= now.getTime()
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime()
      );
  }, [sessions]);

  const completedSessions = useMemo(() => {
    return sessions
      .filter((session) => session.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime()
      );
  }, [sessions]);

  const cancelledSessions = useMemo(() => {
    return sessions
      .filter((session) => session.status === "cancelled")
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime()
      );
  }, [sessions]);

  const nextSession = upcomingSessions[0];

  const getRole = (session: Session) => {
    if (!currentUser) {
      return "Participant";
    }

    if (session.teacherId === currentUser.uid) {
      return "Teacher";
    }

    if (session.learnerId === currentUser.uid) {
      return "Learner";
    }

    return "Participant";
  };

  const getOtherParticipant = (session: Session) => {
    if (!currentUser) {
      return "Participant";
    }

    if (session.teacherId === currentUser.uid) {
      return session.learnerName;
    }

    if (session.learnerId === currentUser.uid) {
      return session.teacherName;
    }

    return "Participant";
  };

  const sessionHistory = useMemo(() => {
    return [...completedSessions, ...cancelledSessions]
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime()
      )
      .slice(0, 5);
  }, [completedSessions, cancelledSessions]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Manage your skill exchange activity.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/sessions")}
        >
          View Sessions
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>

          <div>
            <p>Upcoming Sessions</p>
            <h2>{loading ? "—" : upcomingSessions.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>

          <div>
            <p>Completed Sessions</p>
            <h2>{loading ? "—" : completedSessions.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>

          <div>
            <p>Cancelled Sessions</p>
            <h2>{loading ? "—" : cancelledSessions.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>

          <div>
            <p>Total Sessions</p>
            <h2>{loading ? "—" : sessions.length}</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>Next Session</h2>
            <p>Your nearest scheduled skill exchange.</p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            Loading session...
          </div>
        ) : nextSession ? (
          <div className="next-session-card">
            <div className="next-session-main">
              <span className="session-status upcoming-status">
                Scheduled
              </span>

              <h3>{nextSession.skillName}</h3>

              <p className="session-date-text">
                {formatDateTime(nextSession.scheduledAt)}
              </p>

              <div className="next-session-details">
                <span>
                  <strong>Role:</strong> {getRole(nextSession)}
                </span>

                <span>
                  <strong>With:</strong>{" "}
                  {getOtherParticipant(nextSession)}
                </span>

                <span>
                  <strong>Duration:</strong>{" "}
                  {nextSession.duration} minutes
                </span>

                <span>
                  <strong>Mode:</strong>{" "}
                  {nextSession.type === "online"
                    ? "Online"
                    : "Offline"}
                </span>
              </div>

              {nextSession.type === "online" ? (
                nextSession.meetingLink ? (
                  <a
                    href={nextSession.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="session-link"
                  >
                    Join Meeting →
                  </a>
                ) : (
                  <p className="session-detail-note">
                    Meeting link not available.
                  </p>
                )
              ) : (
                <p className="session-detail-note">
                  <strong>Location:</strong>{" "}
                  {nextSession.location || "Not provided"}
                </p>
              )}
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/sessions")}
            >
              View Details
            </button>
          </div>
        ) : (
          <div className="dashboard-empty">
            <h3>No upcoming sessions</h3>

            <p>
              Schedule a session from one of your accepted
              exchange requests.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/sessions")}
            >
              Go to Sessions
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>Session History</h2>
            <p>Your recent completed and cancelled sessions.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/sessions")}
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            Loading session history...
          </div>
        ) : sessionHistory.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No session history</h3>

            <p>
              Completed and cancelled sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="session-history-list">
            {sessionHistory.map((session) => (
              <div
                className="session-history-card"
                key={session.id}
              >
                <div className="session-history-main">
                  <span
                    className={`session-status ${
                      session.status === "completed"
                        ? "completed-status"
                        : "cancelled-status"
                    }`}
                  >
                    {session.status}
                  </span>

                  <h3>{session.skillName}</h3>

                  <p>
                    {formatDateTime(session.scheduledAt)}
                  </p>

                  <p>
                    {session.type === "online"
                      ? "Online"
                      : "Offline"}{" "}
                    · {session.duration} minutes
                  </p>
                </div>

                <div className="session-history-participant">
                  <span>Your role</span>
                  <strong>{getRole(session)}</strong>

                  <span>With</span>
                  <strong>{getOtherParticipant(session)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;