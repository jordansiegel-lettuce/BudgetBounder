import { useEffect, useState } from "react";
import { PageHeader, StatCard, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";
import type { AdminOverview } from "../../types/admin";

export default function Overview() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true); setError("");
    try { setData((await api.get<AdminOverview>("/admin/overview")).data); }
    catch { setError("Operational metrics could not be loaded."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    api.get<AdminOverview>("/admin/overview")
      .then(response => setData(response.data))
      .catch(() => setError("Operational metrics could not be loaded."))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="loading-grid">{[1,2,3,4].map(i => <div className="panel skeleton" key={i} />)}</div>;
  if (error || !data) return <StatePanel title="DATA LINK INTERRUPTED" message={error} action={<button onClick={load}>Retry</button>} />;
  const chart = [38, 52, 68, 81, 103, 121, 146, 162, 188, 204, 65, 91];
  return <>
    <PageHeader eyebrow="SYSTEM PULSE" title="Operations overview" description="Platform health, engagement and review priorities." />
    <section className="stat-grid">
      <StatCard label="TOTAL USERS" value={data.totalUsers.toLocaleString()} />
      <StatCard label="ACTIVE USERS" value={data.activeUsers.toLocaleString()} tone="green" />
      <StatCard label="MISSIONS COMPLETED" value={data.missionsCompleted.toLocaleString()} tone="gold" />
      <StatCard label="AVERAGE LEVEL" value={data.averageUserLevel.toFixed(1)} tone="violet" />
    </section>
    <section className="dashboard-grid">
      <article className="panel chart-panel"><span className="mono-label">ACTIVITY TREND</span><div className="bars">{chart.map((height, i) => <i key={i} style={{ height }} />)}</div></article>
      <article className="panel review-panel"><span className="mono-label gold">REVIEW QUEUE</span>
        <div className="queue-row"><strong>AI mission needs approval</strong><small className="coral">HIGH</small></div>
        <div className="queue-row"><strong>{data.inactiveUsers} inactive accounts</strong><small>NORMAL</small></div>
        <div className="queue-row"><strong>{data.aiGeneratedMissions} AI missions generated</strong><small>NORMAL</small></div>
      </article>
    </section>
    <section className="panel metric-table">
      <div><span>Transactions logged</span><strong>{data.transactionsLogged.toLocaleString()}</strong><em>HEALTHY</em></div>
      <div><span>Savings goals created</span><strong>{data.savingsGoalsCreated.toLocaleString()}</strong><em>HEALTHY</em></div>
      <div><span>New registrations</span><strong>{data.newRegistrations.toLocaleString()}</strong><em>30 DAYS</em></div>
    </section>
  </>;
}
