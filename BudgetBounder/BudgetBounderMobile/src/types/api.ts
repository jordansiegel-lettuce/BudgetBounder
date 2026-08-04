export type UserProfile = {
  id: number;
  fullName: string;
  email?: string;
  level: number;
  xp: number;
  role: 'User' | 'Admin';
  currentStreak: number;
  longestStreak?: number;
};

export type AuthResponse = { token: string; user: UserProfile };

export type DashboardResponse = {
  user: Pick<UserProfile, 'id' | 'fullName' | 'level' | 'xp' | 'currentStreak'>;
  finance: {
    budget: number;
    income: number;
    spent: number;
    remainingBudget: number;
    categorySpending: Record<string, number>;
  };
  mission: null | {
    id: number;
    title: string;
    description: string;
    xpReward: number;
    currentProgress: number;
    targetValue: number;
    expiresAt?: string;
  };
  goal: null | {
    id: number;
    title: string;
    currentAmount: number;
    targetAmount: number;
    deadline: string;
  };
  recentTransactions: Transaction[];
};

export type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: string;
  receiptImageDataUrl?: string;
  latitude?: number;
  longitude?: number;
  merchantAddress?: string;
};
