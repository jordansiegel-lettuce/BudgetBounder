import { useEffect, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";

type Mission = { id: number; title: string; difficulty: string; xpReward: number; isCompleted: boolean; isAiGenerated: boolean; expiresAt: string; currentProgress: number; targetValue: number };
export default function Missions() {
  const [items, setItems] = useState<Mission[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get<Mission[]>("/admin/missions").then(r => setItems(r.data)).catch(() => setError("Mission catalog could not be loaded.")); }, []);
  return <><PageHeader eyebrow="BEHAVIOR SYSTEM" title="Mission management" description="Review progress and AI-generated challenges without rewarding spending." action={<button>Create mission</button>} />
    {error ? <StatePanel title="MISSION DATA ERROR" message={error} /> : null}
    <div className="panel table-wrap"><table><thead><tr><th>Mission</th><th>Difficulty</th><th>Progress</th><th>Reward</th><th>Source</th><th>Expires</th></tr></thead><tbody>
      {items.map(m => <tr key={m.id}><td><strong>{m.title}</strong></td><td><Badge tone={m.difficulty === "Hard" ? "gold" : "cyan"}>{m.difficulty}</Badge></td><td>{m.isCompleted ? "Completed" : `${m.currentProgress} / ${m.targetValue}`}</td><td>{m.xpReward} XP</td><td>{m.isAiGenerated ? "AI review" : "System"}</td><td>{new Date(m.expiresAt).toLocaleDateString("he-IL")}</td></tr>)}
    </tbody></table>{items.length === 0 && !error ? <p className="empty">No missions are currently configured.</p> : null}</div></>;
}
