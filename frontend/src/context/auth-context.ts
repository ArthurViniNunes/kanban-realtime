import { createContext } from 'react';
import type { AuthUser } from '@/types/auth';

export interface AuthContextData {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData | null>(null);
