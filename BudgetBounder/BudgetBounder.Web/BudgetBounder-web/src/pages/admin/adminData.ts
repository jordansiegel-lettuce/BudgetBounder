import type { AdminAuditEntry, AiRecommendation, GameSession } from "../../types/admin";

export function filterAuditEntries(entries: AdminAuditEntry[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) =>
    [entry.action, entry.targetType, entry.targetId, entry.details]
      .some((value) => value.toLowerCase().includes(normalized)));
}

export function filterRecommendations(items: AiRecommendation[], status: string) {
  return status === "All" ? items : items.filter((item) => item.status === status);
}

export function summarizeGameSessions(sessions: GameSession[]) {
  return sessions.reduce((summary, session) => ({
    total: summary.total + 1,
    valid: summary.valid + (session.validationState === "Valid" ? 1 : 0),
    flagged: summary.flagged + (session.validationState === "Flagged" ? 1 : 0),
    awardedXp: summary.awardedXp + session.awardedXp,
  }), { total: 0, valid: 0, flagged: 0, awardedXp: 0 });
}

export const cosmeticTypes = ["Badge", "Theme", "AvatarFrame"] as const;
export function isAllowedCosmeticType(value: string) {
  return cosmeticTypes.some((type) => type === value);
}
