import { auth } from "../config/firebase";

function AdminProfile() {
  const user = auth.currentUser;

  const adminName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Admin";

  const adminEmail =
    user?.email || "Not available";

  const adminUid =
    user?.uid || "Not available";

  return (
    <div>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-heading">
        <div>
          <h1>Admin Profile</h1>

          <p>
            View your administrator account
            information.
          </p>
        </div>
      </div>

      {/* ======================================
          PROFILE CARD
      ====================================== */}

      <div className="dashboard-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          {/* AVATAR */}

          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.7rem",
              fontWeight: 700,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={adminName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              adminName
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          {/* NAME */}

          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              {adminName}
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color:
                  "var(--muted)",
              }}
            >
              Administrator
            </p>
          </div>
        </div>

        {/* ======================================
            ACCOUNT INFORMATION
        ====================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "18px",
          }}
        >
          {/* NAME */}

          <div>
            <strong>Name</strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "var(--muted)",
              }}
            >
              {adminName}
            </p>
          </div>

          {/* EMAIL */}

          <div>
            <strong>Email</strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "var(--muted)",
              }}
            >
              {adminEmail}
            </p>
          </div>

          {/* ROLE */}

          <div>
            <strong>Role</strong>

            <p
              style={{
                margin:
                  "6px 0 0",
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
                  background:
                    "rgba(79, 156, 249, 0.12)",
                  color:
                    "#4f9cf9",
                  fontSize:
                    "0.82rem",
                  fontWeight: 600,
                }}
              >
                Administrator
              </span>
            </p>
          </div>

          {/* STATUS */}

          <div>
            <strong>
              Authentication Status
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
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
                  background:
                    "rgba(34, 197, 94, 0.12)",
                  color:
                    "#16a34a",
                  fontSize:
                    "0.82rem",
                  fontWeight: 600,
                }}
              >
                Authenticated
              </span>
            </p>
          </div>

          {/* UID */}

          <div
            style={{
              gridColumn:
                "1 / -1",
            }}
          >
            <strong>
              User ID
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "var(--muted)",
                wordBreak:
                  "break-all",
                fontSize:
                  "0.9rem",
              }}
            >
              {adminUid}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
