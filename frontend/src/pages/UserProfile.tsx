import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

interface Skill {
  id?: string;
  name: string;
  level?: string;
}

interface UserProfileData {
  uid: string;
  name: string;
  role?: string;
  bio?: string;
  photoURL?: string;
  location?: {
    type?: string;
    city?: string;
  };
  expertiseLevel?: string;
  interests?: string[];
}

function UserProfile() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [skillsToTeach, setSkillsToTeach] = useState<Skill[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<Skill[]>([]);

  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [error, setError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    if (!uid) {
      setError("User profile could not be identified.");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, skillsResponse] =
          await Promise.all([
            api.get(`/users/profile/${uid}`),
            api.get(`/users/skills/${uid}`),
          ]);

        setUser(profileResponse.data.user || null);

        const teachingSkills =
          skillsResponse.data.skillsToTeach || [];

        setSkillsToTeach(teachingSkills);
        setSkillsToLearn(
          skillsResponse.data.skillsToLearn || []
        );

        if (teachingSkills.length > 0) {
          setSelectedSkill(teachingSkills[0].id || "");
        }
      } catch (err: unknown) {
        console.error("Failed to load user profile:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load user profile."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchUserProfile();
  }, [uid]);

  const handleSendRequest = async () => {
    if (!uid || !selectedSkill) {
      setRequestMessage(
        "Please select a skill before sending a request."
      );
      return;
    }

    try {
      setSendingRequest(true);
      setError("");
      setRequestMessage("");

      await api.post("/users/requests", {
        receiverId: uid,
        skillId: selectedSkill,
      });

      setRequestMessage(
        "Exchange request sent successfully."
      );
    } catch (err: unknown) {
      console.error("Failed to send request:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to send exchange request."
      );
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => navigate("/discover")}
        >
          ← Back to Discover
        </button>

        <div className="dashboard-card">
          <h2>User not found</h2>
          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => navigate("/discover")}
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <button
        className="back-button"
        onClick={() => navigate("/discover")}
      >
        ← Back to Discover
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {requestMessage && (
        <div className="success-message">
          {requestMessage}
        </div>
      )}

      <div className="dashboard-card profile-header-card">
        <div className="profile-main">
          {user.photoURL ? (
            <img
              className="profile-avatar"
              src={user.photoURL}
              alt={`${user.name}'s profile`}
            />
          ) : (
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <div>
            <h1>{user.name || "Unnamed User"}</h1>

            <p>
              {user.role || "Skill Exchanger"}
            </p>

            {user.location?.city && (
              <p className="user-location">
                📍 {user.location.city}
              </p>
            )}

            {user.expertiseLevel && (
              <p className="profile-level">
                Level: {user.expertiseLevel}
              </p>
            )}
          </div>
        </div>

        <div className="profile-request-button">
          {skillsToTeach.length > 0 ? (
            <>
              <select
                value={selectedSkill}
                onChange={(event) =>
                  setSelectedSkill(event.target.value)
                }
              >
                {skillsToTeach.map((skill, index) => (
                  <option
                    value={skill.id || ""}
                    key={skill.id || `${skill.name}-${index}`}
                  >
                    Learn {skill.name}
                  </option>
                ))}
              </select>

              <button
                className="connect-button"
                disabled={sendingRequest || !selectedSkill}
                onClick={() => void handleSendRequest()}
              >
                {sendingRequest
                  ? "Sending..."
                  : "Send Exchange Request"}
              </button>
            </>
          ) : (
            <p>
              This user has not added any teaching skills yet.
            </p>
          )}
        </div>
      </div>

      {user.bio && (
        <div className="dashboard-card">
          <h2>About</h2>
          <p>{user.bio}</p>
        </div>
      )}

      <div className="profile-skills-grid">
        <div className="dashboard-card">
          <h2>Skills They Can Teach</h2>
          <p>Skills this user can share with you.</p>

          <div className="profile-skill-list">
            {skillsToTeach.length > 0 ? (
              skillsToTeach.map((skill, index) => (
                <div
                  className="profile-skill-item"
                  key={skill.id || `${skill.name}-${index}`}
                >
                  <span>💡</span>

                  <div>
                    <strong>{skill.name}</strong>

                    {skill.level && (
                      <small>{skill.level}</small>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No teaching skills added yet.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Skills They Want to Learn</h2>
          <p>
            Skills this user is interested in learning.
          </p>

          <div className="profile-skill-list">
            {skillsToLearn.length > 0 ? (
              skillsToLearn.map((skill, index) => (
                <div
                  className="profile-skill-item"
                  key={skill.id || `${skill.name}-${index}`}
                >
                  <span>🎯</span>

                  <div>
                    <strong>{skill.name}</strong>

                    {skill.level && (
                      <small>{skill.level}</small>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No learning skills added yet.</p>
            )}
          </div>
        </div>
      </div>

      {user.interests && user.interests.length > 0 && (
        <div className="dashboard-card">
          <h2>Interests</h2>

          <div className="skill-tags">
            {user.interests.map((interest) => (
              <span className="skill-tag" key={interest}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;