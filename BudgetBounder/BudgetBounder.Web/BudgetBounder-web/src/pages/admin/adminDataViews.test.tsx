import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnalyticsContent } from "./Analytics";
import { filterAuditEntries, filterRecommendations, isAllowedCosmeticType, summarizeGameSessions } from "./adminData";

describe("admin data views", () => {
  it("renders analytics values returned by the API", () => {
    const html = renderToStaticMarkup(<AnalyticsContent data={{
      totalUsers: 4, activeUsers: 3, inactiveUsers: 1, newRegistrations: 2,
      transactionsLogged: 9, missionsCompleted: 5, averageUserLevel: 2.5,
      savingsGoalsCreated: 3, aiGeneratedMissions: 2,
    }} />);

    expect(html).toContain("TOTAL USERS");
    expect(html).toContain(">4<");
    expect(html).toContain("TRANSACTIONS");
  });

  it("filters audit entries by action, target, or details", () => {
    const entries = [
      { id: 1, adminUserId: 7, action: "CreateMission", targetType: "Mission", targetId: "12", details: "Weekly saver", createdAt: "2026-08-23T00:00:00Z" },
      { id: 2, adminUserId: 7, action: "SetUserStatus", targetType: "User", targetId: "4", details: "IsActive=False", createdAt: "2026-08-23T01:00:00Z" },
    ];

    expect(filterAuditEntries(entries, "weekly")).toEqual([entries[0]]);
    expect(filterAuditEntries(entries, "USER")).toEqual([entries[1]]);
  });

  it("filters AI recommendations by review status", () => {
    const items = [
      { id: 1, userId: 2, title: "A", content: "A", status: "Draft", createdAt: "2026-08-23", reviewedByAdminId: null, reviewedAt: null },
      { id: 2, userId: 3, title: "B", content: "B", status: "Approved", createdAt: "2026-08-23", reviewedByAdminId: 1, reviewedAt: "2026-08-23" },
    ];
    expect(filterRecommendations(items, "Draft")).toEqual([items[0]]);
    expect(filterRecommendations(items, "All")).toEqual(items);
  });

  it("summarizes valid and flagged game sessions", () => {
    const sessions = [
      { id: 1, userId: 1, clientResultId: "a", score: 100, coins: 2, savingsStars: 1, durationSeconds: 60, awardedXp: 10, validationState: "Valid", validationReason: null, submittedAt: "2026-08-23" },
      { id: 2, userId: 2, clientResultId: "b", score: 999, coins: 2, savingsStars: 1, durationSeconds: 2, awardedXp: 0, validationState: "Flagged", validationReason: "score", submittedAt: "2026-08-23" },
    ];
    expect(summarizeGameSessions(sessions)).toEqual({ total: 2, valid: 1, flagged: 1, awardedXp: 10 });
  });

  it("only allows safe cosmetic reward types", () => {
    expect(isAllowedCosmeticType("Badge")).toBe(true);
    expect(isAllowedCosmeticType("AvatarFrame")).toBe(true);
    expect(isAllowedCosmeticType("Cash")).toBe(false);
  });
});
