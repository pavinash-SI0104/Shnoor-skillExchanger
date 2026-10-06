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
              PUBLIC ROUTES
          ========================= */}

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

          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

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

            </Route>
          </Route>

          {/* =========================
              UNKNOWN ROUTES
              Return to Landing Page
          ========================= */}

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
