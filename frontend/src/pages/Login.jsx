import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GitHubAuthButton from "../components/Auth/GitHubAuthButton";

export default function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    const redirectTo = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to DevDash</h1>
          <p className="text-gray-600 mb-6">
            Connect with GitHub to access your developer dashboard
          </p>
          <div className="flex justify-center">
            <GitHubAuthButton />
          </div>
          <p className="text-sm text-gray-500 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}   