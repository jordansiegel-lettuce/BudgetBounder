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
  return <div className="admin-shell"><a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <div className="pixel-brand">BUDGET BOUNDER</div><span className="brand-caption">YOUR ADMIN CONSOLE</span>
      <nav aria-label="Admin navigation">{items.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <button className="ghost-button" onClick={logout}>Sign out</button>
    </aside>
    <div className="admin-stage">
      <header className="topbar"><span>BudgetBounder Operations</span><div><span className="console-label">ADMIN</span> <strong>{user?.fullName}</strong></div></header>
      <main id="main-content" className="admin-content"><Outlet /></main>
    </div>
  </div>;
}
