import { useEffect, useState } from 'react';
import { Badge, PageHeader, StatePanel } from '../../components/admin/AdminUi';
import api from '../../services/api';
import type { AdminUser, Paged } from '../../types/admin';
export default function Users() {
  const [data, setData] = useState<Paged<AdminUser> | null>(null), [search, setSearch] = useState(''), [status, setStatus] = useState('');
  const [query, setQuery] = useState({ search: '', status: '', page: 1, revision: 0 }), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    api.get<Paged<AdminUser>>('/admin/users', { signal: controller.signal, params: { search: query.search, page: query.page, isActive: query.status || undefined } })
      .then(r => { setData(r.data); setError(''); }).catch(() => { if (!controller.signal.aborted) { setData(null); setError('User records could not be loaded.'); } });
    return () => controller.abort();
  }, [query]);
  async function toggle(user: AdminUser) {
    setBusy(true); setError('');
    try { await api.patch('/admin/users/' + user.id + '/status', { isActive: !user.isActive }); setQuery(q => ({ ...q, revision: q.revision + 1 })); }
    catch { setError('The account status was not changed.'); } finally { setBusy(false); }
  }
  return <><PageHeader eyebrow="USER OPERATIONS" title="User management" description="Search accounts, inspect progression and control access." />
    <form className="filterbar" onSubmit={e => { e.preventDefault(); setData(null); setQuery(q => ({ search, status, page: 1, revision: q.revision + 1 })); }}>
      <label>Name or email<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users" /></label>
      <label>Account status<select value={status} onChange={e => setStatus(e.target.value)}><option value="">All accounts</option><option value="true">Active</option><option value="false">Frozen</option></select></label><button>Search</button>
    </form>
    {error ? <StatePanel title="USER DATA ERROR" message={error} /> : null}
    {!data && !error ? <div className="panel skeleton" aria-label="Loading users" /> : null}
    {data ? <><div className="panel table-wrap"><table><thead><tr><th>User</th><th>Status</th><th>Level</th><th>XP</th><th>Streak</th><th>Last active</th><th>Account access</th></tr></thead><tbody>{data.items.map(user => <tr key={user.id}><td><strong>{user.fullName}</strong><small>#{user.id} · {user.email}</small></td><td><Badge tone={user.isActive ? 'green' : 'coral'}>{user.isActive ? 'Active' : 'Frozen'}</Badge></td><td>{user.level}</td><td>{Math.round(user.xp).toLocaleString()}</td><td>{user.currentStreak} days</td><td>{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Never'}</td><td><button className="ghost-button" disabled={busy || user.role === 'Admin'} onClick={() => toggle(user)}>{user.isActive ? 'Freeze' : 'Restore'}</button></td></tr>)}</tbody></table>{!data.items.length ? <p className="empty">No users match these filters.</p> : null}</div>
      <div className="pagination"><button disabled={query.page <= 1} onClick={() => setQuery(q => ({ ...q, page: q.page - 1 }))}>Previous</button><span>Page {query.page} · {data.total} users</span><button disabled={query.page * data.pageSize >= data.total} onClick={() => setQuery(q => ({ ...q, page: q.page + 1 }))}>Next</button></div></> : null}
  </>;
}
