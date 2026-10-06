import { useEffect, useState } from "react";
import api from "../api/api";

interface ReportData {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
  };

  requests: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    cancelled: number;
  };

  matches: {
    total: number;
    mutual: number;
    oneWay: number;
  };

  sessions: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    online: number;
    offline: number;
  };

  mostRequestedSkills: {
    skill: string;
    count: number;
  }[];
}

function AdminReports() {
  const [reports, setReports] =
    useState<ReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/reports");

      if (response.data?.success) {
        setReports(
          response.data.reports || null
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load reports."
        );
      }
    } catch (err: any) {
      console.error(
        "Admin reports error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Reports</h1>

            <p>
              Platform activity and performance
              overview.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-state">
            <strong>
              Generating reports...
            </strong>

            <span>
              Please wait a moment.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reports) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Reports</h1>

            <p>
              Platform activity and performance
              overview.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="error-message">
            {error ||
              "Reports are unavailable."}
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={loadReports}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-heading">
        <div>
          <h1>Reports</h1>

          <p>
            Platform activity and performance
            overview.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={loadReports}
        >
          Refresh
        </button>
      </div>

      {/* ======================================
          USER REPORT
      ====================================== */}

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            User Overview
          </h3>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              👥
            </div>

            <div>
              <p>Total Users</p>

              <h2>
                {reports.users.total}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🟢
            </div>

            <div>
              <p>Active Users</p>

              <h2>
                {reports.users.active}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🔴
            </div>

            <div>
              <p>Inactive Users</p>

              <h2>
                {reports.users.inactive}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🛡️
            </div>

            <div>
              <p>Administrators</p>

              <h2>
                {reports.users.admins}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          REQUEST REPORT
      ====================================== */}

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            Exchange Requests
          </h3>

          <span>
            {reports.requests.total} total
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              📩
            </div>

            <div>
              <p>Pending</p>

              <h2>
                {reports.requests.pending}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✅
            </div>

            <div>
              <p>Accepted</p>

              <h2>
                {reports.requests.accepted}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ❌
            </div>

            <div>
              <p>Rejected</p>

              <h2>
                {reports.requests.rejected}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🚫
            </div>

            <div>
              <p>Cancelled</p>

              <h2>
                {reports.requests.cancelled}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          MATCH REPORT
      ====================================== */}

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            Platform Matches
          </h3>

          <span>
            {reports.matches.total} total
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              🤝
            </div>

            <div>
              <p>Total Matches</p>

              <h2>
                {reports.matches.total}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🔄
            </div>

            <div>
              <p>Mutual Matches</p>

              <h2>
                {reports.matches.mutual}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ➡️
            </div>

            <div>
              <p>One-Way Matches</p>

              <h2>
                {reports.matches.oneWay}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          SESSION REPORT
      ====================================== */}

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            Sessions
          </h3>

          <span>
            {reports.sessions.total} total
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              📅
            </div>

            <div>
              <p>Scheduled</p>

              <h2>
                {reports.sessions.scheduled}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✅
            </div>

            <div>
              <p>Completed</p>

              <h2>
                {reports.sessions.completed}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ❌
            </div>

            <div>
              <p>Cancelled</p>

              <h2>
                {reports.sessions.cancelled}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              💻
            </div>

            <div>
              <p>Online</p>

              <h2>
                {reports.sessions.online}
              </h2>
            </div>
          </div>
        </div>

        <div className="card-header">
          <span>
            Offline Sessions
          </span>

          <strong>
            {reports.sessions.offline}
          </strong>
        </div>
      </div>

      {/* ======================================
          MOST REQUESTED SKILLS
      ====================================== */}

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            Most Requested Skills
          </h3>

          <span>
            Top 10
          </span>
        </div>

        {reports.mostRequestedSkills.length ===
        0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              📚
            </div>

            <strong>
              No skill request data
            </strong>

            <span>
              Requested skills will appear
              here as users exchange skills.
            </span>
          </div>
        ) : (
          <div>
            {reports.mostRequestedSkills.map(
              (item, index) => (
                <div
                  className="request-item"
                  key={item.skill}
                >
                  <div className="user-avatar">
                    {index + 1}
                  </div>

                  <div className="request-info">
                    <strong>
                      {item.skill}
                    </strong>

                    <span>
                      {item.count}{" "}
                      {item.count === 1
                        ? "request"
                        : "requests"}
                    </span>
                  </div>

                  <strong>
                    {item.count}
                  </strong>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReports;
