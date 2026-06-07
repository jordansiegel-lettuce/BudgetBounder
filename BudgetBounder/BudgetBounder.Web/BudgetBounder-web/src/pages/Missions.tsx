import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Mission {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  difficulty: "Easy" | "Medium" | "Hard";
  missionType: string;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  expiresAt: string;
  isAiGenerated: boolean;
}

const difficultyStyle: Record<string, React.CSSProperties> = {
  Easy:   { background: "var(--income-bg, #d1fae5)", color: "var(--income-text, #065f46)" },
  Medium: { background: "#fef3c7", color: "#92400e" },
  Hard:   { background: "var(--expense-bg, #fee2e2)", color: "var(--expense-text, #991b1b)" },
};

const frequencyStyle: React.CSSProperties = {
  background: "var(--surface-alt, #ede9fe)",
  color: "var(--accent, #6366f1)",
};

function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const DAILY_TYPES = ["LogExpenses", "LogIncome"];

function isDaily(missionType: string) {
  return DAILY_TYPES.includes(missionType);
}

function MissionCard({
  m,
  completing,
  onComplete,
}: {
  m: Mission;
  completing: number | null;
  onComplete: (id: number) => void;
}) {
  const progress =
    m.targetValue > 0
      ? Math.min(100, Math.round((m.currentProgress / m.targetValue) * 100))
      : 0;
  const days = daysLeft(m.expiresAt);
  const daily = isDaily(m.missionType);

  return (
    <div className="card" style={{ gap: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{m.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>
            {m.description}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          <span className="badge" style={frequencyStyle}>
            {daily ? "Daily" : "Weekly"}
          </span>
          <span className="badge" style={difficultyStyle[m.difficulty] ?? difficultyStyle.Easy}>
            {m.difficulty}
          </span>
          <span className="badge" style={{ background: "var(--surface)", color: "var(--text)" }}>
            +{m.xpReward} XP
          </span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>
        {days === 0
          ? "Expires today"
          : `Expires in ${days} day${days !== 1 ? "s" : ""}`}
        &nbsp;·&nbsp;{m.missionType}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          <span>Progress</span>
          <span>
            {m.currentProgress} / {m.targetValue} ({progress}%)
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--border, #e5e7eb)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent, #6366f1)",
              borderRadius: 3,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn btn-primary"
          onClick={() => onComplete(m.id)}
          disabled={completing === m.id}
          style={{ fontSize: 13 }}
        >
          {completing === m.id ? "Completing…" : "Complete"}
        </button>
      </div>
    </div>
  );
}

function MissionSection({
  title,
  missions,
  completing,
  onComplete,
}: {
  title: string;
  missions: Mission[];
  completing: number | null;
  onComplete: (id: number) => void;
}) {
  if (missions.length === 0) return null;
  return (
    <div className="section">
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {missions.map((m) => (
          <MissionCard key={m.id} m={m} completing={completing} onComplete={onComplete} />
        ))}
      </div>
    </div>
  );
}

export default function Missions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get<Mission[]>(`/missions/user/${user.id}`)
      .then((res) => setMissions(res.data))
      .catch(() => setError("Failed to load missions"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleGenerate() {
    if (!user) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post<Mission[]>(`/missions/generate/${user.id}`);
      // Replace existing AI missions with the new ones; keep static missions intact
      setMissions((prev) => [
        ...prev.filter((m) => !m.isAiGenerated),
        ...res.data,
      ]);
    } catch {
      setError("Failed to generate missions. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleComplete(id: number) {
    setCompleting(id);
    setError(null);
    try {
      await api.post(`/missions/${id}/complete`);
      setMissions((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError("Failed to complete mission.");
    } finally {
      setCompleting(null);
    }
  }

  const daily = missions.filter((m) => !m.isAiGenerated && isDaily(m.missionType));
  const weekly = missions.filter((m) => !m.isAiGenerated && !isDaily(m.missionType));
  const personalGoals = missions.filter((m) => m.isAiGenerated);

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">BudgetBounder</span>
        <div className="topbar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/saving-goals">Saving Goals</Link>
          <Link to="/ai-assistant">AI Assistant</Link>
        </div>
      </nav>
      <main>
        <div className="page-heading">
          <h2>Missions</h2>
          <p>Complete missions to earn XP and level up.</p>
        </div>

        <div className="section">
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 4 }}>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating…" : personalGoals.length === 0 ? "Generate My Missions" : "Re-roll Missions"}
            </button>
          </div>
          {error && (
            <p className="form-error" style={{ marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <p className="empty">Loading…</p>
        ) : (
          <>
            <MissionSection
              title="Daily Missions"
              missions={daily}
              completing={completing}
              onComplete={handleComplete}
            />
            <MissionSection
              title="Weekly Missions"
              missions={weekly}
              completing={completing}
              onComplete={handleComplete}
            />
            <MissionSection
              title="Personal Goals"
              missions={personalGoals}
              completing={completing}
              onComplete={handleComplete}
            />
            {missions.length === 0 && (
              <p className="empty">
                No active missions. Click "Generate My Missions" to get AI-powered challenges!
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
