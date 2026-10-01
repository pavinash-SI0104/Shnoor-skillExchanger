import { useState } from "react";

interface WishlistUser {
  id: number;
  name: string;
  role: string;
  skills: string[];
  rating: number;
}

function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistUser[]>([
    {
      id: 1,
      name: "Avinash",
      role: "Full Stack Developer",
      skills: ["Node.js", "Express", "MongoDB"],
      rating: 4.8,
    },
    {
      id: 2,
      name: "Anjali",
      role: "UI/UX Designer",
      skills: ["Figma", "UI/UX Design"],
      rating: 4.9,
    },
    {
      id: 3,
      name: "Priya",
      role: "Data Analyst",
      skills: ["Python", "SQL", "Excel"],
      rating: 4.7,
    },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlist(
      wishlist.filter((user) => user.id !== id)
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <h1>Wishlist</h1>
          <p>
            Keep track of people you may want to exchange skills with.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="wishlist-summary">
        <div className="summary-card">
          <span>Saved Profiles</span>
          <strong>{wishlist.length}</strong>
        </div>

        <div className="summary-card">
          <span>Available Skills</span>
          <strong>
            {wishlist.reduce(
              (total, user) => total + user.skills.length,
              0
            )}
          </strong>
        </div>

        <div className="summary-card">
          <span>Average Rating</span>
          <strong>
            {wishlist.length > 0
              ? (
                  wishlist.reduce(
                    (total, user) => total + user.rating,
                    0
                  ) / wishlist.length
                ).toFixed(1)
              : "0.0"}
          </strong>
        </div>
      </div>

      {/* Wishlist */}
      <div className="dashboard-card wishlist-card">
        <div className="card-header">
          <div>
            <h2>Saved Profiles</h2>
            <p>
              People you have added to your wishlist.
            </p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">❤️</div>

            <h3>Your wishlist is empty</h3>

            <p>
              Discover people and save profiles you are
              interested in.
            </p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((user) => (
              <div
                className="wishlist-item"
                key={user.id}
              >
                <div className="wishlist-user-header">
                  <div className="wishlist-avatar">
                    {user.name.charAt(0)}
                  </div>

                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.role}</p>
                  </div>
                </div>

                <div className="wishlist-rating">
                  ⭐ {user.rating}
                </div>

                <div className="wishlist-skills">
                  <span className="wishlist-label">
                    Skills
                  </span>

                  <div className="wishlist-skill-list">
                    {user.skills.map((skill) => (
                      <span
                        className="wishlist-skill"
                        key={skill}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="wishlist-actions">
                  <button
                    className="connect-button"
                    onClick={() =>
                      alert(
                        `Opening ${user.name}'s profile...`
                      )
                    }
                  >
                    View Profile
                  </button>

                  <button
                    className="remove-wishlist-button"
                    onClick={() =>
                      removeFromWishlist(user.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;