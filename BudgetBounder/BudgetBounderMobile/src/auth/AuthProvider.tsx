import api from '@/src/services/api';
import type { AuthResponse, UserProfile } from '@/src/types/api';
import AuthStorage from './authStorage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  register(fullName: string, email: string, password: string): Promise<void>;
  refreshUser(): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'budgetbounder.token';
const USER_KEY = 'budgetbounder.user';

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AuthStorage.getItemAsync(TOKEN_KEY), AuthStorage.getItemAsync(USER_KEY)])
      .then(([storedToken, storedUser]) => {
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (response: AuthResponse) => {
    await Promise.all([
      AuthStorage.setItemAsync(TOKEN_KEY, response.token),
      AuthStorage.setItemAsync(USER_KEY, JSON.stringify(response.user)),
    ]);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/users/login', { email, password });
    await persist(data);
  }, [persist]);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    await api.post('/users/register', { fullName, email, password });
    await signIn(email, password);
  }, [signIn]);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get<UserProfile>('/users/me');
    await AuthStorage.setItemAsync(USER_KEY, JSON.stringify(data));
    setUser(data);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([AuthStorage.deleteItemAsync(TOKEN_KEY), AuthStorage.deleteItemAsync(USER_KEY)]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, signIn, register, refreshUser, signOut }),
    [token, user, loading, signIn, register, refreshUser, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
