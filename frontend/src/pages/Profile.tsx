import { useState } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  // Personal Information
  const [name, setName] = useState("Supriya");
  const [email, setEmail] = useState("supriya@example.com");
  const [role, setRole] = useState("Frontend Developer");
  const [location, setLocation] = useState("India");

  const [bio, setBio] = useState(
    "I am interested in learning new technologies and exchanging skills with other developers."
  );

  // Skills
  const [skillsToTeach] = useState([
    "React",
    "TypeScript",
    "JavaScript",
  ]);

  const [skillsToLearn] = useState([
    "Node.js",
    "MongoDB",
    "Express",
  ]);

  // Save Profile
  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  // Cancel Editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div>
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and skills.</p>
        </div>

        {!isEditing ? (
          <button
            className="primary-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="profile-header-actions">
            <button
              className="secondary-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* =========================
          PROFILE HEADER
      ========================= */}

      <div className="dashboard-card profile-main-card">
        <div className="profile-main-header">

          <div className="profile-large-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-main-info">
            <h2>{name}</h2>
            <p>{role}</p>

            <div className="profile-meta">
              <span>📍 {location}</span>
              <span>⭐ 4.8 Rating</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================
          PERSONAL INFORMATION
      ========================= */}

      <div className="dashboard-card profile-section">

        <div className="card-header">
          <div>
            <h2>Personal Information</h2>
            <p>Your basic profile information.</p>
          </div>
        </div>

        <div className="profile-form-grid">

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>

            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            ) : (
              <div className="profile-value">
                {name}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>

            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            ) : (
              <div className="profile-value">
                {email}
              </div>
            )}
          </div>

          {/* Role */}
          <div className="form-group">
            <label>Role</label>

            {isEditing ? (
              <input
                type="text"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              />
            ) : (
              <div className="profile-value">
                {role}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location</label>

            {isEditing ? (
              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
              />
            ) : (
              <div className="profile-value">
                {location}
              </div>
            )}
          </div>

        </div>

        {/* About Me */}
        <div className="form-group profile-bio-group">
          <label>About Me</label>

          {isEditing ? (
            <textarea
              value={bio}
              onChange={(event) =>
                setBio(event.target.value)
              }
              rows={4}
            />
          ) : (
            <div className="profile-value profile-bio">
              {bio}
            </div>
          )}
        </div>

      </div>

      {/* =========================
          SKILLS
      ========================= */}

      <div className="profile-skills-grid">

        {/* Skills I Can Teach */}
        <div className="dashboard-card profile-section">

          <div className="card-header">
            <div>
              <h2>Skills I Can Teach</h2>
              <p>
                Technologies you can help others learn.
              </p>
            </div>
          </div>

          <div className="profile-skill-list">

            {skillsToTeach.map((skill) => (
              <span
                className="profile-skill teach-skill"
                key={skill}
              >
                ⭐ {skill}
              </span>
            ))}

          </div>

        </div>

        {/* Skills I Want to Learn */}
        <div className="dashboard-card profile-section">

          <div className="card-header">
            <div>
              <h2>Skills I Want to Learn</h2>
              <p>
                Technologies you want to learn.
              </p>
            </div>
          </div>

          <div className="profile-skill-list">

            {skillsToLearn.map((skill) => (
              <span
                className="profile-skill learn-skill"
                key={skill}
              >
                📚 {skill}
              </span>
            ))}

          </div>

        </div>

      </div>

      {/* =========================
          ACTIVITY OVERVIEW
      ========================= */}

      <div className="dashboard-card profile-section">

        <div className="card-header">
          <div>
            <h2>Activity Overview</h2>
            <p>Your skill exchange activity.</p>
          </div>
        </div>

        <div className="profile-activity-grid">

          <div className="activity-item">
            <strong>5</strong>
            <span>Skills</span>
          </div>

          <div className="activity-item">
            <strong>4</strong>
            <span>Matches</span>
          </div>

          <div className="activity-item">
            <strong>8</strong>
            <span>Sessions</span>
          </div>

          <div className="activity-item">
            <strong>12</strong>
            <span>Reviews</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;