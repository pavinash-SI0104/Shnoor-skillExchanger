import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { auth } from "../config/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Login loading state
  const [loading, setLoading] = useState(false);

  // Forgot password loading state
  const [resetLoading, setResetLoading] =
    useState(false);

  // Show / hide password
  const [showPassword, setShowPassword] =
    useState(false);

  // Messages
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] =
    useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const googleProvider = new GoogleAuthProvider();

  const redirectTo =
    (
      location.state as {
        from?: { pathname?: string };
      } | null
    )?.from?.pathname || "/dashboard";

  // =========================
  // SESSION EXPIRATION MESSAGE
  // =========================

  useEffect(() => {
    const sessionExpired =
      sessionStorage.getItem(
        "session-expired"
      );

    if (sessionExpired === "true") {
      setError(
        "Your session has expired. You were logged out because there was no activity for 30 minutes. Please log in again."
      );

      sessionStorage.removeItem(
        "session-expired"
      );
    }
  }, []);

  // =========================
  // LOGIN
  // =========================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setResetMessage("");

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err
          ? String(err.code)
          : "";

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError(
          "Invalid email or password."
        );
      } else if (
        code === "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else if (
        code === "auth/too-many-requests"
      ) {
        setError(
          "Too many attempts. Please try again later."
        );
      } else {
        setError(
          "Login failed. Please try again."
        );
      }

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin = async () => {
    setError("");
    setResetMessage("");

    try {
      setLoading(true);

      await signInWithPopup(
        auth,
        googleProvider
      );

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err
          ? String(err.code)
          : "";

      if (
        code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Google login was cancelled."
        );
      } else if (
        code === "auth/popup-blocked"
      ) {
        setError(
          "Google login popup was blocked. Please allow popups and try again."
        );
      } else {
        setError(
          "Google login failed. Please try again."
        );
      }

      console.error(
        "Google login error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!email.trim()) {
      setError(
        "Please enter your email address first."
      );
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      setResetMessage(
        "Password reset email sent. Please check your inbox."
      );
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err
          ? String(err.code)
          : "";

      if (
        code === "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else if (
        code === "auth/user-not-found"
      ) {
        setError(
          "No account found with this email address."
        );
      } else if (
        code === "auth/too-many-requests"
      ) {
        setError(
          "Too many requests. Please try again later."
        );
      } else {
        setError(
          "Unable to send password reset email. Please try again."
        );
      }

      console.error(
        "Password reset error:",
        err
      );
    } finally {
      setResetLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}

        <div className="login-left">
          <div className="brand">
            Skill<span>Exchanger</span>
          </div>

          <h1>
            Exchange Skills.
            <br />
            Grow Together.
          </h1>

          <p>
            Share what you know, learn what you
            love, and connect with people who
            share your interests.
          </p>
        </div>

        {/* RIGHT SIDE */}

        <div className="login-right">
          <div className="login-box">

            <h2>
              Welcome Back 👋
            </h2>

            <p className="login-subtitle">
              Sign in to continue to Skill
              Exchanger
            </p>

            {/* ERROR / SESSION MESSAGE */}

            {error && (
              <div
                className="error-message"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {resetMessage && (
              <div
                className="success-message"
                role="status"
              >
                {resetMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      paddingRight: "45px",
                      boxSizing:
                        "border-box",
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
                      position:
                        "absolute",
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

                {/* FORGOT PASSWORD */}

                <div
                  style={{
                    textAlign: "right",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      handleForgotPassword
                    }
                    disabled={
                      resetLoading
                    }
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#2563eb",
                      cursor:
                        resetLoading
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {resetLoading
                      ? "Sending..."
                      : "Forgot Password?"}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

              {/* GOOGLE LOGIN */}

              <button
                type="button"
                className="google-login-button"
                onClick={
                  handleGoogleLogin
                }
                disabled={loading}
              >
                <svg
                  className="google-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.5z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.88H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.12l3.25-2.53z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.38l3.25 2.53C6.31 8.1 8.46 6.38 12 6.38z"
                  />
                </svg>

                <span>
                  {loading
                    ? "Signing in..."
                    : "Continue with Google"}
                </span>
              </button>
            </form>

            {/* REGISTER */}

            <p className="register-text">
              Don't have an account?{" "}

              <Link to="/register">
                Create an account
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;

