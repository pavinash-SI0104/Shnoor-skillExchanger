import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function UserRoute() {
  const {
    currentUser,
    role,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <strong>
            Checking your account...
          </strong>

          <span>
            Please wait a moment.
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (role === "admin") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return <Outlet />;
}

export default UserRoute;