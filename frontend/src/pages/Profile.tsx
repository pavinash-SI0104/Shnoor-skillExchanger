import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../api/api";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role?: string;
  location?: string;
  photoURL?: string;
  bio?: string;
}

interface Skill {
  id: string;
  name: string;
  type: "teach" | "learn";
  level: string;
}

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        setError("Please log in to view your profile.");
        return;
      }

      // Load profile
      const profileResponse = await api.get(
        "/users/profile"
      );

      const profile =
        profileResponse.data?.user || {};

      setName(
        profile.name ||
          firebaseUser.displayName ||
          ""
      );

      setEmail(
        profile.email ||
          firebaseUser.email ||
          ""
      );

      setRole(profile.role || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");

      // Load skills
      const skillsResponse = await api.get(
        "/users/skills"
      );

      const skillsData =
        skillsResponse.data || {};

      const teachingSkills: Skill[] = (
        skillsData.skillsToTeach || []
      ).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        type: "teach",
        level: skill.level,
      }));

      const learningSkills: Skill[] = (
        skillsData.skillsToLearn || []
      ).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        type: "learn",
        level: skill.level,
      }));

      setSkills([
        ...teachingSkills,
        ...learningSkills,
      ]);
    } catch (err: any) {
      console.error(
        "Failed to load profile:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async () => {
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        setError("Please log in first.");
        return;
      }

      const profileData: UserProfile = {
        uid: firebaseUser.uid,
        name: name.trim(),
        email: firebaseUser.email || email,
        role: role.trim(),
        location: location.trim(),
        bio: bio.trim(),
      };

      // Update Firebase display name
      if (
        firebaseUser.displayName !==
        profileData.name
      ) {
        await updateProfile(firebaseUser, {
          displayName: profileData.name,
        });
      }

      // Save profile in backend / Firestore
      await api.post(
        "/users/profile",
        profileData
      );

      setName(profileData.name);
      setEmail(profileData.email);
      setRole(profileData.role ?? "");
      setLocation(profileData.location ?? "");
      setBio(profileData.bio ?? "");

      setIsEditing(false);

      setMessage(
        "Profile updated successfully."
      );
    } catch (err: any) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CANCEL EDITING
  // =========================

  const handleCancel = () => {
    setMessage("");
    setError("");
    setIsEditing(false);

    // Reload original values
    loadProfile();
  };

  // =========================
  // SKILLS
  // =========================

  const teachingSkills = skills.filter(
    (skill) => skill.type === "teach"
  );

  const learningSkills = skills.filter(
    (skill) => skill.type === "learn"
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>My Profile</h1>
            <p>
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-heading">
        <div>
          <h1>My Profile</h1>

          <p>
            Manage your personal information
            and skills.
          </p>
        </div>

        {!isEditing ? (
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              setIsEditing(true);
            }}
          >
            Edit Profile
          </button>
        ) : (
          <div className="profile-header-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* FEEDBACK */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* PROFILE HEADER */}

      <div className="dashboard-card profile-main-card">
        <div className="profile-main-header">
          <div className="profile-large-avatar">
            {name.charAt(0).toUpperCase() ||
              "U"}
          </div>

          <div className="profile-main-info">
            <h2>
              {name || "User"}
            </h2>

            <p>
              {role || "Skill Exchanger"}
            </p>

            <div className="profile-meta">
              {location && (
                <span>
                  📍 {location}
                </span>
              )}

              <span>
                ✉️ {email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}

      <div className="dashboard-card profile-section">
        <div className="card-header">
          <div>
            <h2>
              Personal Information
            </h2>

            <p>
              Your basic profile information.
            </p>
          </div>
        </div>

        <div className="profile-form-grid">
          {/* NAME */}

          <div className="form-group">
            <label htmlFor="profile-name">
              Full Name
            </label>

            {isEditing ? (
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={saving}
              />
            ) : (
              <div className="profile-value">
                {name || "Not provided"}
              </div>
            )}
          </div>

          {/* EMAIL */}

          <div className="form-group">
            <label htmlFor="profile-email">
              Email
            </label>

            <div className="profile-value">
              {email || "Not provided"}
            </div>
          </div>

          {/* ROLE */}

          <div className="form-group">
            <label htmlFor="profile-role">
              Role
            </label>

            {isEditing ? (
              <input
                id="profile-role"
                type="text"
                placeholder="Example: Frontend Developer"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                disabled={saving}
              />
            ) : (
              <div className="profile-value">
                {role || "Not provided"}
              </div>
            )}
          </div>

          {/* LOCATION */}

          <div className="form-group">
            <label htmlFor="profile-location">
              Location
            </label>

            {isEditing ? (
              <input
                id="profile-location"
                type="text"
                placeholder="Example: India"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                disabled={saving}
              />
            ) : (
              <div className="profile-value">
                {location || "Not provided"}
              </div>
            )}
          </div>
        </div>

        {/* BIO */}

        <div className="form-group profile-bio-group">
          <label htmlFor="profile-bio">
            About Me
          </label>

          {isEditing ? (
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) =>
                setBio(event.target.value)
              }
              rows={4}
              placeholder="Tell other users a little about yourself..."
              disabled={saving}
            />
          ) : (
            <div className="profile-value profile-bio">
              {bio || "No bio added yet."}
            </div>
          )}
        </div>
      </div>

      {/* SKILLS */}

      <div className="profile-skills-grid">
        {/* TEACHING SKILLS */}

        <div className="dashboard-card profile-section">
          <div className="card-header">
            <div>
              <h2>
                Skills I Can Teach
              </h2>

              <p>
                Skills you can help others
                learn.
              </p>
            </div>
          </div>

          <div className="profile-skill-list">
            {teachingSkills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  ⭐
                </div>

                <strong>
                  No teaching skills
                </strong>

                <span>
                  Add skills from My Skills.
                </span>
              </div>
            ) : (
              teachingSkills.map(
                (skill) => (
                  <span
                    className="profile-skill teach-skill"
                    key={skill.id}
                  >
                    ⭐ {skill.name}
                  </span>
                )
              )
            )}
          </div>
        </div>

        {/* LEARNING SKILLS */}

        <div className="dashboard-card profile-section">
          <div className="card-header">
            <div>
              <h2>
                Skills I Want to Learn
              </h2>

              <p>
                Skills you want to learn
                from others.
              </p>
            </div>
          </div>

          <div className="profile-skill-list">
            {learningSkills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  📚
                </div>

                <strong>
                  No learning skills
                </strong>

                <span>
                  Add skills from My Skills.
                </span>
              </div>
            ) : (
              learningSkills.map(
                (skill) => (
                  <span
                    className="profile-skill learn-skill"
                    key={skill.id}
                  >
                    📚 {skill.name}
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* ACTIVITY OVERVIEW */}

      <div className="dashboard-card profile-section">
        <div className="card-header">
          <div>
            <h2>
              Activity Overview
            </h2>

            <p>
              Your current skill exchange
              activity.
            </p>
          </div>
        </div>

        <div className="profile-activity-grid">
          <div className="activity-item">
            <strong>
              {skills.length}
            </strong>

            <span>
              Skills
            </span>
          </div>

          <div className="activity-item">
            <strong>0</strong>

            <span>
              Matches
            </span>
          </div>

          <div className="activity-item">
            <strong>0</strong>

            <span>
              Sessions
            </span>
          </div>

          <div className="activity-item">
            <strong>0</strong>

            <span>
              Reviews
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;