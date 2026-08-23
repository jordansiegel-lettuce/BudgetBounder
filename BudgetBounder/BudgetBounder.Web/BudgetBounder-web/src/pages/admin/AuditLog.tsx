import { useEffect, useMemo, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import { adminApi } from "../../services/api";
import type { AdminAuditEntry } from "../../types/admin";
import { filterAuditEntries } from "./adminData";

export default function AuditLog() {
  const [entries, setEntries] = useState<AdminAuditEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi.auditLog().then(setEntries).catch(() => setError("Audit history could not be loaded.")).finally(() => setLoading(false));
  }, []);
  const visible = useMemo(() => filterAuditEntries(entries, query), [entries, query]);

  return <>
    <PageHeader eyebrow="SECURITY TRAIL" title="Audit log" description="Sensitive administrative actions recorded by the hosted API." />
    <div className="filterbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter action, target or details" aria-label="Filter audit log" /></div>
    {loading ? <div className="panel skeleton" /> : null}
    {error ? <StatePanel title="AUDIT LINK INTERRUPTED" message={error} /> : null}
    {!loading && !error && visible.length === 0 ? <StatePanel title="NO MATCHING EVENTS" message="No recorded administrative actions match this filter." /> : null}
    {visible.length ? <div className="panel table-wrap"><table><thead><tr><th>Time</th><th>Action</th><th>Target</th><th>Admin</th><th>Details</th></tr></thead><tbody>
      {visible.map((entry) => <tr key={entry.id}><td>{new Date(entry.createdAt).toLocaleString("en-GB")}</td><td><Badge tone="cyan">{entry.action}</Badge></td><td><strong>{entry.targetType}</strong><small>#{entry.targetId}</small></td><td>#{entry.adminUserId}</td><td>{entry.details}</td></tr>)}
    </tbody></table></div> : null}
  </>;
}
