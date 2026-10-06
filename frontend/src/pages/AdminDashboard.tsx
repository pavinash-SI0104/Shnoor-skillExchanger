import { useEffect, useState } from "react";
import api from "../api/api";

interface AdminOverview {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalAdmins: number;
  skillsToTeach: number;
  skillsToLearn: number;
}

function AdminDashboard() {
  const [overview, setOverview] =
    useState<AdminOverview | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/overview");

      if (response.data?.success) {
        setOverview(response.data.overview);
      } else {
        setError(
          response.data?.message ||
            "Failed to load admin overview."
        );
      }
    } catch (err: any) {
      console.error(
        "Admin overview error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load admin overview."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Loading platform statistics...
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-state">
            <strong>
              Loading admin data...
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
            <h1>Admin Dashboard</h1>
            <p>
              Platform administration and
              monitoring.
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
            onClick={loadOverview}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Monitor and manage the Skill
            Exchanger platform.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            👥
          </div>

          <div>
            <p>Total Users</p>

            <h2>
              {overview.totalUsers}
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
              {overview.activeUsers}
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
              {overview.inactiveUsers}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            👑
          </div>

          <div>
            <p>Administrators</p>

            <h2>
              {overview.totalAdmins}
            </h2>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              Skill Activity
            </h3>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                ⭐
              </div>

              <div>
                <p>Skills to Teach</p>

                <h2>
                  {overview.skillsToTeach}
                </h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                📚
              </div>

              <div>
                <p>Skills to Learn</p>

                <h2>
                  {overview.skillsToLearn}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              Platform Status
            </h3>
          </div>

          <div className="empty-state">
            <div className="empty-state-icon">
              🛡️
            </div>

            <strong>
              Admin access verified
            </strong>

            <span>
              You have administrator access
              to the Skill Exchanger platform.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
