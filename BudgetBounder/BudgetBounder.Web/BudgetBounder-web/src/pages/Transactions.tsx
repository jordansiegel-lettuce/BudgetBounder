import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'Income' | 'Expense';
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
      .then((res: { data: Transaction[] }) => setTransactions(res.data))
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
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">BudgetBounder</span>
        <div className="topbar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/saving-goals">Saving Goals</Link>
        </div>
      </nav>
      <main>
        <div className="page-heading">
          <h2>Transactions</h2>
          <p>Track your income and expenses.</p>
        </div>

        <div className="section">
          <div className="card">
            <h3>Add Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Coffee, Salary…"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="0">Income</option>
                    <option value="1">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Food, Rent…"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </div>
              {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}
            </form>
          </div>
        </div>

        <div className="section">
          <h3>History</h3>
          {loading ? (
            <p className="empty">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="empty">No transactions yet. Add one above.</p>
          ) : (
            <ul className="tx-list">
              {transactions.map((t) => (
                <li key={t.id} className="tx-item">
                  <span className="tx-title">{t.title}</span>
                  <span className="tx-meta">{t.category}</span>
                  <span className="tx-meta">{formatDate(t.date)}</span>
                  <span className="tx-amount">${t.amount.toFixed(2)}</span>
                  <span className={`badge ${t.type === 'Income' ? "badge-income" : "badge-expense"}`}>
                    {t.type === 'Income' ? "Income" : "Expense"}
                  </span>
                  <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
