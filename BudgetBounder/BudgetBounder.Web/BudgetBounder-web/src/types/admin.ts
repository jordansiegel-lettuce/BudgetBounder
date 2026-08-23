export type AdminOverview = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newRegistrations: number;
  transactionsLogged: number;
  missionsCompleted: number;
  averageUserLevel: number;
  savingsGoalsCreated: number;
  aiGeneratedMissions: number;
};

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  level: number;
  xp: number;
  role: "User" | "Admin";
  isActive: boolean;
  lastActiveAt: string | null;
  currentStreak: number;
};

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export type AdminAuditEntry = {
  id: number;
  adminUserId: number;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
};

export type AiRecommendation = {
  id: number;
  userId: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  reviewedByAdminId: number | null;
  reviewedAt: string | null;
};

export type GameSession = {
  id: number;
  userId: number;
  clientResultId: string;
  score: number;
  coins: number;
  savingsStars: number;
  durationSeconds: number;
  awardedXp: number;
  validationState: string;
  validationReason: string | null;
  submittedAt: string;
};

export type RewardDefinition = {
  id: number;
  code: string;
  name: string;
  description: string;
  cosmeticType: string;
  isActive: boolean;
  unlockCount: number;
  createdAt: string;
};
