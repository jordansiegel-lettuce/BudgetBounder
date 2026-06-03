import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">BudgetBounder</span>
        <div className="topbar-nav">
          <Link to="/transactions">Transactions</Link>
          <Link to="/saving-goals">Saving Goals</Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </div>
      </nav>
      <main>
        <div className="page-heading">
          <h2>Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}!</h2>
          <p>Here's a summary of your account.</p>
        </div>

        {user && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Email</div>
              <div className="stat-value" style={{ fontSize: 15, fontWeight: 500 }}>{user.email}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Level</div>
              <div className="stat-value">{user.level}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">XP</div>
              <div className="stat-value">{user.xp}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/transactions" className="btn btn-primary">View Transactions</Link>
          <Link to="/saving-goals" className="btn btn-ghost">Saving Goals</Link>
        </div>
      </main>
    </>
  );
}
