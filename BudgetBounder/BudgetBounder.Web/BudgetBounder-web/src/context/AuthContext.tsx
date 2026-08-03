import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types/User";
import { decodeUser } from "../auth/authToken";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

// The provider and hook intentionally share one module to keep auth state private.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
