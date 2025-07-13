import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  console.log(
    "🛡️ ProtectedRoute - Loading:",
    loading,
    "User:",
    user ? "exists" : "null",
    "Initialized:",
    initialized
  );

  // Show loading spinner while checking auth
  if (loading || !initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600/30"></div>
        </div>
      </div>
    );
  }

  // ✅ Only redirect if not loading, initialized, and no user
  if (!loading && initialized && !user) {
    console.log("🚫 No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ If we have a user and are initialized, render the content
  if (user && initialized) {
    console.log("✅ User authenticated, rendering protected content");
    return children;
  }

  // ✅ Fallback - show loading while we figure out the state
  console.log("⏳ Waiting for authentication state to resolve...");
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600/30"></div>
      </div>
    </div>
  );
}
