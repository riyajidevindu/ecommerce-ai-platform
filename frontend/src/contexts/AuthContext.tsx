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

  useEffect(() => {
    const rehydrateSession = async () => {
      try {
        const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/refresh');
        const { access_token } = response.data;
        setAuthToken(access_token);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        setAuthToken('');
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
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      setAuthToken('');
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
      setIsLoading(false);
    }
  };

  const loginWithToken = async (token: string) => {
    setIsLoading(true);
    try {
      setAuthToken(token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      setAuthToken('');
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
