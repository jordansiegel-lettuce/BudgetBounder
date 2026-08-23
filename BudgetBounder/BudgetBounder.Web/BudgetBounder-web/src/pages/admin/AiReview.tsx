import { useCallback, useEffect, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import { adminApi } from "../../services/api";
import type { AiRecommendation } from "../../types/admin";
import { filterRecommendations } from "./adminData";

export default function AiReview() {
  const [items, setItems] = useState<AiRecommendation[]>([]);
  const [status, setStatus] = useState("Draft");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await adminApi.aiRecommendations()); }
    catch { setError("AI recommendations could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    adminApi.aiRecommendations().then(setItems).catch(() => setError("AI recommendations could not be loaded.")).finally(() => setLoading(false));
  }, []);
  async function review(id: number, decision: "Approved" | "Rejected") {
    try { await adminApi.reviewAiRecommendation(id, decision); await load(); }
    catch { setError("The review decision could not be saved."); }
  }
  const visible = filterRecommendations(items, status);
  return <>
    <PageHeader eyebrow="HUMAN APPROVAL" title="AI recommendation review" description="Approve or reject generated guidance before it becomes trusted product content." />
    <div className="filterbar"><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Review status"><option>Draft</option><option>Approved</option><option>Rejected</option><option>All</option></select></div>
    {loading ? <div className="panel skeleton" /> : null}
    {error ? <StatePanel title="REVIEW LINK INTERRUPTED" message={error} action={<button onClick={load}>Retry</button>} /> : null}
    {!loading && !error && visible.length === 0 ? <StatePanel title="QUEUE CLEAR" message="No recommendations match this review state." /> : null}
    <section className="card-list">{visible.map((item) => <article className="panel review-card" key={item.id}>
      <div><Badge tone={item.status === "Approved" ? "green" : item.status === "Rejected" ? "coral" : "gold"}>{item.status}</Badge><small>User #{item.userId} · {new Date(item.createdAt).toLocaleString("en-GB")}</small></div>
      <h2>{item.title}</h2><p>{item.content}</p>
      {item.status === "Draft" ? <div className="action-row"><button onClick={() => review(item.id, "Approved")}>Approve</button><button className="danger-button" onClick={() => review(item.id, "Rejected")}>Reject</button></div> : null}
    </article>)}</section>
  </>;
}
