import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Match {
  uid: string;
  name: string;
  role: string;
  photoURL?: string;
  expertiseLevel?: string;
  youCanTeach: string[];
  theyCanTeach: string[];
  matchPercentage: number;
  reason?: string;
  aiGenerated?: boolean;
}

function Matches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/matches");

        setMatches(response.data.matches || []);
      } catch (err: any) {
        console.error("Failed to fetch matches:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your matches. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-heading">
        <div>
          <h1>My Matches</h1>

          <p>
            Discover people whose skills match your learning and teaching
            goals.
          </p>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="dashboard-card">
          <p>Finding your best skill matches...</p>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="dashboard-card">
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* NO MATCHES */}

      {!loading && !error && matches.length === 0 && (
        <div className="dashboard-card empty-state">
          <h2>No matches yet</h2>

          <p>
            Add skills you want to teach and learn to discover potential
            skill-exchange partners.
          </p>

          <button
            className="connect-button"
            onClick={() => navigate("/skills")}
          >
            Manage My Skills
          </button>
        </div>
      )}

      {/* MATCHES */}

      {!loading && !error && matches.length > 0 && (
        <div className="matches-grid">
          {matches.map((match) => (
            <div
              className="dashboard-card match-card"
              key={match.uid}
            >
              {/* USER */}

              <div className="match-header">
                <div className="match-avatar">
                  {match.photoURL ? (
                    <img
                      src={match.photoURL}
                      alt={match.name || "User"}
                    />
                  ) : (
                    (match.name || "U").charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h2>{match.name || "User"}</h2>

                  <p>
                    {match.role ||
                      match.expertiseLevel ||
                      "Skill Exchange Member"}
                  </p>
                </div>
              </div>

              {/* MATCH SCORE */}

              <div className="match-score">
                <strong>{match.matchPercentage}%</strong>

                <span>Skill Match</span>
              </div>

              {/* EXCHANGE */}

              <div className="match-exchange">
                <div className="match-skill">
                  <small>You can teach</small>

                  <strong>
                    {match.youCanTeach.length > 0
                      ? match.youCanTeach.join(", ")
                      : "No matching skill"}
                  </strong>
                </div>

                <div className="match-arrow">⇄</div>

                <div className="match-skill">
                  <small>They can teach</small>

                  <strong>
                    {match.theyCanTeach.length > 0
                      ? match.theyCanTeach.join(", ")
                      : "No matching skill"}
                  </strong>
                </div>
              </div>

              {/* AI REASON */}

              {match.reason && (
                <div className="match-reason">
                  <small>
                    {match.aiGenerated
                      ? "AI Match Reason"
                      : "Match Reason"}
                  </small>

                  <p>{match.reason}</p>
                </div>
              )}

              {/* PROFILE BUTTON */}

              <button
                className="connect-button"
                onClick={() =>
                  navigate(`/profile/user/${match.uid}`)
                }
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;
