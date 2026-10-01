import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    setLoading(true);

    // Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Save display name in Firebase Authentication
    await updateProfile(user, {
      displayName: name,
    });

    // Get Firebase ID token
    const token = await user.getIdToken();

    // Create user profile in Firestore through backend
    const response = await fetch(
      "http://localhost:5000/api/users/profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Profile creation failed:", data);
      throw new Error(
        data.message || "Failed to create user profile"
      );
    }

    console.log("Firebase user:", user);
    console.log("Firestore profile:", data.user);

    alert("Account created successfully!");

    window.location.href = "/login";
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === "auth/email-already-in-use") {
      alert("This email is already registered.");
    } else if (error.code === "auth/weak-password") {
      alert("Password should be at least 6 characters.");
    } else if (error.code === "auth/invalid-email") {
      alert("Please enter a valid email address.");
    } else {
      alert(
        error.message ||
          "Registration failed. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand">
            Skill<span>Exchanger</span>
          </div>

          <h1>
            Share Skills.
            <br />
            Learn Together.
          </h1>

          <p>
            Join a community where people teach what they know
            and learn skills from others.
          </p>
        </div>

        <div className="login-right">
          <div className="login-box">

            <h2>Create Account</h2>

            <p className="login-subtitle">
              Join Skill Exchanger and start learning
            </p>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email</label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password</label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

            </form>

            <p className="register-text">
              Already have an account?
              <a href="/login"> Login</a>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;