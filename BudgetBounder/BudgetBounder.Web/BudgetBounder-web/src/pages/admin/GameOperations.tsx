import { useEffect, useState } from "react";
import { Badge, PageHeader, StatCard, StatePanel } from "../../components/admin/AdminUi";
import { adminApi } from "../../services/api";
import type { GameSession } from "../../types/admin";
import { summarizeGameSessions } from "./adminData";

export default function GameOperations() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi.gameSessions().then(setSessions).catch(() => setError("Game sessions could not be loaded.")).finally(() => setLoading(false));
  }, []);
  const summary = summarizeGameSessions(sessions);
  return <>
    <PageHeader eyebrow="UNITY TELEMETRY" title="Game operations" description="Validated Budget Dash results, XP awards and suspicious submissions." />
    <section className="stat-grid"><StatCard label="SESSIONS" value={summary.total} /><StatCard label="VALID" value={summary.valid} tone="green" /><StatCard label="FLAGGED" value={summary.flagged} tone="gold" /><StatCard label="XP AWARDED" value={summary.awardedXp} tone="violet" /></section>
    {loading ? <div className="panel skeleton" /> : null}
    {error ? <StatePanel title="GAME LINK INTERRUPTED" message={error} /> : null}
    {!loading && !error && sessions.length === 0 ? <StatePanel title="NO GAME SESSIONS" message="Validated Unity results will appear here after players submit them." /> : null}
    {sessions.length ? <div className="panel table-wrap"><table><thead><tr><th>Submitted</th><th>Player</th><th>Score</th><th>Duration</th><th>XP</th><th>Validation</th></tr></thead><tbody>{sessions.map((session) => <tr key={session.id}>
      <td>{new Date(session.submittedAt).toLocaleString("en-GB")}</td><td>#{session.userId}</td><td>{session.score.toLocaleString()}</td><td>{session.durationSeconds}s</td><td>+{session.awardedXp}</td><td><Badge tone={session.validationState === "Valid" ? "green" : "coral"}>{session.validationState}</Badge><small>{session.validationReason}</small></td>
    </tr>)}</tbody></table></div> : null}
  </>;
}
