import { useEffect, useState } from "react";
import { PageHeader, StatCard, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";
import { LevelChart } from "./LevelChart";
import type { AdminOverview } from "../../types/admin";
import { analyticsCsv, type AnalyticsData, type AnalyticsFilters } from "./analyticsData";

export function AnalyticsContent({ data }: { data: AdminOverview }) {
  return <><section className="stat-grid">
    <StatCard label="TOTAL USERS" value={data.totalUsers.toLocaleString()} /><StatCard label="ACTIVE ACCOUNTS" value={data.activeUsers.toLocaleString()} tone="green" />
    <StatCard label="MISSIONS COMPLETED" value={data.missionsCompleted.toLocaleString()} tone="gold" /><StatCard label="AVERAGE LEVEL (CURRENT)" value={data.averageUserLevel.toFixed(1)} tone="violet" />
  </section><section className="panel metric-table">
    <div><span>TRANSACTIONS</span><strong>{data.transactionsLogged.toLocaleString()}</strong><em>PERIOD</em></div>
    <div><span>SAVINGS GOALS</span><strong>{data.savingsGoalsCreated.toLocaleString()}</strong><em>ALL TIME</em></div>
    <div><span>NEW USERS</span><strong>{data.newRegistrations.toLocaleString()}</strong><em>PERIOD</em></div>
    <div><span>AI MISSIONS</span><strong>{data.aiGeneratedMissions.toLocaleString()}</strong><em>PERIOD</em></div>
    <div><span>FROZEN ACCOUNTS</span><strong>{data.inactiveUsers.toLocaleString()}</strong><em>CURRENT</em></div>
  </section></>;
}
const defaults = (): AnalyticsFilters => ({ startDate: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10) });
export default function Analytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaults), [applied, setApplied] = useState<AnalyticsFilters>(defaults);
  const [data, setData] = useState<AnalyticsData | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    api.get<AnalyticsData>("/admin/analytics", { signal: controller.signal, params: applied }).then(r => { setData(r.data); setError(""); })
      .catch(e => { if (!controller.signal.aborted) { setData(null); setError(e.response?.data?.message || "Analytics could not be loaded."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applied]);
  function apply(e: React.FormEvent) { e.preventDefault(); setLoading(true); setData(null); setError(""); setApplied({ ...filters }); }
  function download() {
    if (!data) return; const url = URL.createObjectURL(new Blob(['\ufeff' + analyticsCsv(data)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'budgetbounder-analytics.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const points = data?.trend || [], maxCount = Math.max(1, ...points.flatMap(p => [p.transactions, p.missionsCompleted]));
  const maxXp = Math.max(1, ...points.map(p => p.missionXp + p.gameXp));
  return <>
    <PageHeader eyebrow="PRODUCT SIGNALS" title="Product analytics" description="Filter activity, inspect progression and export the report." action={<button disabled={!data || loading} onClick={download}>Export CSV</button>} />
    <form className="filterbar" onSubmit={apply}>
      <label>From (UTC)<input type="date" value={filters.startDate || ''} max={filters.endDate} onChange={e => setFilters({ ...filters, startDate: e.target.value || undefined })} /></label>
      <label>Through (UTC)<input type="date" value={filters.endDate || ''} min={filters.startDate} onChange={e => setFilters({ ...filters, endDate: e.target.value || undefined })} /></label>
      <label>User ID<input type="number" min="1" placeholder="All users" value={filters.userId || ''} onChange={e => setFilters({ ...filters, userId: e.target.value ? Number(e.target.value) : undefined })} /></label>
      <label>Account status<select value={filters.isActive === undefined ? '' : String(filters.isActive)} onChange={e => setFilters({ ...filters, isActive: e.target.value === '' ? undefined : e.target.value === 'true' })}><option value="">All accounts</option><option value="true">Active</option><option value="false">Frozen</option></select></label>
      <button disabled={loading}>Apply filters</button><button type="button" className="ghost-button" onClick={() => { setFilters({}); setApplied({}); setData(null); setLoading(true); }}>All time</button>
    </form>
    {error ? <StatePanel title="ANALYTICS OFFLINE" message={error} /> : null}
    {loading ? <div className="panel skeleton" aria-label="Loading analytics" /> : null}
    {data && !loading ? <>
      <p className="result-summary">{data.filters.startDate || 'Beginning'} — {data.filters.endDate || 'Today'} (UTC) · {data.filters.userId ? 'User #' + data.filters.userId : 'All users'} · {data.filters.isActive == null ? 'All account states' : data.filters.isActive ? 'Active accounts' : 'Frozen accounts'}</p>
      <AnalyticsContent data={data.summary} />
      <p className="result-summary">Account counts and levels describe the current cohort; savings goals are all-time because creation dates were not recorded. Events use their transaction, completion, registration or submission date.</p>
      <div className="dashboard-grid">
        <section className="panel chart-panel"><h2>Transactions & completed missions</h2><p>Daily activity · cyan transactions / gold missions</p>
          {points.length ? <div className="trend-bars" role="img" aria-label="Daily transaction and mission counts, exact values in the table below">{points.map(p => <div className="trend-day" key={p.date} title={p.date + ': ' + p.transactions + ' transactions, ' + p.missionsCompleted + ' completed missions'}><div><i style={{ height: Math.max(1, p.transactions / maxCount * 150) }} /><i className="mission-bar" style={{ height: Math.max(1, p.missionsCompleted / maxCount * 150) }} /></div><small>{p.date.slice(5)}</small></div>)}</div> : <p className="empty">No activity in this period.</p>}
        </section>
        <section className="panel chart-panel"><h2>Account status</h2><p>Current access status, not recent sign-ins</p><div className="status-chart"><span>Active {data.summary.activeUsers}</span><meter min="0" max={Math.max(1, data.summary.totalUsers)} value={data.summary.activeUsers} /><span>Frozen {data.summary.inactiveUsers}</span><meter min="0" max={Math.max(1, data.summary.totalUsers)} value={data.summary.inactiveUsers} /></div></section>
      </div>
      <section className="panel chart-panel"><h2>Progression: mission & game XP earned</h2><p>Daily XP awards from these activities; current average level is shown above.</p><div className="trend-bars" role="img" aria-label="Daily mission and game XP, exact values in the table below">{points.map(p => <div className="trend-day" key={p.date} title={p.date + ': ' + (p.missionXp + p.gameXp) + ' XP'}><div><i className="xp-bar" style={{ height: Math.max(1, (p.missionXp + p.gameXp) / maxXp * 150) }} /></div><small>{p.date.slice(5)}</small></div>)}</div></section>
      <LevelChart points={data.levelHistory || []} />
      <div className="panel table-wrap"><table><caption>Daily activity — dates with recorded events</caption><thead><tr><th>Date UTC</th><th>Transactions</th><th>Missions completed</th><th>New users</th><th>Mission XP</th><th>Game XP</th></tr></thead><tbody>{points.map(p => <tr key={p.date}><td>{p.date}</td><td>{p.transactions}</td><td>{p.missionsCompleted}</td><td>{p.newUsers}</td><td>{p.missionXp}</td><td>{p.gameXp}</td></tr>)}</tbody></table></div>
    </> : null}
  </>;
}
