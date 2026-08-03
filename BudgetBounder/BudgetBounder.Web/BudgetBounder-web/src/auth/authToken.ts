import { jwtDecode } from "jwt-decode";
import type { User } from "../types/User";

type JwtPayload = {
  sub?: string;
  nameid?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  role?: "User" | "Admin";
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: "User" | "Admin";
  email: string;
  name: string;
  level: string;
  xp: string;
};

export function decodeUser(token: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const id = payload.sub ?? payload.nameid ?? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const role = payload.role ?? payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? "User";
    return {
      id: Number.parseInt(id ?? "0", 10),
      fullName: payload.name,
      email: payload.email,
      level: Number.parseInt(payload.level, 10),
      xp: Number.parseFloat(payload.xp),
      role,
    };
  } catch {
    return null;
  }
}

export const canAccessAdmin = (user: User | null) => user?.role === "Admin";
