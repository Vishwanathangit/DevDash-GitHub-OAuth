import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log(
    "🛡️ ProtectedRoute - Loading:",
    loading,
    "User:",
    user ? "exists" : "null"
  );

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600/30"></div>
        </div>
      </div>
    );
  }

  // Only redirect if not loading and no user
  if (!loading && !user) {
    console.log("🚫 No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ User authenticated, rendering protected content");
  return children;
}
