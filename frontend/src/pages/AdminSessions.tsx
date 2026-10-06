import { useEffect, useState } from "react";
import api from "../api/api";

interface AdminSession {
  id: string;
  requestId?: string;
  teacherId?: string;
  learnerId?: string;
  teacherName?: string;
  learnerName?: string;
  skillId?: string;
  skillName?: string;
  type?: string;
  meetingLink?: string;
  location?: string;
  scheduledAt?: string;
  duration?: number;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function AdminSessions() {
  const [sessions, setSessions] =
    useState<AdminSession[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/sessions");

      if (response.data?.success) {
        setSessions(
          response.data.sessions || []
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load sessions."
        );
      }
    } catch (err: any) {
      console.error(
        "Admin sessions error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  };

  const getStatusClass = (
    status?: string
  ) => {
    return `status ${
      status?.toLowerCase() || ""
    }`;
  };

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Sessions</h1>

            <p>
              Monitor scheduled skill exchange
              sessions across the platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-state">
            <strong>
              Loading sessions...
            </strong>

            <span>
              Please wait a moment.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Sessions</h1>

            <p>
              Monitor scheduled skill exchange
              sessions across the platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="error-message">
            {error}
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={loadSessions}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Sessions</h1>

          <p>
            Monitor scheduled skill exchange
            sessions across the platform.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            All Sessions
          </h3>

          <span>
            {sessions.length}{" "}
            {sessions.length === 1
              ? "session"
              : "sessions"}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              📅
            </div>

            <strong>
              No sessions scheduled
            </strong>

            <span>
              Scheduled skill exchange sessions
              will appear here.
            </span>
          </div>
        ) : (
          <div>
            {sessions.map(
              (session) => (
                <div
                  className="session-item"
                  key={session.id}
                >
                  <div className="session-icon">
                    📚
                  </div>

                  <div className="session-info">
                    <strong>
                      {session.skillName ||
                        "Unknown skill"}
                    </strong>

                    <span>
                      {session.teacherName ||
                        "Unknown teacher"}{" "}
                      →{" "}
                      {session.learnerName ||
                        "Unknown learner"}
                    </span>

                    <small>
                      {formatDate(
                        session.scheduledAt
                      )}

                      {session.duration
                        ? ` • ${session.duration} min`
                        : ""}

                      {session.type
                        ? ` • ${session.type}`
                        : ""}
                    </small>

                    {session.type ===
                      "online" &&
                      session.meetingLink && (
                        <small>
                          Online meeting scheduled
                        </small>
                      )}

                    {session.type ===
                      "offline" &&
                      session.location && (
                        <small>
                          Location:{" "}
                          {session.location}
                        </small>
                      )}
                  </div>

                  <span
                    className={getStatusClass(
                      session.status
                    )}
                  >
                    {session.status ||
                      "scheduled"}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSessions;
