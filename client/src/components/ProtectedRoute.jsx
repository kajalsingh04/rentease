import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Use it like: <ProtectedRoute><MyPage /></ProtectedRoute>
// Or only for some roles: <ProtectedRoute roles={['admin']}>...</ProtectedRoute>
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}