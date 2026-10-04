import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Skill {
  id?: string;
  name: string;
  level?: string;
}

interface User {
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
  skillsToTeach: Skill[];
  skillsToLearn: Skill[];
}

interface WishlistItem {
  id: string;
  targetUserId: string;
  skillId: string;
  skillName: string;
}

function Discover() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, wishlistResponse] = await Promise.all([
          api.get("/users/discover"),
          api.get("/users/wishlist"),
        ]);

        setUsers(usersResponse.data.users || []);
        setWishlist(wishlistResponse.data.wishlist || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return users;

    return users.filter((user) => {
      const searchableText = [
        user.name,
        user.role || "",
        user.bio || "",
        user.location?.city || "",
        ...user.skillsToTeach.map((skill) => skill.name),
        ...user.skillsToLearn.map((skill) => skill.name),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [users, search]);

  const isWishlisted = (userId: string, skillId: string) => {
    return wishlist.some(
      (item) =>
        item.targetUserId === userId &&
        item.skillId === skillId
    );
  };

  const toggleWishlist = async (
    user: User,
    skill: Skill
  ) => {
    if (!skill.id) return;

    try {
      setError("");

      const existingItem = wishlist.find(
        (item) =>
          item.targetUserId === user.uid &&
          item.skillId === skill.id
      );

      if (existingItem) {
        await api.delete(
          `/users/wishlist/${existingItem.id}`
        );

        setWishlist((current) =>
          current.filter(
            (item) => item.id !== existingItem.id
          )
        );
      } else {
        const response = await api.post(
          "/users/wishlist",
          {
            targetUserId: user.uid,
            skillId: skill.id,
            skillName: skill.name,
          }
        );

        setWishlist((current) => [
          ...current,
          response.data.wishlist,
        ]);
      }
    } catch (err: unknown) {
      console.error("Failed to update wishlist:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update wishlist."
      );
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Discover</h1>
          <p>
            Find people who can teach you the skills you want to learn.
          </p>
        </div>
      </div>

      <div className="dashboard-card discover-search">
        <input
          type="text"
          placeholder="Search by name, role, or skill..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {loading ? (
        <div className="dashboard-card">
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="dashboard-card no-results">
          <h3>Unable to load users</h3>
          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="dashboard-card no-results">
          <h3>
            {search
              ? "No users found"
              : "No users to discover yet"}
          </h3>

          <p>
            {search
              ? "Try searching for another name, role, or skill."
              : "Other members will appear here when they join the platform."}
          </p>
        </div>
      ) : (
        <div className="discover-grid">
          {filteredUsers.map((user) => (
            <div
              className="dashboard-card user-card"
              key={user.uid}
            >
              <div className="user-card-header">
                {user.photoURL ? (
                  <img
                    className="discover-avatar"
                    src={user.photoURL}
                    alt={`${user.name}'s profile`}
                  />
                ) : (
                  <div className="discover-avatar">
                    {user.name.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}

                <div>
                  <h2>
                    {user.name || "Unnamed User"}
                  </h2>

                  <p>
                    {user.role || "Skill Exchanger"}
                  </p>
                </div>
              </div>

              {user.location?.city && (
                <p className="user-location">
                  <span>📍</span>{" "}
                  {user.location.city}
                </p>
              )}

              {user.bio && (
                <p className="user-bio">
                  {user.bio}
                </p>
              )}

              <div className="skill-section">
                <strong>Can Teach</strong>

                <div className="skill-tags">
                  {user.skillsToTeach.length > 0 ? (
                    user.skillsToTeach.map(
                      (skill, index) => (
                        <div
                          className="skill-tag teach-tag"
                          key={
                            skill.id ||
                            `${skill.name}-${index}`
                          }
                        >
                          <span>{skill.name}</span>

                          {skill.id && (
                            <button
                              type="button"
                              onClick={() =>
                                void toggleWishlist(
                                  user,
                                  skill
                                )
                              }
                              title={
                                isWishlisted(
                                  user.uid,
                                  skill.id
                                )
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {isWishlisted(
                                user.uid,
                                skill.id
                              )
                                ? "❤️"
                                : "♡"}
                            </button>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <span className="empty-skill-text">
                      No teaching skills added
                    </span>
                  )}
                </div>
              </div>

              <div className="skill-section">
                <strong>Wants to Learn</strong>

                <div className="skill-tags">
                  {user.skillsToLearn.length > 0 ? (
                    user.skillsToLearn.map(
                      (skill, index) => (
                        <span
                          className="skill-tag learn-tag"
                          key={
                            skill.id ||
                            `${skill.name}-${index}`
                          }
                        >
                          {skill.name}
                        </span>
                      )
                    )
                  ) : (
                    <span className="empty-skill-text">
                      No learning skills added
                    </span>
                  )}
                </div>
              </div>

              <button
                className="connect-button"
                onClick={() =>
                  navigate(
                    `/profile/user/${user.uid}`
                  )
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

export default Discover;