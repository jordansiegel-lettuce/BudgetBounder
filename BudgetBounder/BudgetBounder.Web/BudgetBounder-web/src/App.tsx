import { useEffect, useState } from "react";
import type { User } from "./types/User";
import "./App.css"
function App() {
  return (
    <main>
      <h1>BudgetBounder</h1>
      <p>Frontend is connected and ready.</p>
    </main>
  );
}
const API_URL = "http://localhost:5292/api";
const [users, setUsers] = useState<User[]>([]);
export default App;