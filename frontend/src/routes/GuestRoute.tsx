import { Navigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
