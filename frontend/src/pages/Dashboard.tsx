import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

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

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<SessionsResponse>("/users/sessions");

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
    return session.teacherId === session.learnerId
      ? "Participant"
      : session.teacherId
        ? "Teacher/Learner"
        : "Participant";
  };

  const getOtherParticipant = (session: Session) => {
    return session.teacherId === session.learnerId
      ? session.teacherName
      : session.teacherName || session.learnerName;
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Manage your skill exchange activity.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Upcoming Sessions</span>
          <strong>
            {loading ? "—" : upcomingSessions.length}
          </strong>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Completed Sessions</span>
          <strong>
            {loading ? "—" : completedSessions.length}
          </strong>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Cancelled Sessions</span>
          <strong>
            {loading ? "—" : cancelledSessions.length}
          </strong>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>Next Session</h2>
            <p>Your nearest scheduled skill exchange.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/sessions")}
          >
            View All Sessions
          </button>
        </div>

        {loading ? (
          <div className="dashboard-empty">Loading session...</div>
        ) : nextSession ? (
          <div className="next-session-card">
            <div className="next-session-main">
              <span className="session-status scheduled">
                Scheduled
              </span>

              <h3>{nextSession.skillName}</h3>

              <p className="session-date">
                {formatDateTime(nextSession.scheduledAt)}
              </p>

              <p>
                Duration: <strong>{nextSession.duration} minutes</strong>
              </p>

              <p>
                Mode:{" "}
                <strong>
                  {nextSession.type === "online"
                    ? "Online"
                    : "Offline"}
                </strong>
              </p>

              <p>
                Role: <strong>{getRole(nextSession)}</strong>
              </p>

              <p>
                With: <strong>{getOtherParticipant(nextSession)}</strong>
              </p>

              <p>
                {nextSession.type === "online"
                  ? `Teacher: ${nextSession.teacherName}`
                  : `Location: ${nextSession.location || "Not provided"}`}
              </p>
            </div>

            <div className="next-session-action">
              {nextSession.type === "online" &&
              nextSession.meetingLink ? (
                <a
                  href={nextSession.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button"
                >
                  Join Meeting
                </a>
              ) : (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/sessions")}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-empty">
            <h3>No upcoming sessions</h3>
            <p>
              Schedule a session from your accepted skill exchange
              requests.
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
            <p>Your recently completed or cancelled exchanges.</p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            Loading session history...
          </div>
        ) : completedSessions.length === 0 &&
          cancelledSessions.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No session history</h3>
            <p>
              Completed and cancelled sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="session-history-list">
            {[
              ...completedSessions,
              ...cancelledSessions,
            ]
              .sort(
                (a, b) =>
                  new Date(b.scheduledAt).getTime() -
                  new Date(a.scheduledAt).getTime()
              )
              .slice(0, 5)
              .map((session) => (
                <div
                  className="session-history-card"
                  key={session.id}
                >
                  <div>
                    <span
                      className={`session-status ${session.status}`}
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
                    <span>Teacher</span>
                    <strong>{session.teacherName}</strong>

                    <span>Learner</span>
                    <strong>{session.learnerName}</strong>
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