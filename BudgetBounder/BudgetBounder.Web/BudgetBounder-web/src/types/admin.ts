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
