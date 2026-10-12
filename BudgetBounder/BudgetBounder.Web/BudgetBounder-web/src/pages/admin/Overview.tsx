import { useCallback, useEffect, useState } from "react";
import { PageHeader, StatCard, StatePanel } from "../../components/admin/AdminUi";
import api, { adminApi } from "../../services/api";
import type { AdminOverview } from "../../types/admin";

const TREND_DAYS = 14;

type TrendDay = { date: string; transactions: number; missionsCompleted: number };

function lastDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (count - 1 - i)));
    return day.toISOString().slice(0, 10);
  });
}

type OverviewState = { overview: AdminOverview; trend: TrendDay[]; draftMissions: number };

async function fetchOverview(): Promise<OverviewState> {
  const days = lastDays(TREND_DAYS);
  const [overview, analytics, drafts] = await Promise.all([
    api.get<AdminOverview>("/admin/overview"),
    adminApi.analytics({ startDate: days[0], endDate: days[days.length - 1] }),
    api.get<{ total: number }>("/admin/missions", { params: { status: "Draft" } }),
  ]);
  const byDate = new Map(analytics.trend.map(point => [point.date.slice(0, 10), point]));
  return {
    overview: overview.data,
    trend: days.map(date => ({ date, transactions: byDate.get(date)?.transactions ?? 0, missionsCompleted: byDate.get(date)?.missionsCompleted ?? 0 })),
    draftMissions: drafts.data.total,
  };
}

export default function Overview() {
  const [state, setState] = useState<OverviewState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const request = useCallback(() => fetchOverview()
    .then(result => { setState(result); setError(""); })
    .catch(() => setError("Operational metrics could not be loaded."))
    .finally(() => setLoading(false)), []);

  useEffect(() => { void request(); }, [request]);
  function load() { setLoading(true); void request(); }
  const data = state?.overview, trend = state?.trend ?? [], draftMissions = state?.draftMissions ?? 0;

  if (loading) return <div className="loading-grid">{[1,2,3,4].map(i => <div className="panel skeleton" key={i} />)}</div>;
  if (error || !data) return <StatePanel title="DATA LINK INTERRUPTED" message={error} action={<button onClick={load}>Retry</button>} />;
  const peak = Math.max(1, ...trend.map(day => day.transactions + day.missionsCompleted));
  return <>
    <PageHeader eyebrow="SYSTEM PULSE" title="Operations overview" description="Platform health, engagement and review priorities." />
    <section className="stat-grid">
      <StatCard label="TOTAL USERS" value={data.totalUsers.toLocaleString()} />
      <StatCard label="ENABLED ACCOUNTS" value={data.activeUsers.toLocaleString()} tone="green" />
      <StatCard label="MISSIONS COMPLETED" value={data.missionsCompleted.toLocaleString()} tone="gold" />
      <StatCard label="AVERAGE LEVEL" value={data.averageUserLevel.toFixed(1)} tone="violet" />
    </section>
    <section className="dashboard-grid">
      <article className="panel chart-panel" aria-label={`Transactions and completed missions per day, last ${TREND_DAYS} days`}>
        <span className="mono-label">ACTIVITY · LAST {TREND_DAYS} DAYS (UTC)</span>
        <div className="bars">{trend.map(day => {
          const total = day.transactions + day.missionsCompleted;
          return <i key={day.date} title={`${day.date}: ${day.transactions} transactions, ${day.missionsCompleted} missions completed`} style={{ height: Math.max(4, Math.round(total / peak * 200)), opacity: total ? 1 : 0.25 }} />;
        })}</div>
      </article>
      <article className="panel review-panel"><span className="mono-label gold">REVIEW QUEUE</span>
        <div className="queue-row"><strong>{draftMissions ? `${draftMissions} AI mission${draftMissions === 1 ? "" : "s"} awaiting approval` : "No AI missions awaiting approval"}</strong><small className={draftMissions ? "coral" : undefined}>{draftMissions ? "HIGH" : "CLEAR"}</small></div>
        <div className="queue-row"><strong>{data.inactiveUsers} frozen account{data.inactiveUsers === 1 ? "" : "s"}</strong><small>NORMAL</small></div>
        <div className="queue-row"><strong>{data.aiGeneratedMissions} AI missions generated</strong><small>ALL TIME</small></div>
      </article>
    </section>
    <section className="panel metric-table">
      <div><span>Transactions logged</span><strong>{data.transactionsLogged.toLocaleString()}</strong><em>ALL TIME</em></div>
      <div><span>Savings goals created</span><strong>{data.savingsGoalsCreated.toLocaleString()}</strong><em>ALL TIME</em></div>
      <div><span>New registrations</span><strong>{data.newRegistrations.toLocaleString()}</strong><em>30 DAYS</em></div>
    </section>
  </>;
}
