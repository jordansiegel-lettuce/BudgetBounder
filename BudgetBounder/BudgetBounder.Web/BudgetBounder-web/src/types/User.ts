export type User ={
    id: number;
    fullName: string;
    email: string;
    level : number;
    xp: number;
    role: "User" | "Admin";
    isActive?: boolean;
    lastActiveAt?: string | null;
    currentStreak?: number;
};
