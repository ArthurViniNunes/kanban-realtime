import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  function handleLogout() {
    logout();

    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Kanban Realtime
          </Link>

          <div className="flex items-center gap-3">
            <span
              className="max-w-[200px] truncate text-sm font-medium text-muted-foreground"
              title={user?.name}
            >
              {user?.name}
            </span>

            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
