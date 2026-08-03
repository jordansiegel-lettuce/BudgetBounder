import { useEffect, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";

type MonitoringData = Record<string, { status: string; checkedAt?: string }>;
export default function Monitoring() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get<MonitoringData>("/admin/monitoring").then(r => setData(r.data)).catch(() => setError("System status is unavailable.")); }, []);
  return <><PageHeader eyebrow="SYSTEM HEALTH" title="Monitoring" description="Current API, database, AI and Unity host status." />
    {error ? <StatePanel title="MONITORING ERROR" message={error} /> : null}
    <div className="stat-grid">{data && Object.entries(data).map(([name, value]) => <article className="panel service-card" key={name}><span className="mono-label">{name}</span><Badge tone={value.status === "Operational" ? "green" : "gold"}>{value.status}</Badge><small>{value.checkedAt ? new Date(value.checkedAt).toLocaleString("he-IL") : "Configuration state"}</small></article>)}</div></>;
}
