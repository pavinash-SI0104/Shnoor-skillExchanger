import { useState } from "react";

interface Session {
  id: number;
  title: string;
  person: string;
  skill: string;
  date: string;
  time: string;
  mode: "Online" | "Offline";
  status: "Upcoming" | "Completed";
}

function Sessions() {
  const [showForm, setShowForm] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      title: "React Learning Session",
      person: "Avinash",
      skill: "React",
      date: "2026-10-05",
      time: "10:00 AM",
      mode: "Online",
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Python Skill Exchange",
      person: "Rahul",
      skill: "Python",
      date: "2026-10-07",
      time: "3:00 PM",
      mode: "Online",
      status: "Upcoming",
    },
    {
      id: 3,
      title: "Figma Design Session",
      person: "Anjali",
      skill: "Figma",
      date: "2026-09-28",
      time: "11:00 AM",
      mode: "Offline",
      status: "Completed",
    },
  ]);

  const [title, setTitle] = useState("");
  const [person, setPerson] = useState("");
  const [skill, setSkill] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"Online" | "Offline">("Online");

  const handleScheduleSession = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !person || !skill || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const newSession: Session = {
      id: Date.now(),
      title,
      person,
      skill,
      date,
      time,
      mode,
      status: "Upcoming",
    };

    setSessions([...sessions, newSession]);

    setTitle("");
    setPerson("");
    setSkill("");
    setDate("");
    setTime("");
    setMode("Online");

    setShowForm(false);

    alert("Session scheduled successfully!");
  };

  const upcomingSessions = sessions.filter(
    (session) => session.status === "Upcoming"
  );

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed"
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <h1>Sessions</h1>
          <p>Schedule and manage your skill exchange sessions.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Schedule Session"}
        </button>
      </div>

      {/* Summary */}
      <div className="session-summary">
        <div className="summary-card">
          <span>Upcoming Sessions</span>
          <strong>{upcomingSessions.length}</strong>
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

      {/* Schedule Form */}
      {showForm && (
        <div className="dashboard-card session-form-card">
          <div className="card-header">
            <div>
              <h2>Schedule a Session</h2>
              <p>Create a new skill exchange session.</p>
            </div>
          </div>

          <form onSubmit={handleScheduleSession}>
            <div className="session-form-grid">

              <div className="form-group">
                <label>Session Title</label>
                <input
                  type="text"
                  placeholder="Example: React Learning Session"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Person</label>
                <input
                  type="text"
                  placeholder="Enter participant name"
                  value={person}
                  onChange={(event) => setPerson(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Skill</label>
                <input
                  type="text"
                  placeholder="Example: React"
                  value={skill}
                  onChange={(event) => setSkill(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Session Mode</label>

                <select
                  value={mode}
                  onChange={(event) =>
                    setMode(event.target.value as "Online" | "Offline")
                  }
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

            </div>

            <div className="session-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                Schedule Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="dashboard-card sessions-card">
        <div className="card-header">
          <div>
            <h2>Upcoming Sessions</h2>
            <p>Your scheduled skill exchange sessions.</p>
          </div>
        </div>

        <div className="session-list">
          {upcomingSessions.length === 0 ? (
            <div className="empty-sessions">
              <h3>No upcoming sessions</h3>
              <p>Schedule a session to see it here.</p>
            </div>
          ) : (
            upcomingSessions.map((session) => (
              <div className="session-item" key={session.id}>

                <div className="session-date">
                  <span>
                    {new Date(session.date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>

                  <strong>
                    {new Date(session.date).getDate()}
                  </strong>
                </div>

                <div className="session-info">
                  <h3>{session.title}</h3>

                  <p>
                    With <strong>{session.person}</strong>
                  </p>

                  <div className="session-meta">
                    <span>📚 {session.skill}</span>
                    <span>🕐 {session.time}</span>
                    <span>💻 {session.mode}</span>
                  </div>
                </div>

                <div className="session-status">
                  <span className="status upcoming-status">
                    {session.status}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Sessions */}
      <div className="dashboard-card sessions-card">
        <div className="card-header">
          <div>
            <h2>Completed Sessions</h2>
            <p>Your previous skill exchange sessions.</p>
          </div>
        </div>

        <div className="session-list">
          {completedSessions.map((session) => (
            <div className="session-item" key={session.id}>

              <div className="session-date completed-date">
                <span>
                  {new Date(session.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>

                <strong>
                  {new Date(session.date).getDate()}
                </strong>
              </div>

              <div className="session-info">
                <h3>{session.title}</h3>

                <p>
                  With <strong>{session.person}</strong>
                </p>

                <div className="session-meta">
                  <span>📚 {session.skill}</span>
                  <span>🕐 {session.time}</span>
                  <span>📍 {session.mode}</span>
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
      </div>
    </div>
  );
}

export default Sessions;