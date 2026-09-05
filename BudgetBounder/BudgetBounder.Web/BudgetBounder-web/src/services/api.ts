import axios from "axios";
import type { AnalyticsData, AnalyticsFilters } from "../pages/admin/analyticsData";
import { resolveWebApiUrl } from "./apiUrl";
import type { AdminAuditEntry, AiRecommendation, GameSession, RewardDefinition } from "../types/admin";

const api = axios.create({
  baseURL: resolveWebApiUrl(import.meta.env.VITE_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const adminApi = {
  analytics: (params?: AnalyticsFilters) => api.get<AnalyticsData>("/admin/analytics", { params }).then((response) => response.data),
  auditLog: () => api.get<AdminAuditEntry[]>("/admin/audit-log").then((response) => response.data),
  aiRecommendations: (status?: string) => api.get<AiRecommendation[]>("/admin/ai-recommendations", { params: status && status !== "All" ? { status } : {} }).then((response) => response.data),
  reviewAiRecommendation: (id: number, decision: "Approved" | "Rejected") => api.patch(`/admin/ai-recommendations/${id}/review`, { decision }),
  gameSessions: () => api.get<GameSession[]>("/admin/game-sessions").then((response) => response.data),
  rewards: () => api.get<RewardDefinition[]>("/admin/rewards").then((response) => response.data),
  createReward: (request: { code: string; name: string; description: string; cosmeticType: string }) => api.post<RewardDefinition>("/admin/rewards", request).then((response) => response.data),
  setRewardStatus: (id: number, isActive: boolean) => api.patch(`/admin/rewards/${id}/status`, { isActive }),
};
