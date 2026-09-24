import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { username, password });
      localStorage.setItem(
        "token",
        response.data.accessToken || response.data.token || "demo-token"
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      onLogin();
      navigate("/products");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={submit}>
        <h1>Product Admin</h1>
        <p>Login to manage products.</p>

        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <button className="primary full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <small>Demo login: emilys / emilyspass</small>
      </form>
    </div>
  );
}
