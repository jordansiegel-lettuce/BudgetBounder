import api from '@/src/services/api';
import type { AuthResponse, UserProfile } from '@/src/types/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  register(fullName: string, email: string, password: string): Promise<void>;
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
    Promise.all([SecureStore.getItemAsync(TOKEN_KEY), SecureStore.getItemAsync(USER_KEY)])
      .then(([storedToken, storedUser]) => {
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (response: AuthResponse) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, response.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
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

  const signOut = useCallback(async () => {
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, signIn, register, signOut }),
    [token, user, loading, signIn, register, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
