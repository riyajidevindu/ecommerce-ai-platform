import { createContext } from 'react';

export interface User {
  username: string;
  email: string;
  id: number;
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  updateProfile: (data: { username?: string; email?: string; current_password?: string; new_password?: string }) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
  loginWithToken: async () => {},
  updateProfile: async () => { throw new Error('updateProfile not initialized'); },
});
