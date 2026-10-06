import { useEffect, useState } from "react";
import api from "../api/api";

interface AdminMatchUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}

interface AdminMatch {
  id: string;
  userOne: AdminMatchUser;
  userTwo: AdminMatchUser;
  userOneCanTeach: string[];
  userTwoCanTeach: string[];
  matchPercentage: number;
  matchType: "mutual" | "one-way";
  createdAt: string | null;
}

function AdminMatches() {
  const [matches, setMatches] =
    useState<AdminMatch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/matches");

      if (response.data?.success) {
        setMatches(
          response.data.matches || []
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load matches."
        );
      }
    } catch (err: any) {
      console.error(
        "Admin matches error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load matches."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Matches</h1>

            <p>
              Monitor skill compatibility
              across the platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-state">
            <strong>
              Loading matches...
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
            <h1>Matches</h1>

            <p>
              Monitor skill compatibility
              across the platform.
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
            onClick={loadMatches}
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
          <h1>Matches</h1>

          <p>
            Monitor skill compatibility
            across the platform.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            Platform Matches
          </h3>

          <span>
            {matches.length}{" "}
            {matches.length === 1
              ? "match"
              : "matches"}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              🤝
            </div>

            <strong>
              No matches found
            </strong>

            <span>
              Skill-compatible users will
              appear here.
            </span>
          </div>
        ) : (
          <div className="admin-matches-list">
            {matches.map((match) => (
              <div
                className="dashboard-card"
                key={match.id}
              >
                <div className="card-header">
                  <div>
                    <h3>
                      {match.userOne.name ||
                        "Unknown user"}{" "}
                      ↔{" "}
                      {match.userTwo.name ||
                        "Unknown user"}
                    </h3>

                    <span>
                      {match.matchType ===
                      "mutual"
                        ? "Mutual match"
                        : "One-way match"}
                    </span>
                  </div>

                  <strong>
                    {match.matchPercentage}%
                  </strong>
                </div>

                <div className="dashboard-grid">
                  <div>
                    <strong>
                      {match.userOne.name}
                    </strong>

                    <p>
                      {match.userOne.email}
                    </p>

                    {match
                      .userOneCanTeach
                      .length > 0 && (
                      <div>
                        <small>
                          Can teach:
                        </small>

                        <p>
                          {match.userOneCanTeach.join(
                            ", "
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <strong>
                      {match.userTwo.name}
                    </strong>

                    <p>
                      {match.userTwo.email}
                    </p>

                    {match
                      .userTwoCanTeach
                      .length > 0 && (
                      <div>
                        <small>
                          Can teach:
                        </small>

                        <p>
                          {match.userTwoCanTeach.join(
                            ", "
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMatches;
