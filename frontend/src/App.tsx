import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";

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
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* =========================
            MAIN APPLICATION
        ========================= */}

        <Route element={<DashboardLayout />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Skills */}
          <Route
            path="/skills"
            element={<MySkills />}
          />

          {/* Discover Users */}
          <Route
            path="/discover"
            element={<Discover />}
          />

          {/* Other User Profile */}
          <Route
            path="/profile/user"
            element={<UserProfile />}
          />

          {/* My Profile */}
          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* Exchange Requests */}
          <Route
            path="/requests"
            element={<Requests />}
          />

          {/* Skill Matches */}
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;