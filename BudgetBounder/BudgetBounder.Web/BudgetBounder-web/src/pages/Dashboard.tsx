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
    <main>
      <h1>BudgetBounder</h1>
      <h2>Dashboard</h2>
      {user && (
        <div>
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Level:</strong> {user.level}</p>
          <p><strong>XP:</strong> {user.xp}</p>
        </div>
      )}
      <nav>
        <Link to="/transactions">Transactions</Link>
        {" | "}
        <Link to="/saving-goals">Saving Goals</Link>
      </nav>
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}
