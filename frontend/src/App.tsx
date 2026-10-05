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

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              LANDING PAGE
          ========================== */}

          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* =========================
              AUTHENTICATION PAGES
          ========================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              LEGAL PAGES
          ========================== */}

          <Route
            path="/terms"
            element={<TermsAndConditions />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          {/* =========================
              PROTECTED APPLICATION
          ========================== */}

          <Route element={<ProtectedRoute />}>
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

              {/* Other User Profile */}
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

          {/* =========================
              UNKNOWN URL
          ========================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
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