import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  
  // Afficher le loader pendant le chargement
  if (loading) {
    return <PageLoader />;
  }
  
  // Rediriger vers la page de connexion si pas d'utilisateur
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // V?rifier les droits admin si requis
  if (requireAdmin && profile?.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
