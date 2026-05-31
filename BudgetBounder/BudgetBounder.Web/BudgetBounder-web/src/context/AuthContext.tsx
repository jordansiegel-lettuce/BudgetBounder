import { createContext, useContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/User";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  level: string;
  xp: string;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return {
      id: parseInt(payload.sub, 10),
      fullName: payload.name,
      email: payload.email,
      level: parseInt(payload.level, 10),
      xp: parseFloat(payload.xp),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("budgetbounder_user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  function login(newToken: string) {
    const newUser = decodeUser(newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("budgetbounder_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("budgetbounder_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
