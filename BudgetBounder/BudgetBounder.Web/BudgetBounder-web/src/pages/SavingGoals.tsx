import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface SavingGoal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
  userId: number;
}

interface GoalForm {
  title: string;
  targetAmount: string;
  deadline: string;
}

export default function SavingGoals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [form, setForm] = useState<GoalForm>({ title: "", targetAmount: "", deadline: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressInputs, setProgressInputs] = useState<Record<number, string>>({});
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    api
      .get<SavingGoal[]>(`/savinggoals/user/${user.id}`)
      .then((res: { data: SavingGoal[] }) => setGoals(res.data))
      .catch(() => setError("Failed to load saving goals"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    try {
      const res = await api.post<SavingGoal>("/savinggoals", {
        title: form.title,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: 0,
        deadline: form.deadline,
        isCompleted: false,
        userId: user.id,
      });
      setGoals((prev) => [res.data, ...prev]);
      setForm({ title: "", targetAmount: "", deadline: "" });
    } catch {
      setError("Failed to create goal");
    }
  }

  function toggleProgressInput(id: number) {
    setProgressInputs((prev) => {
      if (id in prev) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: "" };
    });
  }

  async function handleAddProgress(goal: SavingGoal) {
    const amount = parseFloat(progressInputs[goal.id]);
    if (!amount || amount <= 0) return;
    setError(null);
    try {
      const res = await api.put<SavingGoal>(
        `/savinggoals/${goal.id}/progress?amountToAdd=${amount}`
      );
      const updated = res.data;
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
      if (!goal.isCompleted && updated.isCompleted) {
        setJustCompleted((prev) => new Set(prev).add(goal.id));
      }
      setProgressInputs((prev) => {
        const next = { ...prev };
        delete next[goal.id];
        return next;
      });
    } catch {
      setError("Failed to update progress");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function progressPercent(goal: SavingGoal) {
    if (goal.targetAmount === 0) return 100;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">BudgetBounder</span>
        <div className="topbar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
        </div>
      </nav>
      <main>
        <div className="page-heading">
          <h2>Saving Goals</h2>
          <p>Set goals, track progress, and earn XP when you complete them.</p>
        </div>

        <div className="section">
          <div className="card">
            <h3>New Goal</h3>
            <form onSubmit={handleCreateGoal}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Emergency fund…"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    placeholder="1000.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </div>
              {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}
            </form>
          </div>
        </div>

        <div className="section">
          <h3>My Goals</h3>
          {loading ? (
            <p className="empty">Loading…</p>
          ) : goals.length === 0 ? (
            <p className="empty">No goals yet. Create one above.</p>
          ) : (
            <ul className="goals-list">
              {goals.map((g) => {
                const pct = progressPercent(g);
                const isOpen = g.id in progressInputs;
                return (
                  <li key={g.id} className="goal-card">
                    <div className="goal-header">
                      <span className="goal-title">{g.title}</span>
                      <span className={`badge ${g.isCompleted ? "badge-completed" : "badge-in-progress"}`}>
                        {g.isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    <div className="goal-amounts">
                      <strong>${g.currentAmount.toFixed(2)}</strong>
                      {" / "}
                      ${g.targetAmount.toFixed(2)} saved
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill${g.isCompleted ? " complete" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="goal-pct">{pct}%</div>

                    <div className="goal-meta">Deadline: {formatDate(g.deadline)}</div>

                    {justCompleted.has(g.id) && (
                      <p className="congrats">
                        Congratulations! Goal completed — +100 XP earned!
                      </p>
                    )}

                    {!g.isCompleted && (
                      <div className="goal-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleProgressInput(g.id)}
                        >
                          {isOpen ? "Cancel" : "Add Progress"}
                        </button>
                        {isOpen && (
                          <>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Amount"
                              value={progressInputs[g.id]}
                              onChange={(e) =>
                                setProgressInputs((prev) => ({
                                  ...prev,
                                  [g.id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddProgress(g)}
                            >
                              Save
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
