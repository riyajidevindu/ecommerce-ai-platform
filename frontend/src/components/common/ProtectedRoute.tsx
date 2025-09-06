import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { ReactNode } from 'react';
import { LoadingState } from './LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
