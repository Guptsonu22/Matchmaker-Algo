import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '@/api/auth';
import type { LoginCredentials, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('dc_token');
    const stored = localStorage.getItem('dc_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        localStorage.removeItem('dc_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token, user: authedUser } = await authApi.login(credentials);
    localStorage.setItem('dc_token', token);
    localStorage.setItem('dc_user', JSON.stringify(authedUser));
    setUser(authedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dc_token');
    localStorage.removeItem('dc_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
