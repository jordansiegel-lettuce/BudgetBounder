import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await api.post("/users/login", { email, password });
      if (response.data.user?.role !== "Admin") {
        setError("This portal is restricted to BudgetBounder administrators.");
        return;
      }
      login(response.data.token);
      navigate("/overview");
    } catch {
      setError("Secure access failed. Check your administrator credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="admin-login">
    <section className="login-brand">
      <div className="pixel-brand large">BB<br />ADMIN</div>
      <h1>Control the system.<br />Protect the player.</h1>
      <p>Secure operations for users, healthy missions, rewards and platform integrity.</p>
    </section>
    <section className="auth-card panel">
      <span className="mono-label green">AUTHORIZED OPERATORS</span>
      <h2>Secure admin access</h2>
      <p>Use an administrator account issued by BudgetBounder.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Administrator email</label><input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@budgetbounder.app" required /></div>
        <div className="form-group"><label>Password</label><input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required /></div>
        {(error || params.get("reason") === "admin") && <p className="form-error">{error ?? "Administrator permissions are required."}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "VERIFYING…" : "ENTER OPERATIONS"}</button>
      </form>
      <p className="auth-footer">Protected by role-based API authorization and audit logging.</p>
    </section>
  </main>;
}
