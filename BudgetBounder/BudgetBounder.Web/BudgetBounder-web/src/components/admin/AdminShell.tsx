import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const items = [
  ["Overview", "/overview"],
  ["Users", "/users"],
  ["Missions", "/missions"],
  ["AI Review", "/ai-review"],
  ["Analytics", "/analytics"],
  ["Game", "/game"],
  ["Rewards", "/rewards"],
  ["Monitoring", "/monitoring"],
  ["Audit log", "/audit-log"],
] as const;

export default function AdminShell() {
  const { user, logout } = useAuth();
  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="pixel-brand">BB<br />ADMIN</div>
      <nav>{items.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <button className="ghost-button" onClick={logout}>Sign out</button>
    </aside>
    <div className="admin-stage">
      <header className="topbar"><span>BudgetBounder Operations</span><div><span className="status-dot" /> API connected <strong>{user?.fullName}</strong></div></header>
      <main className="admin-content"><Outlet /></main>
    </div>
  </div>;
}
