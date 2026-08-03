import { useEffect, useState } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import api from "../../services/api";
import type { AdminUser, Paged } from "../../types/admin";

export default function Users() {
  const [data, setData] = useState<Paged<AdminUser> | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  async function load(query = search) {
    setError("");
    try { setData((await api.get<Paged<AdminUser>>("/admin/users", { params: { search: query } })).data); }
    catch { setError("User records could not be loaded."); }
  }
  useEffect(() => {
    api.get<Paged<AdminUser>>("/admin/users")
      .then(response => setData(response.data))
      .catch(() => setError("User records could not be loaded."));
  }, []);
  async function toggle(user: AdminUser) {
    if (!window.confirm(`${user.isActive ? "Freeze" : "Restore"} ${user.fullName}'s account?`)) return;
    try { await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive }); await load(); }
    catch { setError("The account status was not changed."); }
  }
  return <>
    <PageHeader eyebrow="USER OPERATIONS" title="User management" description="Search accounts, inspect progression and safely control access." />
    <div className="filterbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email" /><button onClick={() => load()}>Search</button></div>
    {error ? <StatePanel title="USER DATA ERROR" message={error} /> : null}
    <div className="panel table-wrap"><table><thead><tr><th>User</th><th>Status</th><th>Level</th><th>XP</th><th>Streak</th><th>Last active</th><th /></tr></thead>
      <tbody>{data?.items.map(user => <tr key={user.id}><td><strong>{user.fullName}</strong><small>{user.email}</small></td><td><Badge tone={user.isActive ? "green" : "coral"}>{user.isActive ? "Active" : "Frozen"}</Badge></td><td>{user.level}</td><td>{Math.round(user.xp).toLocaleString()}</td><td>{user.currentStreak} days</td><td>{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString("he-IL") : "Never"}</td><td><button className="ghost-button" onClick={() => toggle(user)}>{user.isActive ? "Freeze" : "Restore"}</button></td></tr>)}</tbody>
    </table>{data?.items.length === 0 ? <p className="empty">No users match this search.</p> : null}</div>
  </>;
}
