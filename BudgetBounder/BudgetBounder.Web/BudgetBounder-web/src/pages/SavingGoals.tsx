import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      .get<SavingGoal[]>(`/savingoals/user/${user.id}`)
      .then((res: { data: SavingGoal[] }) => setGoals(res.data))
      .catch(() => setError("Failed to load saving goals"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    try {
      const res = await api.post<SavingGoal>("/savingoals", {
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
        `/savingoals/${goal.id}/progress?amountToAdd=${amount}`
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
    return new Date(dateStr).toLocaleDateString();
  }

  function progressPercent(goal: SavingGoal) {
    if (goal.targetAmount === 0) return 100;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }

  return (
    <main>
      <h1>BudgetBounder</h1>
      <h2>Saving Goals</h2>
      <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

      <section>
        <h3>Create New Goal</h3>
        <form onSubmit={handleCreateGoal}>
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
            <label>Target Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">Create Goal</button>
        </form>
      </section>

      <section>
        <h3>My Goals</h3>
        {loading ? (
          <p>Loading...</p>
        ) : goals.length === 0 ? (
          <p>No saving goals yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {goals.map((g) => {
              const pct = progressPercent(g);
              const isOpen = g.id in progressInputs;
              return (
                <li
                  key={g.id}
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <strong>{g.title}</strong>
                    <span
                      style={{
                        marginLeft: 12,
                        color: g.isCompleted ? "green" : "#888",
                        fontWeight: "bold",
                      }}
                    >
                      {g.isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <div>
                    ${g.currentAmount.toFixed(2)} / ${g.targetAmount.toFixed(2)} — Deadline:{" "}
                    {formatDate(g.deadline)}
                  </div>
                  <div
                    style={{
                      margin: "8px 0",
                      background: "#eee",
                      borderRadius: 4,
                      height: 12,
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        background: g.isCompleted ? "green" : "#4a90d9",
                        height: "100%",
                        borderRadius: 4,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>{pct}%</div>

                  {justCompleted.has(g.id) && (
                    <p style={{ color: "green", fontWeight: "bold" }}>
                      Congratulations! Goal completed — +100 XP earned!
                    </p>
                  )}

                  {!g.isCompleted && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => toggleProgressInput(g.id)}>
                        {isOpen ? "Cancel" : "Add Progress"}
                      </button>
                      {isOpen && (
                        <span style={{ marginLeft: 8 }}>
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
                            style={{ width: 100, marginRight: 8 }}
                          />
                          <button onClick={() => handleAddProgress(g)}>Save</button>
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
