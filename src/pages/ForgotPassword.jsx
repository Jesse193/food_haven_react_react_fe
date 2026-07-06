import { useState } from "react";
import "../assets/stylesheets/ForgotPassword.css"

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/password_resets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.errors?.[0] || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch (err) {
      setErrorMessage("Couldn't reach the server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="check-email">
        <h1>Check your email</h1>
        <p>
          If an account with that email exists, we've sent password reset instructions.
        </p>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <h1>Reset your password</h1>
      <p>Enter your email and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit}>
        <input
          id="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {status === "error" && <p>{errorMessage}</p>}

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
export default ForgotPassword;