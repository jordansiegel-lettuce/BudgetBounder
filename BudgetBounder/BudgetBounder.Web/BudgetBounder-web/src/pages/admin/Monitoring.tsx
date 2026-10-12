import { useEffect, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";

type MonitoringData = Record<string, { status: string; checkedAt?: string; detail?: string }>;
export default function Monitoring() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get<MonitoringData>("/admin/monitoring").then(r => setData(r.data)).catch(() => setError("System status is unavailable.")); }, []);
  return <><PageHeader eyebrow="SYSTEM HEALTH" title="Monitoring" description="Live API, database, AI provider and game pipeline checks." />
    {error ? <StatePanel title="MONITORING ERROR" message={error} /> : null}
    {!data && !error ? <div className="panel skeleton" aria-label="Checking services" /> : null}
    <div className="stat-grid">{data && Object.entries(data).map(([name, value]) => <article className="panel service-card" key={name}><span className="mono-label">{name}</span><Badge tone={value.status === "Operational" ? "green" : value.status === "Down" ? "coral" : "gold"}>{value.status}</Badge><small>{value.detail ?? (value.checkedAt ? new Date(value.checkedAt).toLocaleString("en-GB") : "")}</small></article>)}</div></>;
}
