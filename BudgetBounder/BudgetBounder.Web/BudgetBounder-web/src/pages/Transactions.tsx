import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
  category: string;
  date: string;
  userId: number;
}

interface TransactionForm {
  title: string;
  amount: string;
  type: string;
  category: string;
  date: string;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<TransactionForm>({
    title: "",
    amount: "",
    type: "1",
    category: "",
    date: todayISO(),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<Transaction[]>(`/transactions/user/${user.id}`)
      .then((res) => setTransactions(res.data))
      .catch(() => setError("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    try {
      const res = await api.post<Transaction>("/transactions", {
        title: form.title,
        amount: parseFloat(form.amount),
        type: parseInt(form.type),
        category: form.category,
        date: form.date,
        userId: user.id,
      });
      setTransactions((prev) => [res.data, ...prev]);
      setForm({ title: "", amount: "", type: "1", category: "", date: todayISO() });
    } catch {
      setError("Failed to add transaction");
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete transaction");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <main>
      <h1>BudgetBounder</h1>
      <h2>Transactions</h2>
      <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

      <section>
        <h3>Add Transaction</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="0">Income</option>
              <option value="1">Expense</option>
            </select>
          </div>
          <div>
            <label>Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">Add Transaction</button>
        </form>
      </section>

      <section>
        <h3>My Transactions</h3>
        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {transactions.map((t) => (
              <li key={t.id}>
                <strong>{t.title}</strong>
                <span> — ${t.amount.toFixed(2)}</span>
                <span> | {t.category}</span>
                <span> | {formatDate(t.date)}</span>
                <span
                  style={{
                    color: t.type === 0 ? "green" : "red",
                    fontWeight: "bold",
                    marginLeft: 8,
                  }}
                >
                  {t.type === 0 ? "Income" : "Expense"}
                </span>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={{ marginLeft: 12 }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
