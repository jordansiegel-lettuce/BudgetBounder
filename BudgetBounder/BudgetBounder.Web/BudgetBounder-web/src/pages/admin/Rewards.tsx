import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Badge, PageHeader, StatePanel } from "../../components/admin/AdminUi";
import { adminApi } from "../../services/api";
import type { RewardDefinition } from "../../types/admin";
import { cosmeticTypes, isAllowedCosmeticType } from "./adminData";

export default function Rewards() {
  const [items, setItems] = useState<RewardDefinition[]>([]);
  const [form, setForm] = useState({ code: "", name: "", description: "", cosmeticType: "Badge" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await adminApi.rewards()); }
    catch { setError("Reward definitions could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    adminApi.rewards().then(setItems).catch(() => setError("Reward definitions could not be loaded.")).finally(() => setLoading(false));
  }, []);
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!isAllowedCosmeticType(form.cosmeticType)) return setError("Choose a safe cosmetic type.");
    try { await adminApi.createReward(form); setForm({ code: "", name: "", description: "", cosmeticType: "Badge" }); await load(); }
    catch { setError("The reward definition could not be created."); }
  }
  async function toggle(item: RewardDefinition) {
    try { await adminApi.setRewardStatus(item.id, !item.isActive); await load(); }
    catch { setError("The reward status could not be changed."); }
  }
  return <>
    <PageHeader eyebrow="SAFE UNLOCKS" title="Rewards and achievements" description="Cosmetic badge, theme and avatar-frame definitions with unlock health." />
    <form className="panel reward-form" onSubmit={create}>
      <input aria-label="Reward code" placeholder="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
      <input aria-label="Reward name" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      <input aria-label="Reward description" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
      <select aria-label="Cosmetic type" value={form.cosmeticType} onChange={(event) => setForm({ ...form, cosmeticType: event.target.value })}>{cosmeticTypes.map((type) => <option key={type}>{type}</option>)}</select>
      <button type="submit">Create reward</button>
    </form>
    {loading ? <div className="panel skeleton" /> : null}
    {error ? <StatePanel title="REWARD LINK INTERRUPTED" message={error} /> : null}
    {!loading && !error && items.length === 0 ? <StatePanel title="NO REWARDS YET" message="Create the first cosmetic definition above." /> : null}
    {items.length ? <div className="panel table-wrap"><table><thead><tr><th>Reward</th><th>Type</th><th>Unlocks</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}>
      <td><strong>{item.name}</strong><small>{item.code} · {item.description}</small></td><td>{item.cosmeticType}</td><td>{item.unlockCount}</td><td><Badge tone={item.isActive ? "green" : "coral"}>{item.isActive ? "Active" : "Inactive"}</Badge></td><td><button onClick={() => toggle(item)}>{item.isActive ? "Disable" : "Enable"}</button></td>
    </tr>)}</tbody></table></div> : null}
  </>;
}
