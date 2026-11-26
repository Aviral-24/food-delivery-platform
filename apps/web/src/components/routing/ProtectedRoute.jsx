import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * @param {{ allowedRoles?: string[] }} props
 */
export function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}