import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main>
      <h1>BudgetBounder</h1>
      <h2>Dashboard</h2>
      {user && (
        <p>
          Welcome, <strong>{user.fullName}</strong>! Level {user.level} — {user.xp} XP
        </p>
      )}
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}
