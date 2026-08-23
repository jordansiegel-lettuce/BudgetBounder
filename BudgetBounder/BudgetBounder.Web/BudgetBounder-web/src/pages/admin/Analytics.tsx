import { useEffect, useState } from "react";
import { PageHeader, StatCard, StatePanel } from "../../components/admin/AdminUi";
import { adminApi } from "../../services/api";
import type { AdminOverview } from "../../types/admin";

export function AnalyticsContent({ data }: { data: AdminOverview }) {
  return <>
    <section className="stat-grid">
      <StatCard label="TOTAL USERS" value={data.totalUsers.toLocaleString()} />
      <StatCard label="ACTIVE USERS" value={data.activeUsers.toLocaleString()} tone="green" />
      <StatCard label="MISSIONS COMPLETED" value={data.missionsCompleted.toLocaleString()} tone="gold" />
      <StatCard label="AVERAGE LEVEL" value={data.averageUserLevel.toFixed(1)} tone="violet" />
    </section>
    <section className="panel metric-table">
      <div><span>TRANSACTIONS</span><strong>{data.transactionsLogged.toLocaleString()}</strong><em>ALL TIME</em></div>
      <div><span>SAVINGS GOALS</span><strong>{data.savingsGoalsCreated.toLocaleString()}</strong><em>ALL TIME</em></div>
      <div><span>NEW USERS</span><strong>{data.newRegistrations.toLocaleString()}</strong><em>30 DAYS</em></div>
      <div><span>AI MISSIONS</span><strong>{data.aiGeneratedMissions.toLocaleString()}</strong><em>GENERATED</em></div>
      <div><span>INACTIVE USERS</span><strong>{data.inactiveUsers.toLocaleString()}</strong><em>REVIEW</em></div>
    </section>
  </>;
}

export default function Analytics() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.analytics().then(setData).catch(() => setError("Analytics could not be loaded."));
  }, []);

  return <>
    <PageHeader eyebrow="PRODUCT SIGNALS" title="Product analytics" description="Persistent finance habits, missions and progression data." />
    {error ? <StatePanel title="ANALYTICS OFFLINE" message={error} /> : null}
    {!error && !data ? <div className="loading-grid"><div className="panel skeleton" /><div className="panel skeleton" /></div> : null}
    {data ? <AnalyticsContent data={data} /> : null}
  </>;
}
