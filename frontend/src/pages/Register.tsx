import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import api from "../api/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Terms & Privacy agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // =========================
    // VALIDATION
    // =========================

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    setLoading(true);

    try {
      // =========================
      // CREATE FIREBASE ACCOUNT
      // =========================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );

      const user = userCredential.user;

      // =========================
      // SAVE DISPLAY NAME
      // =========================

      await updateProfile(user, {
        displayName: trimmedName,
      });

      // =========================
      // GET FRESH FIREBASE TOKEN
      // =========================

      const token = await user.getIdToken(true);

      // =========================
      // SAVE PROFILE TO BACKEND
      // =========================

      await api.post(
        "/users/profile",
        {
          name: trimmedName,
          email: trimmedEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =========================
      // SUCCESS
      // =========================

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      await auth.signOut();

      navigate("/login", {
        replace: true,
      });
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err
          ? String(err.code)
          : "";

      if (code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        setError(
          "Your authentication account was created, but your profile could not be saved. Please try logging in or contact support."
        );
      } else {
        setError("Registration failed. Please try again.");
      }

      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* =========================
            LEFT SIDE
        ========================== */}

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

        {/* =========================
            RIGHT SIDE
        ========================== */}

        <div className="login-right">
          <div className="login-box">

            <h2>Create Account</h2>

            <p className="login-subtitle">
              Join Skill Exchanger and start learning
            </p>

            {/* =========================
                ERROR MESSAGE
            ========================== */}

            {error && (
              <div
                className="error-message"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* =========================
                SUCCESS MESSAGE
            ========================== */}

            {success && (
              <div
                className="success-message"
                role="status"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* =========================
                  FULL NAME
              ========================== */}

              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  autoComplete="name"
                  required
                />
              </div>

              {/* =========================
                  EMAIL
              ========================== */}

              <div className="form-group">
                <label htmlFor="register-email">
                  Email
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              {/* =========================
                  PASSWORD
              ========================== */}

              <div className="form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    minLength={6}
                    required
                    style={{
                      width: "100%",
                      paddingRight: "45px",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* SHOW / HIDE PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "transparent",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px",
                    }}
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#666",
                  }}
                >
                  Password must contain at least 6
                  characters.
                </small>
              </div>

              {/* =========================
                  CONFIRM PASSWORD
              ========================== */}

              <div className="form-group">
                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    minLength={6}
                    required
                    style={{
                      width: "100%",
                      paddingRight: "45px",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* SHOW / HIDE CONFIRM PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "transparent",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px",
                    }}
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>
              </div>

              {/* =========================
                  TERMS & PRIVACY
              ========================== */}

              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(event) =>
                    setAgreedToTerms(
                      event.target.checked
                    )
                  }
                  required
                />

                <label htmlFor="terms">
                  I agree to the{" "}
                  <Link to="/terms">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* =========================
                  CREATE ACCOUNT BUTTON
              ========================== */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </form>

            {/* =========================
                LOGIN LINK
            ========================== */}

            <p className="register-text">
              Already have an account?{" "}
              <Link to="/login">
                Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;