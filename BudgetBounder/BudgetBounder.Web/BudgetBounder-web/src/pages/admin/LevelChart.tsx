import type { LevelPoint } from './analyticsData';
export function LevelChart({ points }: { points: LevelPoint[] }) {
  const times = points.map(p => Date.parse(p.recordedAt));
  const start = Math.min(...times), end = Math.max(...times);
  return <section className="panel chart-panel"><h2>Recorded level progression</h2><p>Each point is a saved XP or level change. Filter by user to follow one player. History starts with this update.</p>
    {points.length ? <><svg viewBox="0 0 800 240" role="img" aria-label="Recorded player levels over time, values listed below">
      {[1, 3, 5, 7, 10].map(level => <g key={level}><line x1="45" x2="780" y1={210 - level * 18} y2={210 - level * 18} stroke="var(--border)" /><text x="5" y={214 - level * 18} fill="var(--muted)" fontSize="12">Lv {level}</text></g>)}
      {points.map((p, i) => <circle key={i} cx={50 + (times[i] - start) / Math.max(1, end - start) * 720} cy={210 - Math.min(10, Math.max(1, p.level)) * 18} r="4" fill="var(--violet)"><title>User #{p.userId} · {p.recordedAt} · Level {p.level} · {p.xp} XP</title></circle>)}
    </svg><details><summary>View recorded levels ({points.length})</summary><div className="table-wrap"><table><thead><tr><th>User</th><th>Recorded (UTC)</th><th>Level</th><th>Total XP</th></tr></thead><tbody>{points.map((p, i) => <tr key={i}><td>#{p.userId}</td><td>{p.recordedAt}</td><td>{p.level}</td><td>{p.xp}</td></tr>)}</tbody></table></div></details></> : <p className="empty">No level changes recorded in this period.</p>}
  </section>;
}
