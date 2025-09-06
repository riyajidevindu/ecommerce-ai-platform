import { ReactNode, useEffect, useState } from 'react';
import { AuthContext, User } from './AuthContextBase';
import { login as apiLogin, logout as apiLogout, setAuthToken, getCurrentUser, apiClient, updateCurrentUser } from '@/services/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const STORAGE_KEY = 'access_token';

  useEffect(() => {
    const rehydrateSession = async () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setAuthToken(stored);
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return;
          } catch (e) {
            // token invalid; proceed to refresh flow
          }
        }
        const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/refresh');
        const { access_token } = response.data;
        setAuthToken(access_token);
        sessionStorage.setItem(STORAGE_KEY, access_token);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        setAuthToken('');
        sessionStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    rehydrateSession();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token } = await apiLogin(username, password);
      setAuthToken(access_token);
      sessionStorage.setItem(STORAGE_KEY, access_token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      setAuthToken('');
      sessionStorage.removeItem(STORAGE_KEY);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
  try { await apiLogout(); } catch { /* ignore logout failure */ }
    finally {
      setUser(null);
      setAuthToken('');
      sessionStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
    }
  };

  const loginWithToken = async (token: string) => {
    setIsLoading(true);
    try {
      setAuthToken(token);
      sessionStorage.setItem(STORAGE_KEY, token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      setAuthToken('');
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { username?: string; email?: string; current_password?: string; new_password?: string }) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await updateCurrentUser(data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, loginWithToken, updateProfile }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
