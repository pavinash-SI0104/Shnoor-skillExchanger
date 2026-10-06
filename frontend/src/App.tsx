import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";

import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProtectedRoute from "./components/ProtectedRoute";

import MySkills from "./pages/MySkills";
import Discover from "./pages/Discover";
import UserProfile from "./pages/UserProfile";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Matches from "./pages/Matches";
import Sessions from "./pages/Sessions";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Wishlist from "./pages/Wishlist";
import AdminProfile from "./pages/AdminProfile";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";
import AdminRequests from "./pages/AdminRequests";
import AdminMatches from "./pages/AdminMatches";
import AdminSessions from "./pages/AdminSessions";
import AdminReports from "./pages/AdminReports";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/terms"
            element={<TermsAndConditions />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          {/* Protected Routes */}

          <Route element={<ProtectedRoute />}>
          </Route>
            {/* User Dashboard */}
            <Route element={<UserRoute />}>
              <Route element={<DashboardLayout />}>
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />
              </Route>
            </Route>
              <Route
                path="/skills"
                element={<MySkills />}
              />
              <Route
                path="/discover"
                element={<Discover />}
              />
              <Route
                path="/profile/user/:uid"
                element={<UserProfile />}
              />
              <Route
                path="/profile"
                element={<Profile />}
              />
              <Route
                path="/requests"
                element={<Requests />}
              />
              <Route
                path="/matches"
                element={<Matches />}
              />
              <Route
                path="/sessions"
                element={<Sessions />}
              />
              <Route
                path="/chat"
                element={<Chat />}
              />
              <Route
                path="/notifications"
                element={<Notifications />}
              />
              <Route
                path="/wishlist"
                element={<Wishlist />}
              />
              {/* Admin Dashboard */}
<Route element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route
      path="/admin"
      element={<AdminDashboard />}
    />

    <Route
      path="/admin/users"
      element={<AdminUsers />}
    />

    <Route
      path="/admin/requests"
      element={<AdminRequests />}
    />

    <Route
      path="/admin/matches"
      element={<AdminMatches />}
    />
    <Route
    path="/admin/reports"
    element={<AdminReports/>}
    />
    <Route
      path="/admin/profile"
      element={<AdminProfile />}
    />
    <Route
      path="/admin/sessions"
      element={<AdminSessions />}
    />
  </Route>
</Route>
          {/* Fallback */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
