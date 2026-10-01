import { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    alert("Registration button clicked!");
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Section */}
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

        {/* Right Section */}
        <div className="login-right">
          <div className="login-box">

            <h2>Create Account</h2>

            <p className="login-subtitle">
              Join Skill Exchanger and start learning
            </p>

            <form onSubmit={handleSubmit}>

              {/* Name */}
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

              {/* Email */}
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

              {/* Password */}
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

              {/* Confirm Password */}
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

              {/* Register Button */}
              <button
                type="submit"
                className="login-button"
              >
                Create Account
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