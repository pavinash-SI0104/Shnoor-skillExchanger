import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  role: string;
  teaches: string[];
  learns: string[];
  level: string;
  rating: number;
}

function Discover() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const users: User[] = [
    {
      id: 1,
      name: "Avinash",
      role: "Full Stack Developer",
      teaches: ["Node.js", "Express", "MongoDB"],
      learns: ["React", "TypeScript"],
      level: "Advanced",
      rating: 4.8
    },
    {
      id: 2,
      name: "Rahul",
      role: "Frontend Developer",
      teaches: ["React", "JavaScript", "CSS"],
      learns: ["Python", "Django"],
      level: "Intermediate",
      rating: 4.6
    },
    {
      id: 3,
      name: "Anjali",
      role: "UI/UX Designer",
      teaches: ["Figma", "UI/UX Design"],
      learns: ["React", "JavaScript"],
      level: "Advanced",
      rating: 4.9
    },
    {
      id: 4,
      name: "Priya",
      role: "Data Analyst",
      teaches: ["Python", "SQL", "Excel"],
      learns: ["Machine Learning"],
      level: "Intermediate",
      rating: 4.7
    }
  ];


  const filteredUsers = users.filter((user) => {

    const searchText = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(searchText) ||
      user.role.toLowerCase().includes(searchText) ||
      user.teaches.some((skill) =>
        skill.toLowerCase().includes(searchText)
      )
    );

  });


  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <h1>Discover</h1>

          <p>
            Find people who can teach you the skills you want to learn.
          </p>
        </div>

      </div>


      {/* SEARCH */}

      <div className="dashboard-card discover-search">

        <input
          type="text"
          placeholder="Search by name, role, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* USERS */}

      <div className="discover-grid">

        {filteredUsers.length === 0 ? (

          <div className="dashboard-card no-results">

            <h3>No users found</h3>

            <p>
              Try searching for another skill or user.
            </p>

          </div>

        ) : (

          filteredUsers.map((user) => (

            <div
              className="dashboard-card user-card"
              key={user.id}
            >

              {/* USER HEADER */}

              <div className="user-card-header">

                <div className="discover-avatar">
                  {user.name.charAt(0)}
                </div>

                <div>

                  <h2>{user.name}</h2>

                  <p>{user.role}</p>

                </div>

              </div>


              {/* RATING */}

              <div className="user-rating">

                ⭐ {user.rating}

                <span>
                  • {user.level}
                </span>

              </div>


              {/* TEACHES */}

              <div className="skill-section">

                <strong>
                  Can Teach
                </strong>

                <div className="skill-tags">

                  {user.teaches.map((skill) => (

                    <span
                      className="skill-tag teach-tag"
                      key={skill}
                    >
                      {skill}
                    </span>

                  ))}

                </div>

              </div>


              {/* LEARNS */}

              <div className="skill-section">

                <strong>
                  Wants to Learn
                </strong>

                <div className="skill-tags">

                  {user.learns.map((skill) => (

                    <span
                      className="skill-tag learn-tag"
                      key={skill}
                    >
                      {skill}
                    </span>

                  ))}

                </div>

              </div>


              {/* BUTTON */}

              <button
  className="connect-button"
  onClick={() =>
    navigate("/profile/user", {
      state: user
    })
  }
>
  View Profile
</button>
            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default Discover;