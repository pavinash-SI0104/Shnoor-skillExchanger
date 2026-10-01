interface Match {
  id: number;
  name: string;
  role: string;
  youCanTeach: string;
  theyCanTeach: string;
  matchPercentage: number;
  level: string;
}

function Matches() {

  const matches: Match[] = [
    {
      id: 1,
      name: "Avinash",
      role: "Full Stack Developer",
      youCanTeach: "React",
      theyCanTeach: "Node.js",
      matchPercentage: 92,
      level: "Advanced"
    },
    {
      id: 2,
      name: "Rahul",
      role: "Frontend Developer",
      youCanTeach: "Python",
      theyCanTeach: "React",
      matchPercentage: 87,
      level: "Intermediate"
    },
    {
      id: 3,
      name: "Anjali",
      role: "UI/UX Designer",
      youCanTeach: "JavaScript",
      theyCanTeach: "Figma",
      matchPercentage: 81,
      level: "Advanced"
    },
    {
      id: 4,
      name: "Priya",
      role: "Data Analyst",
      youCanTeach: "Python",
      theyCanTeach: "Machine Learning",
      matchPercentage: 76,
      level: "Intermediate"
    }
  ];


  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>

          <h1>My Matches</h1>

          <p>
            Discover people whose skills match your learning goals.
          </p>

        </div>

      </div>


      {/* MATCHES */}

      <div className="matches-grid">

        {matches.map((match) => (

          <div
            className="dashboard-card match-card"
            key={match.id}
          >

            {/* USER */}

            <div className="match-header">

              <div className="match-avatar">
                {match.name.charAt(0)}
              </div>

              <div>

                <h2>{match.name}</h2>

                <p>{match.role}</p>

              </div>

            </div>


            {/* MATCH SCORE */}

            <div className="match-score">

              <strong>
                {match.matchPercentage}%
              </strong>

              <span>
                Skill Match
              </span>

            </div>


            {/* EXCHANGE */}

            <div className="match-exchange">

              <div className="match-skill">

                <small>
                  You can teach
                </small>

                <strong>
                  {match.youCanTeach}
                </strong>

              </div>


              <div className="match-arrow">
                ⇄
              </div>


              <div className="match-skill">

                <small>
                  They can teach
                </small>

                <strong>
                  {match.theyCanTeach}
                </strong>

              </div>

            </div>


            {/* LEVEL */}

            <div className="match-level">

              <span>
                Skill Level
              </span>

              <strong>
                {match.level}
              </strong>

            </div>


            {/* BUTTON */}

            <button
              className="connect-button"
              onClick={() =>
                alert(
                  `Exchange request to ${match.name} will be added next.`
                )
              }
            >
              Send Exchange Request
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Matches;