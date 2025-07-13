import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-indigo-700 mb-6">
          Welcome to DevDash
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Your all-in-one dashboard for GitHub repositories, Dev.to articles, and
          event planning.
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}