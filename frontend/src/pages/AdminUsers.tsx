import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  skillsToTeach: number;
  skillsToLearn: number;
  expertiseLevel: string;
  interests: string[];
  createdAt: any;
}

interface AdminUserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  expertiseLevel: string;
  interests: string[];
  skillsToTeach: any[];
  skillsToLearn: any[];
  createdAt: any;
  photoURL?: string;
  bio?: string;
}

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);

  const [viewingUserId, setViewingUserId] =
    useState<string | null>(null);

  const [selectedUser, setSelectedUser] =
    useState<AdminUserDetails | null>(null);

  const [viewLoading, setViewLoading] =
    useState(false);

  const [viewError, setViewError] =
    useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/users");

      if (response.data?.success) {
        setUsers(
          response.data.users || []
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load users."
        );
      }
    } catch (err: any) {
      console.error(
        "Admin users error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ======================================
   * VIEW USER
   * ======================================
   */

  const handleViewUser = async (
    userId: string
  ) => {
    try {
      setViewingUserId(userId);
      setSelectedUser(null);
      setViewError("");
      setViewLoading(true);
    } catch (error) {
      console.error(
        "View user error:",
        error
      );
    }

    try {
      const response =
        await api.get(
          `/admin/users/${userId}`
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load user details."
        );
      }

      setSelectedUser(
        response.data.user
      );
    } catch (err: any) {
      console.error(
        "View user error:",
        err
      );

      setViewError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load user details."
      );
    } finally {
      setViewLoading(false);
    }
  };

  const closeUserDetails = () => {
    setViewingUserId(null);
    setSelectedUser(null);
    setViewError("");
  };

  /*
   * ======================================
   * ACTIVATE / DEACTIVATE USER
   * ======================================
   */

  const handleStatusChange = async (
    user: AdminUser
  ) => {
    try {
      setUpdatingUserId(user.id);

      setError("");

      const newStatus =
        !user.isActive;

      const response =
        await api.patch(
          `/admin/users/${user.id}/status`,
          {
            isActive: newStatus,
          }
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update user status."
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map(
          (currentUser) =>
            currentUser.id === user.id
              ? {
                  ...currentUser,
                  isActive: newStatus,
                }
              : currentUser
        )
      );

      setSelectedUser(
        (currentSelectedUser) =>
          currentSelectedUser &&
          currentSelectedUser.id === user.id
            ? {
                ...currentSelectedUser,
                isActive: newStatus,
              }
            : currentSelectedUser
      );
    } catch (err: any) {
      console.error(
        "User status update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update user status."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.name
          .toLowerCase()
          .includes(searchValue) ||
        user.email
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.isActive) ||
        (statusFilter === "inactive" &&
          !user.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  /*
   * ======================================
   * LOADING STATE
   * ======================================
   */

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Users</h1>

            <p>
              Manage users registered on the
              platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-state">
            <strong>
              Loading users...
            </strong>

            <span>
              Please wait a moment.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ======================================
   * ERROR STATE
   * ======================================
   */

  if (error && users.length === 0) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Users</h1>

            <p>
              Manage users registered on the
              platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="error-message">
            {error}
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={loadUsers}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-heading">
        <div>
          <h1>Users</h1>

          <p>
            View and manage registered
            Skill Exchanger users.
          </p>
        </div>
      </div>

      {/* ======================================
          USERS TABLE
      ====================================== */}

      <div className="dashboard-card">
        <div className="card-header">
          <h3>All Users</h3>

          <span>
            {filteredUsers.length} of{" "}
            {users.length} users
          </span>
        </div>

        {error && (
          <div
            className="error-message"
            style={{
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1fr) 180px 180px",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name or email..."
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border:
                "1px solid var(--border)",
              background:
                "var(--surface)",
              color: "var(--text)",
              outline: "none",
            }}
          />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border:
                "1px solid var(--border)",
              background:
                "var(--surface)",
              color: "var(--text)",
              outline: "none",
            }}
          >
            <option value="all">
              All Roles
            </option>

            <option value="user">
              Users
            </option>

            <option value="admin">
              Administrators
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border:
                "1px solid var(--border)",
              background:
                "var(--surface)",
              color: "var(--text)",
              outline: "none",
            }}
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              🔎
            </div>

            <strong>
              No matching users
            </strong>

            <span>
              Try changing your search or
              filters.
            </span>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding:
                        "14px 12px",
                    }}
                  >
                    User
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding:
                        "14px 12px",
                    }}
                  >
                    Role
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding:
                        "14px 12px",
                    }}
                  >
                    Status
                  </th>

                  <th
                    style={{
                      textAlign: "center",
                      padding:
                        "14px 12px",
                    }}
                  >
                    Teach
                  </th>

                  <th
                    style={{
                      textAlign: "center",
                      padding:
                        "14px 12px",
                    }}
                  >
                    Learn
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding:
                        "14px 12px",
                    }}
                  >
                    Expertise
                  </th>

                  <th
                    style={{
                      textAlign: "center",
                      padding:
                        "14px 12px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => (
                    <tr key={user.id}>
                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        <div>
                          <strong>
                            {user.name ||
                              "Unnamed User"}
                          </strong>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "0.82rem",
                              color:
                                "var(--muted)",
                            }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        {user.role}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 10px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "0.8rem",
                            fontWeight: 600,
                            background:
                              user.isActive
                                ? "rgba(34, 197, 94, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                            color:
                              user.isActive
                                ? "#16a34a"
                                : "#dc2626",
                          }}
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                          textAlign:
                            "center",
                        }}
                      >
                        {user.skillsToTeach}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                          textAlign:
                            "center",
                        }}
                      >
                        {user.skillsToLearn}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        {user.expertiseLevel ||
                          "Not specified"}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                          textAlign:
                            "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "center",
                            gap: "8px",
                          }}
                        >
                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewUser(
                                user.id
                              )
                            }
                            disabled={
                              viewingUserId ===
                              user.id
                            }
                            style={{
                              padding:
                                "8px 12px",
                              borderRadius:
                                "8px",
                              border:
                                "1px solid var(--border)",
                              cursor:
                                viewingUserId ===
                                user.id
                                  ? "not-allowed"
                                  : "pointer",
                              background:
                                "var(--surface)",
                              color:
                                "var(--text)",
                              fontWeight: 600,
                              opacity:
                                viewingUserId ===
                                user.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {viewingUserId ===
                            user.id
                              ? "Loading..."
                              : "View"}
                          </button>

                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                user
                              )
                            }
                            disabled={
                              updatingUserId ===
                              user.id
                            }
                            style={{
                              padding:
                                "8px 12px",
                              borderRadius:
                                "8px",
                              border: "none",
                              cursor:
                                updatingUserId ===
                                user.id
                                  ? "not-allowed"
                                  : "pointer",
                              background:
                                user.isActive
                                  ? "#fee2e2"
                                  : "#dcfce7",
                              color:
                                user.isActive
                                  ? "#b91c1c"
                                  : "#15803d",
                              fontWeight: 600,
                              opacity:
                                updatingUserId ===
                                user.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {updatingUserId ===
                            user.id
                              ? "Updating..."
                              : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================
          USER DETAILS MODAL
      ====================================== */}

      {viewingUserId && (
        <div
          onClick={closeUserDetails}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              background:
                "var(--surface)",
              border:
                "1px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent:
                  "space-between",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  User Details
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "var(--muted)",
                  }}
                >
                  Detailed information
                  about this user.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeUserDetails
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color:
                    "var(--muted)",
                  fontSize:
                    "1.5rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {viewLoading ? (
              <div
                className="empty-state"
              >
                <strong>
                  Loading user details...
                </strong>

                <span>
                  Please wait a moment.
                </span>
              </div>
            ) : viewError ? (
              <div>
                <div className="error-message">
                  {viewError}
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    viewingUserId &&
                    handleViewUser(
                      viewingUserId
                    )
                  }
                >
                  Try Again
                </button>
              </div>
            ) : selectedUser ? (
              <div>
                {/* PROFILE */}

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "16px",
                    padding:
                      "18px",
                    border:
                      "1px solid var(--border)",
                    borderRadius:
                      "12px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius:
                        "50%",
                      background:
                        "var(--primary)",
                      color: "#fff",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize:
                        "1.5rem",
                      fontWeight: 700,
                      overflow:
                        "hidden",
                    }}
                  >
                    {selectedUser.photoURL ? (
                      <img
                        src={
                          selectedUser.photoURL
                        }
                        alt={
                          selectedUser.name ||
                          "User"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      selectedUser.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                      "U"
                    )}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      {selectedUser.name ||
                        "Unnamed User"}
                    </h3>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color:
                          "var(--muted)",
                      }}
                    >
                      {
                        selectedUser.email
                      }
                    </p>
                  </div>
                </div>

                {/* BASIC INFORMATION */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "14px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div>
                    <strong>
                      Role
                    </strong>

                    <p>
                      {selectedUser.role}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Status
                    </strong>

                    <p>
                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "5px 10px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "0.8rem",
                          fontWeight: 600,
                          background:
                            selectedUser.isActive
                              ? "rgba(34, 197, 94, 0.12)"
                              : "rgba(239, 68, 68, 0.12)",
                          color:
                            selectedUser.isActive
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {selectedUser.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <strong>
                      Expertise Level
                    </strong>

                    <p>
                      {selectedUser
                        .expertiseLevel ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Account Created
                    </strong>

                    <p>
                      {selectedUser.createdAt
                        ? new Date(
                            selectedUser.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                </div>

                {/* BIO */}

                {selectedUser.bio && (
                  <div
                    style={{
                      marginBottom:
                        "20px",
                    }}
                  >
                    <h3>Bio</h3>

                    <p
                      style={{
                        color:
                          "var(--muted)",
                        lineHeight:
                          1.6,
                      }}
                    >
                      {selectedUser.bio}
                    </p>
                  </div>
                )}

                {/* INTERESTS */}

                <div
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3>Interests</h3>

                  {selectedUser.interests
                    .length === 0 ? (
                    <p
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      No interests added.
                    </p>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "8px",
                      }}
                    >
                      {selectedUser.interests.map(
                        (
                          interest,
                          index
                        ) => (
                          <span
                            key={`${interest}-${index}`}
                            style={{
                              padding:
                                "7px 11px",
                              borderRadius:
                                "999px",
                              background:
                                "var(--background)",
                              border:
                                "1px solid var(--border)",
                              fontSize:
                                "0.85rem",
                            }}
                          >
                            {interest}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* SKILLS TO TEACH */}

                <div
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3>
                    Skills to Teach
                  </h3>

                  {selectedUser
                    .skillsToTeach
                    .length === 0 ? (
                    <p
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      No teaching skills
                      added.
                    </p>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "8px",
                      }}
                    >
                      {selectedUser.skillsToTeach.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={index}
                            style={{
                              padding:
                                "7px 11px",
                              borderRadius:
                                "999px",
                              background:
                                "rgba(79, 156, 249, 0.12)",
                              border:
                                "1px solid rgba(79, 156, 249, 0.25)",
                              fontSize:
                                "0.85rem",
                            }}
                          >
                            {typeof skill ===
                            "string"
                              ? skill
                              : skill?.name ||
                                skill?.title ||
                                "Skill"}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* SKILLS TO LEARN */}

                <div
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3>
                    Skills to Learn
                  </h3>

                  {selectedUser
                    .skillsToLearn
                    .length === 0 ? (
                    <p
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      No learning skills
                      added.
                    </p>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "8px",
                      }}
                    >
                      {selectedUser.skillsToLearn.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={index}
                            style={{
                              padding:
                                "7px 11px",
                              borderRadius:
                                "999px",
                              background:
                                "rgba(168, 85, 247, 0.12)",
                              border:
                                "1px solid rgba(168, 85, 247, 0.25)",
                              fontSize:
                                "0.85rem",
                            }}
                          >
                            {typeof skill ===
                            "string"
                              ? skill
                              : skill?.name ||
                                skill?.title ||
                                "Skill"}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: "10px",
                    paddingTop:
                      "8px",
                    borderTop:
                      "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      closeUserDetails
                    }
                    className="primary-button"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;