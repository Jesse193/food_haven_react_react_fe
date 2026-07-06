import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../assets/stylesheets/ResetPassword.css"

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [errorMessages, setErrorMessages] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessages([]);

    if (password !== passwordConfirmation) {
      setErrorMessages(["Passwords don't match"]);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE}/api/password_resets/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessages(data.errors ? data.errors : [data.error || "Something went wrong."]);
        setStatus("error");
        return;
      }

      setStatus("done");
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setErrorMessages(["Couldn't reach the server. Please try again."]);
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <div className="password-reset-invalid">
        <h1 >Invalid link</h1>
        <p>
          This password reset link is missing its token. Please request a new one.
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="password-reset-success">
        <h1>Password updated</h1>
        <p>Redirecting you to log in...</p>
      </div>
    );
  }

  return (
    <div className="password-reset">
      <h1>Set a new password</h1>

      <form onSubmit={handleSubmit} >
        <label htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="password_confirmation">
          Confirm new password
        </label>
        <input
          id="password_confirmation"
          type="password"
          required
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />

        {errorMessages.length > 0 && (
          <ul>
            {errorMessages.map((msg, i) => (
              <li >
                {msg}
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;