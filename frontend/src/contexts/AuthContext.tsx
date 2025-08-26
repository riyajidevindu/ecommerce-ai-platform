import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, setAuthToken, getCurrentUser, apiClient } from '@/services/api';

interface User {
  username: string;
  email: string;
  id: number;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username, password) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
  loginWithToken: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set initial loading to true
  const STORAGE_KEY = 'access_token';

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  useEffect(() => {
    const rehydrateSession = async () => {
      try {
        // 1) Try restoring from session storage first (fast path)
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setAuthToken(stored);
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return; // we're good
          } catch (e) {
            // token might be expired, fall back to refresh
          }
        }

        // 2) Fall back to refresh token flow (requires HttpOnly cookie from server)
        const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/refresh');
        const { access_token } = response.data;
        setAuthToken(access_token);
        sessionStorage.setItem(STORAGE_KEY, access_token);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // This is expected if the user doesn't have a valid refresh token/cookie yet
        setUser(null);
        setAuthToken('');
        sessionStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    rehydrateSession();
  }, []);

  const login = async (username, password) => {
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
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout failed, but clearing session anyway.", error);
    } finally {
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, loginWithToken }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
