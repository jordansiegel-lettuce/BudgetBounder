import { useEffect, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";

type Mission = { id: number; userId: number; title: string; description: string; difficulty: string; xpReward: number; missionType: string; isCompleted: boolean; isAiGenerated: boolean; reviewStatus: string; expiresAt: string; currentProgress: number; targetValue: number };
type Catalog = { items: Mission[]; total: number; completed: number; pageSize: number };
type Form = Pick<Mission, 'userId' | 'title' | 'description' | 'difficulty' | 'xpReward' | 'missionType' | 'targetValue' | 'expiresAt'>;
const fresh = (): Form => ({ userId: 0, title: "", description: "", difficulty: "Easy", xpReward: 50, missionType: "LogExpenses", targetValue: 1, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16) });
function message(error: unknown) { const data = (error as { response?: { data?: unknown } }).response?.data; return typeof data === "string" ? data : "The mission request failed. Please retry."; }
export default function Missions() {
  const [catalog, setCatalog] = useState<Catalog | null>(null), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [status, setStatus] = useState(""), [source, setSource] = useState(""), [userId, setUserId] = useState("");
  const [page, setPage] = useState(1), [revision, setRevision] = useState(0), [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Mission | "new" | null>(null), [form, setForm] = useState<Form>(fresh);
  useEffect(() => {
    const controller = new AbortController();
    api.get<Catalog>("/admin/missions", { signal: controller.signal, params: { status: status || undefined, ai: source === "" ? undefined : source === "AI", userId: userId || undefined, page } })
      .then(r => { setCatalog(r.data); setError(""); }).catch(e => { if (!controller.signal.aborted) { setCatalog(null); setError(message(e)); } });
    return () => controller.abort();
  }, [status, source, userId, page, revision]);
  function open(m: Mission | "new") { setEditing(m); setError(""); setNotice(""); setForm(m === "new" ? fresh() : { ...m, expiresAt: m.expiresAt.slice(0, 16) }); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const body = { ...form, expiresAt: new Date(form.expiresAt + ":00Z").toISOString() };
      if (editing === "new") await api.post("/admin/missions", body); else if (editing) await api.put("/admin/missions/" + editing.id, body);
      setNotice(editing === "new" ? "Mission created and assigned." : "Saved. Edited AI missions return to the review queue."); setEditing(null); setRevision(r => r + 1);
    } catch (e) { setError(message(e)); } finally { setBusy(false); }
  }
  async function review(m: Mission, decision: string) {
    setBusy(true); setError("");
    try { await api.patch("/admin/missions/" + m.id + "/review", { decision }); setNotice("Mission " + decision.toLowerCase() + "."); setRevision(r => r + 1); }
    catch (e) { setError(message(e)); } finally { setBusy(false); }
  }
  return <>
    <PageHeader eyebrow="QUEST CONTROL" title="Mission management" description="Create challenges and review AI missions before users receive them." action={<button onClick={() => open("new")}>Create mission</button>} />
    <div className="filterbar">
      <label>Review status<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option>Draft</option><option>Approved</option><option>Rejected</option></select></label>
      <label>Source<select value={source} onChange={e => { setSource(e.target.value); setPage(1); }}><option value="">All sources</option><option>AI</option><option>System</option></select></label>
      <label>User ID<input type="number" min="1" placeholder="All users" value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }} /></label>
      <button className="ghost-button" onClick={() => { setStatus(""); setSource(""); setUserId(""); setPage(1); setRevision(r => r + 1); }}>Reset / refresh</button>
    </div>
    {notice ? <p role="status" className="notice">{notice}</p> : null}{error ? <StatePanel title="MISSION DATA ERROR" message={error} /> : null}
    {editing ? <form className="panel mission-form" onSubmit={save}>
      <h2>{editing === "new" ? "New mission" : "Edit mission #" + editing.id}</h2>
      <label>User ID (0 = all active users)<input type="number" min="0" required disabled={editing !== "new"} value={form.userId} onChange={e => setForm({ ...form, userId: Number(e.target.value) })} /></label>
      <label>Title<input required maxLength={160} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label className="full-width">Description<textarea required maxLength={2000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <label>Difficulty<select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>{["Easy", "Medium", "Hard"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Tracks<select value={form.missionType} onChange={e => setForm({ ...form, missionType: e.target.value })}><option value="LogExpenses">Expenses logged</option><option value="LogIncome">Income entries logged</option><option value="SavingGoal">Savings contributions</option><option value="DailyStreak">Distinct days logging expenses</option></select></label>
      <label>Target count<input required type="number" min="1" max="10000" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} /></label>
      <label>XP reward<input required type="number" min="1" max="1000" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: Number(e.target.value) })} /></label>
      <label>Expires (UTC)<input required type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></label>
      <div className="action-row"><button disabled={busy}>Save mission</button><button type="button" className="ghost-button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button></div>
    </form> : null}
    {catalog ? <>
      <p className="result-summary">{catalog.total} matching missions · {catalog.completed} completed · {catalog.total ? Math.round(catalog.completed / catalog.total * 100) : 0}% completion</p>
      <section className="card-list">{catalog.items.map(m => <article className="panel review-card" key={m.id}>
        <div><Badge tone={m.reviewStatus === "Approved" ? "green" : m.reviewStatus === "Rejected" ? "coral" : "gold"}>{m.reviewStatus}</Badge><small>{m.isAiGenerated ? "AI personalized" : "System"} · User #{m.userId} · Mission #{m.id}</small></div>
        <h2>{m.title}</h2><p>{m.description}</p><p>{m.difficulty} · {m.xpReward} XP · {m.isCompleted ? "Completed" : m.currentProgress + " / " + m.targetValue} · Expires {new Date(m.expiresAt).toLocaleString()}</p>
        {!m.isCompleted ? <div className="action-row"><button disabled={busy || m.currentProgress > 0} className="ghost-button" onClick={() => open(m)}>Edit</button>{m.reviewStatus !== "Approved" ? <button disabled={busy} onClick={() => review(m, "Approved")}>Approve</button> : null}{m.reviewStatus !== "Rejected" ? <button disabled={busy} className="danger-button" onClick={() => review(m, "Rejected")}>Reject / withdraw</button> : null}</div> : null}
      </article>)}</section>
      {catalog.items.length === 0 ? <StatePanel title="NO MATCHING MISSIONS" message="Change the filters or create a mission." /> : null}
      <div className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} · {catalog.total} missions</span><button disabled={page * catalog.pageSize >= catalog.total} onClick={() => setPage(page + 1)}>Next</button></div>
    </> : !error ? <div className="panel skeleton" aria-label="Loading missions" /> : null}
  </>;
}
