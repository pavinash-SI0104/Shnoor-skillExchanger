import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

interface ExchangeRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  skillName: string;
  status: "pending" | "accepted" | "rejected";
}

interface Session {
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
}

function Sessions() {
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [type, setType] = useState<"online" | "offline">("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestsResponse, sessionsResponse] = await Promise.all([
        api.get("/users/requests"),
        api.get("/users/sessions"),
      ]);

      const sent = requestsResponse.data.sent || [];
      const received = requestsResponse.data.received || [];

      setRequests([...sent, ...received]);
      setSessions(sessionsResponse.data.sessions || []);
    } catch (err: unknown) {
      console.error("Failed to load sessions:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const acceptedRequests = useMemo(
    () => requests.filter((request) => request.status === "accepted"),
    [requests]
  );

  const scheduledSessions = useMemo(
    () => sessions.filter((session) => session.status === "scheduled"),
    [sessions]
  );

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === "completed"),
    [sessions]
  );

  const cancelledSessions = useMemo(
    () => sessions.filter((session) => session.status === "cancelled"),
    [sessions]
  );

  const getRequestLabel = (request: ExchangeRequest) => {
    return `${request.skillName} — ${request.senderName} ↔ ${request.receiverName}`;
  };

  const resetForm = () => {
    setSelectedRequestId("");
    setType("online");
    setMeetingLink("");
    setLocation("");
    setScheduledAt("");
    setDuration("60");
    setError("");
  };

  const handleScheduleSession = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedRequestId) {
      setError("Please select an accepted exchange request.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    if (type === "online" && !meetingLink.trim()) {
      setError("Please enter a meeting link for an online session.");
      return;
    }

    if (type === "offline" && !location.trim()) {
      setError("Please enter the session location.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/users/sessions", {
        requestId: selectedRequestId,
        type,
        meetingLink:
          type === "online" ? meetingLink.trim() : undefined,
        location:
          type === "offline" ? location.trim() : undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: Number(duration),
      });

      setSuccess("Session scheduled successfully.");

      resetForm();
      setShowForm(false);

      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to schedule session:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule session."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSessionStatus = async (
    sessionId: string,
    status: "completed" | "cancelled"
  ) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/users/sessions/${sessionId}`, {
        status,
      });

      setSuccess(
        status === "completed"
          ? "Session marked as completed."
          : "Session cancelled successfully."
      );

      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to update session:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update session."
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getOtherParticipant = (session: Session) => {
    const names = `${session.teacherName} and ${session.learnerName}`;
    return names;
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Sessions</h1>
          <p>Schedule and manage your skill exchange sessions.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
        >
          {showForm ? "Close" : "+ Schedule Session"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="session-summary">
        <div className="summary-card">
          <span>Upcoming Sessions</span>
          <strong>{scheduledSessions.length}</strong>
        </div>

        <div className="summary-card">
          <span>Completed Sessions</span>
          <strong>{completedSessions.length}</strong>
        </div>

        <div className="summary-card">
          <span>Total Sessions</span>
          <strong>{sessions.length}</strong>
        </div>
      </div>

      {showForm && (
        <div className="dashboard-card session-form-card">
          <div className="card-header">
            <div>
              <h2>Schedule a Session</h2>
              <p>
                Schedule a session from one of your accepted exchange
                requests.
              </p>
            </div>
          </div>

          {acceptedRequests.length === 0 ? (
            <div className="empty-sessions">
              <h3>No accepted requests</h3>
              <p>
                You need an accepted exchange request before you can
                schedule a session.
              </p>
            </div>
          ) : (
            <form onSubmit={handleScheduleSession}>
              <div className="session-form-grid">
                <div className="form-group">
                  <label htmlFor="session-request">
                    Exchange Request
                  </label>

                  <select
                    id="session-request"
                    value={selectedRequestId}
                    onChange={(event) =>
                      setSelectedRequestId(event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select an accepted request
                    </option>

                    {acceptedRequests.map((request) => (
                      <option
                        value={request.id}
                        key={request.id}
                      >
                        {getRequestLabel(request)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="session-duration">
                    Duration
                  </label>

                  <select
                    id="session-duration"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1 hour 30 minutes</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="session-date">
                    Date & Time
                  </label>

                  <input
                    id="session-date"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) =>
                      setScheduledAt(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="session-type">
                    Session Type
                  </label>

                  <select
                    id="session-type"
                    value={type}
                    onChange={(event) => {
                      const selectedType = event.target.value as
                        | "online"
                        | "offline";

                      setType(selectedType);
                      setMeetingLink("");
                      setLocation("");
                    }}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {type === "online" && (
                  <div className="form-group">
                    <label htmlFor="meeting-link">
                      Meeting Link
                    </label>

                    <input
                      id="meeting-link"
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={meetingLink}
                      onChange={(event) =>
                        setMeetingLink(event.target.value)
                      }
                      required
                    />
                  </div>
                )}

                {type === "offline" && (
                  <div className="form-group">
                    <label htmlFor="session-location">
                      Location
                    </label>

                    <input
                      id="session-location"
                      type="text"
                      placeholder="Enter meeting location"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      required
                    />
                  </div>
                )}
              </div>

              <div className="session-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating
                    ? "Scheduling..."
                    : "Schedule Session"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="dashboard-card sessions-card">
          <p>Loading sessions...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-card sessions-card">
            <div className="card-header">
              <div>
                <h2>Upcoming Sessions</h2>
                <p>Your scheduled skill exchange sessions.</p>
              </div>
            </div>

            {scheduledSessions.length === 0 ? (
              <div className="empty-sessions">
                <h3>No upcoming sessions</h3>
                <p>
                  Accepted exchange requests can be scheduled from
                  the button above.
                </p>
              </div>
            ) : (
              <div className="session-list">
                {scheduledSessions.map((session) => (
                  <div
                    className="session-item"
                    key={session.id}
                  >
                    <div className="session-date">
                      <span>
                        {new Date(
                          session.scheduledAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>

                      <strong>
                        {new Date(
                          session.scheduledAt
                        ).getDate()}
                      </strong>
                    </div>

                    <div className="session-info">
                      <h3>{session.skillName}</h3>

                      <p>
                        With{" "}
                        <strong>
                          {getOtherParticipant(session)}
                        </strong>
                      </p>

                      <div className="session-meta">
                        <span>
                          📅 {formatDate(session.scheduledAt)}
                        </span>

                        <span>
                          🕐 {formatTime(session.scheduledAt)}
                        </span>

                        <span>
                          {session.type === "online"
                            ? "💻 Online"
                            : "📍 Offline"}
                        </span>

                        <span>
                          ⏱️ {session.duration} min
                        </span>
                      </div>

                      {session.type === "online" &&
                        session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="session-link"
                          >
                            Join Meeting
                          </a>
                        )}

                      {session.type === "offline" &&
                        session.location && (
                          <p className="session-location">
                            📍 {session.location}
                          </p>
                        )}
                    </div>

                    <div className="session-status">
                      <span className="status upcoming-status">
                        Scheduled
                      </span>

                      <div className="session-actions">
                        <button
                          type="button"
                          className="accept-button"
                          onClick={() =>
                            void handleSessionStatus(
                              session.id,
                              "completed"
                            )
                          }
                        >
                          Complete
                        </button>

                        <button
                          type="button"
                          className="reject-button"
                          onClick={() =>
                            void handleSessionStatus(
                              session.id,
                              "cancelled"
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card sessions-card">
            <div className="card-header">
              <div>
                <h2>Completed Sessions</h2>
                <p>Sessions you have completed.</p>
              </div>
            </div>

            {completedSessions.length === 0 ? (
              <div className="empty-sessions">
                <h3>No completed sessions</h3>
                <p>
                  Completed sessions will appear here.
                </p>
              </div>
            ) : (
              <div className="session-list">
                {completedSessions.map((session) => (
                  <div
                    className="session-item"
                    key={session.id}
                  >
                    <div className="session-date completed-date">
                      <span>
                        {new Date(
                          session.scheduledAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>

                      <strong>
                        {new Date(
                          session.scheduledAt
                        ).getDate()}
                      </strong>
                    </div>

                    <div className="session-info">
                      <h3>{session.skillName}</h3>

                      <p>
                        With{" "}
                        <strong>
                          {getOtherParticipant(session)}
                        </strong>
                      </p>

                      <div className="session-meta">
                        <span>
                          📅 {formatDate(session.scheduledAt)}
                        </span>

                        <span>
                          🕐 {formatTime(session.scheduledAt)}
                        </span>

                        <span>
                          {session.type === "online"
                            ? "💻 Online"
                            : "📍 Offline"}
                        </span>

                        <span>
                          ⏱️ {session.duration} min
                        </span>
                      </div>
                    </div>

                    <div className="session-status">
                      <span className="status completed-status">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cancelledSessions.length > 0 && (
            <div className="dashboard-card sessions-card">
              <div className="card-header">
                <div>
                  <h2>Cancelled Sessions</h2>
                  <p>Sessions that were cancelled.</p>
                </div>
              </div>

              <div className="session-list">
                {cancelledSessions.map((session) => (
                  <div
                    className="session-item"
                    key={session.id}
                  >
                    <div className="session-date completed-date">
                      <span>
                        {new Date(
                          session.scheduledAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>

                      <strong>
                        {new Date(
                          session.scheduledAt
                        ).getDate()}
                      </strong>
                    </div>

                    <div className="session-info">
                      <h3>{session.skillName}</h3>

                      <p>
                        With{" "}
                        <strong>
                          {getOtherParticipant(session)}
                        </strong>
                      </p>

                      <div className="session-meta">
                        <span>
                          📅 {formatDate(session.scheduledAt)}
                        </span>

                        <span>
                          🕐 {formatTime(session.scheduledAt)}
                        </span>
                      </div>
                    </div>

                    <div className="session-status">
                      <span className="status rejected-status">
                        Cancelled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Sessions;

