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

  const [expandedSkills, setExpandedSkills] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, wishlistResponse] =
          await Promise.all([
            api.get("/users/discover"),
            api.get("/users/wishlist"),
          ]);
        const [usersResponse, wishlistResponse] =
          await Promise.all([
            api.get("/users/discover"),
            api.get("/users/wishlist"),
          ]);

        setUsers(usersResponse.data.users || []);
        setWishlist(
          wishlistResponse.data.wishlist || []
        );
        setWishlist(
          wishlistResponse.data.wishlist || []
        );
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
        ...user.skillsToTeach.map(
          (skill) => skill.name
        ),
        ...user.skillsToLearn.map(
          (skill) => skill.name
        ),
        ...user.skillsToTeach.map(
          (skill) => skill.name
        ),
        ...user.skillsToLearn.map(
          (skill) => skill.name
        ),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [users, search]);

  const isWishlisted = (
    userId: string,
    skillId: string
  ) => {
  const isWishlisted = (
    userId: string,
    skillId: string
  ) => {
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
      console.error(
        "Failed to update wishlist:",
        err
      );
      console.error(
        "Failed to update wishlist:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update wishlist."
      );
    }
  };

  const toggleSkills = (
    userId: string,
    section: "teach" | "learn"
  ) => {
    const key = `${userId}-${section}`;

    setExpandedSkills((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const isExpanded = (
    userId: string,
    section: "teach" | "learn"
  ) => {
    return expandedSkills.has(
      `${userId}-${section}`
    );
  };

  return (
    <div className="discover-page">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-heading">
        <div>
          <h1>Discover</h1>


          <p>
            Find people who can teach you the
            skills you want to learn.
            Find people who can teach you the
            skills you want to learn.
          </p>
        </div>
      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="discover-search">
        <div className="discover-search-icon">
          🔍
        </div>

        <input
          type="text"
          placeholder="Search by name, role, or skill..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          aria-label="Search users"
        />

        {search && (
          <button
            type="button"
            className="discover-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* ======================================
          RESULT INFO
      ====================================== */}

      {!loading &&
        !error &&
        users.length > 0 && (
          <div className="discover-result-info">
            <span>
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "person"
                : "people"}{" "}
              found
            </span>

            {search && (
              <span>
                for{" "}
                <strong>
                  "{search}"
                </strong>
              </span>
            )}
          </div>
        )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (
        <div className="discover-grid">
          {[1, 2, 3].map((item) => (
            <div
              className="discover-card discover-skeleton"
              key={item}
            >
              <div className="skeleton-header">
                <div className="skeleton-avatar" />

                <div className="skeleton-lines">
                  <div className="skeleton-line large" />
                  <div className="skeleton-line small" />
                </div>
              </div>

              <div className="skeleton-line full" />
              <div className="skeleton-line medium" />

              <div className="skeleton-tags">
                <span />
                <span />
                <span />
              </div>

              <div className="skeleton-button" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* ======================================
           ERROR
        ====================================== */

        <div className="discover-empty">
          <div className="discover-empty-icon">
            ⚠️
          </div>

          <h3>Unable to load users</h3>


          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* ======================================
           EMPTY
        ====================================== */

        <div className="discover-empty">
          <div className="discover-empty-icon">
            {search ? "🔎" : "👥"}
          </div>

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

          {search && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* ======================================
           USER GRID
        ====================================== */

        <div className="discover-grid">
          {filteredUsers.map((user) => {
            const teachExpanded = isExpanded(
              user.uid,
              "teach"
            );

            const learnExpanded = isExpanded(
              user.uid,
              "learn"
            );

            const visibleTeachSkills =
              teachExpanded
                ? user.skillsToTeach
                : user.skillsToTeach.slice(0, 3);

            const visibleLearnSkills =
              learnExpanded
                ? user.skillsToLearn
                : user.skillsToLearn.slice(0, 3);

            const remainingTeachSkills =
              Math.max(
                user.skillsToTeach.length - 3,
                0
              );

            const remainingLearnSkills =
              Math.max(
                user.skillsToLearn.length - 3,
                0
              );

            return (
              <article
                className="discover-card"
                key={user.uid}
              >
                {/* ==================================
                    PROFILE HEADER
                ================================== */}

                <div className="discover-card-header">
                  <div className="discover-profile">
                    {user.photoURL ? (
                      <img
                        className="discover-avatar"
                        src={user.photoURL}
                        alt={`${user.name}'s profile`}
                      />
                    ) : (
                      <div className="discover-avatar">
                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="discover-user-info">
                      <h2>
                        {user.name ||
                          "Unnamed User"}
                      </h2>

                      <p>
                        {user.role ||
                          "Skill Exchanger"}
                      </p>
                    </div>
                  </div>

                  {user.expertiseLevel && (
                    <span className="discover-expertise">
                      {user.expertiseLevel}
                    </span>
                  )}
                </div>

                {/* ==================================
                    META INFORMATION
                ================================== */}

                {(user.location?.city ||
                  user.expertiseLevel) && (
                  <div className="discover-meta-row">
                    {user.location?.city && (
                      <span className="discover-meta-item">
                        <span className="discover-meta-icon">
                          📍
                        </span>

                        {user.location.city}
                      </span>
                    )}

                    {user.expertiseLevel && (
                      <span className="discover-meta-item">
                        <span className="discover-meta-icon">
                          ✦
                        </span>

                        {user.expertiseLevel}
                      </span>
                    )}
                  </div>
                )}

                {/* ==================================
                    BIO
                ================================== */}

                {user.bio ? (
                  <p className="discover-bio">
                    {user.bio}
                  </p>
                ) : (
                  <p className="discover-bio discover-bio-empty">
                    No bio added yet.
                  </p>
                )}

                <div className="discover-divider" />

                {/* ==================================
                    CAN TEACH
                ================================== */}

                <div className="discover-skill-section">
                  <div className="discover-section-title">
                    <div className="discover-section-label">
                      <span className="discover-section-icon teach-icon">
                        ↗
                      </span>

                      <span>Can Teach</span>
                    </div>

                    <span className="discover-skill-count">
                      {user.skillsToTeach.length}
                    </span>
                  </div>

                  <div className="skill-tags">
                    {user.skillsToTeach.length > 0 ? (
                      <>
                        {visibleTeachSkills.map(
                          (skill, index) => {
                            const wishlisted =
                              skill.id
                                ? isWishlisted(
                                    user.uid,
                                    skill.id
                                  )
                                : false;

                            return (
                              <div
                                className="skill-tag teach-tag"
                                key={
                                  skill.id ||
                                  `${skill.name}-${index}`
                                }
                              >
                                <span>
                                  {skill.name}
                                </span>

                                {skill.id && (
                                  <button
                                    type="button"
                                    className="skill-wishlist-button"
                                    onClick={() =>
                                      void toggleWishlist(
                                        user,
                                        skill
                                      )
                                    }
                                    title={
                                      wishlisted
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                    }
                                    aria-label={
                                      wishlisted
                                        ? `Remove ${skill.name} from wishlist`
                                        : `Add ${skill.name} to wishlist`
                                    }
                                  >
                                    {wishlisted
                                      ? "♥"
                                      : "♡"}
                                  </button>
                                )}
                              </div>
                            );
                          }
                        )}

                        {remainingTeachSkills >
                          0 && (
                          <button
                            type="button"
                            className="show-more-skills"
                            onClick={() =>
                              toggleSkills(
                                user.uid,
                                "teach"
                              )
                            }
                          >
                            {teachExpanded
                              ? "Show less"
                              : `+${remainingTeachSkills} more`}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="empty-skill-text">
                        No teaching skills added
                      </span>
                    )}
                  </div>
                </div>

                {/* ==================================
                    WANTS TO LEARN
                ================================== */}

                <div className="discover-skill-section">
                  <div className="discover-section-title">
                    <div className="discover-section-label">
                      <span className="discover-section-icon learn-icon">
                        ↘
                      </span>

                      <span>
                        Wants to Learn
                      </span>
                    </div>

                    <span className="discover-skill-count">
                      {user.skillsToLearn.length}
                    </span>
                  </div>

                  <div className="skill-tags">
                    {user.skillsToLearn.length > 0 ? (
                      <>
                        {visibleLearnSkills.map(
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
                        )}

                        {remainingLearnSkills >
                          0 && (
                          <button
                            type="button"
                            className="show-more-skills"
                            onClick={() =>
                              toggleSkills(
                                user.uid,
                                "learn"
                              )
                            }
                          >
                            {learnExpanded
                              ? "Show less"
                              : `+${remainingLearnSkills} more`}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="empty-skill-text">
                        No learning skills added
                      </span>
                    )}
                  </div>
                </div>

                {/* ==================================
                    CARD FOOTER
                ================================== */}

                <div className="discover-card-footer">
                  <button
                    type="button"
                    className="connect-button"
                    onClick={() =>
                      navigate(
                        `/profile/user/${user.uid}`
                      )
                    }
                  >
                    <span>View Profile</span>

                    <span className="connect-button-arrow">
                      →
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Discover;
