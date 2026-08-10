import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useIconStyles } from '../utils/iconStyles';
import { roleHomePath } from '../utils/routes';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const isAllowed = Boolean(user && (!allowedRoles || allowedRoles.includes(user.role)));

  useIconStyles(!loading && isAllowed);

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children;
}
