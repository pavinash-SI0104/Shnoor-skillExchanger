import { useLocation, useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  role: string;
  teaches: string[];
  learns: string[];
  level: string;
  rating: number;
}

function UserProfile() {

  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state as User | null;

  if (!user) {
    return (
      <div className="dashboard-card">
        <h2>User not found</h2>

        <p>
          No user information was provided.
        </p>

        <button
          className="primary-button"
          onClick={() => navigate("/discover")}
        >
          Back to Discover
        </button>
      </div>
    );
  }


  return (
    <div>

      {/* BACK BUTTON */}

      <button
        className="back-button"
        onClick={() => navigate("/discover")}
      >
        ← Back to Discover
      </button>


      {/* PROFILE HEADER */}

      <div className="dashboard-card profile-header-card">

        <div className="profile-main">

          <div className="profile-avatar">
            {user.name.charAt(0)}
          </div>

          <div>

            <h1>{user.name}</h1>

            <p>{user.role}</p>

            <div className="profile-rating">
              ⭐ {user.rating} • {user.level}
            </div>

          </div>

        </div>


        <button
          className="connect-button profile-request-button"
          onClick={() => alert("Exchange request feature coming next!")}
        >
          Send Exchange Request
        </button>

      </div>


      {/* SKILLS */}

      <div className="profile-skills-grid">


        {/* TEACHING */}

        <div className="dashboard-card">

          <h2>Skills They Can Teach</h2>

          <p>
            Skills this user can share with you.
          </p>

          <div className="profile-skill-list">

            {user.teaches.map((skill) => (

              <div
                className="profile-skill-item"
                key={skill}
              >

                <span>💡</span>

                <strong>{skill}</strong>

              </div>

            ))}

          </div>

        </div>


        {/* LEARNING */}

        <div className="dashboard-card">

          <h2>Skills They Want to Learn</h2>

          <p>
            Skills this user is interested in learning.
          </p>

          <div className="profile-skill-list">

            {user.learns.map((skill) => (

              <div
                className="profile-skill-item"
                key={skill}
              >

                <span>🎯</span>

                <strong>{skill}</strong>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default UserProfile;