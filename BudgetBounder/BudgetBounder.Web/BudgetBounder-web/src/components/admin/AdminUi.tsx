import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function StatCard({ label, value, tone = "cyan" }: { label: string; value: ReactNode; tone?: "cyan" | "gold" | "green" | "violet" }) {
  return <article className={`panel stat-card tone-${tone}`}><span className="mono-label">{label}</span><strong>{value}</strong></article>;
}
export function StatePanel({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <div className="panel state-panel"><span className="mono-label coral">{title}</span><p>{message}</p>{action}</div>;
}
export function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "gold" | "coral" | "cyan" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
