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

import DashboardLayout from "./layouts/DashboardLayout";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRequests from "./pages/AdminRequests";
import AdminMatches from "./pages/AdminMatches";
import AdminSessions from "./pages/AdminSessions";
import AdminReports from "./pages/AdminReports";
import AdminProfile from "./pages/AdminProfile";

import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import ProtectedRoute from "./components/ProtectedRoute";
import UserRoute from "./components/UserRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* ======================================
              PUBLIC ROUTES
          ====================================== */}

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

          {/* ======================================
              PROTECTED ROUTES
          ====================================== */}

          <Route element={<ProtectedRoute />}>

            {/* ====================================
                USER ROUTES
            ==================================== */}

            <Route element={<UserRoute />}>

              <Route element={<DashboardLayout />}>

                {/* Dashboard */}

                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                {/* My Skills */}

                <Route
                  path="/skills"
                  element={<MySkills />}
                />

                {/* Discover */}

                <Route
                  path="/discover"
                  element={<Discover />}
                />

                {/* Public User Profile */}

                <Route
                  path="/profile/user/:uid"
                  element={<UserProfile />}
                />

                {/* My Profile */}

                <Route
                  path="/profile"
                  element={<Profile />}
                />

                {/* Requests */}

                <Route
                  path="/requests"
                  element={<Requests />}
                />

                {/* Matches */}

                <Route
                  path="/matches"
                  element={<Matches />}
                />

                {/* Sessions */}

                <Route
                  path="/sessions"
                  element={<Sessions />}
                />

                {/* Chat */}

                <Route
                  path="/chat"
                  element={<Chat />}
                />

                {/* Notifications */}

                <Route
                  path="/notifications"
                  element={<Notifications />}
                />

                {/* Wishlist */}

                <Route
                  path="/wishlist"
                  element={<Wishlist />}
                />

              </Route>

            </Route>

            {/* ====================================
                ADMIN ROUTES
            ==================================== */}

            <Route element={<AdminRoute />}>

              <Route element={<AdminLayout />}>

                {/* Admin Overview */}

                <Route
                  path="/admin"
                  element={<AdminDashboard />}
                />

                {/* Admin Users */}

                <Route
                  path="/admin/users"
                  element={<AdminUsers />}
                />

                {/* Admin Requests */}

                <Route
                  path="/admin/requests"
                  element={<AdminRequests />}
                />

                {/* Admin Matches */}

                <Route
                  path="/admin/matches"
                  element={<AdminMatches />}
                />

                {/* Admin Sessions */}

                <Route
                  path="/admin/sessions"
                  element={<AdminSessions />}
                />

                {/* Admin Reports */}

                <Route
                  path="/admin/reports"
                  element={<AdminReports />}
                />

                {/* Admin Profile */}

                <Route
                  path="/admin/profile"
                  element={<AdminProfile />}
                />

              </Route>

            </Route>

          </Route>

          {/* ======================================
              FALLBACK
          ====================================== */}

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
