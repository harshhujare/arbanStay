import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Shows loading while auth state initializes, then redirects if not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth to initialize before making decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  // If not authenticated after loading, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Authenticated - render the protected content
  return children;
}
