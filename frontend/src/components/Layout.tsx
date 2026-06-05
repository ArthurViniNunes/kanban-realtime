import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../services/auth.service';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  function handleLogout() {
    authService.logout();

    navigate('/login');
  }

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <h2>Kanban Realtime</h2>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <main
        style={{
          padding: '2rem',
        }}
      >
        {children}
      </main>
    </div>
  );
}
