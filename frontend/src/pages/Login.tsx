import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    alert("Login button clicked!");
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-left">
          <div className="brand">
            Skill<span>Exchanger</span>
          </div>

          <h1>Exchange Skills.<br />Grow Together.</h1>

          <p>
            Share what you know, learn what you love,
            and connect with people who share your interests.
          </p>
        </div>

        <div className="login-right">

          <div className="login-box">

            <h2>Welcome Back 👋</h2>

            <p className="login-subtitle">
              Sign in to continue to Skill Exchanger
            </p>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="login-options">
                <label>
                  <input type="checkbox" />
                  Remember me
                </label>

                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>

            </form>

            <p className="register-text">
              Don't have an account?
              <a href="/register"> Create an account</a>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;