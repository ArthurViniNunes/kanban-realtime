import { useEffect, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import { authService } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    await authService.login(email, password);

    const currentUser = await authService.me();

    setUser(currentUser);
  }

  function logout() {
    authService.logout();

    setUser(null);
  }

  useEffect(() => {
    async function loadUser() {
      try {
        if (!authService.isAuthenticated()) {
          setLoading(false);
          return;
        }

        const currentUser = await authService.me();

        setUser(currentUser);
      } catch {
        authService.logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
