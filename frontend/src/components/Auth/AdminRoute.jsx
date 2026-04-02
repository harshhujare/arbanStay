import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminRoute — wraps a route so only admin users can access it.
 * Redirects to "/" for unauthenticated or non-admin users.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
