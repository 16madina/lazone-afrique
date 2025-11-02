import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { PageLoader } from './PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  
  // Afficher le loader pendant le chargement
  if (loading || roleLoading) {
    return <PageLoader />;
  }
  
  // Rediriger vers la page de connexion si pas d'utilisateur
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Vérifier les droits admin si requis
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
