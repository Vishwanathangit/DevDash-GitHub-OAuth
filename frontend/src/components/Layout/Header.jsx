import { useAuth } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">DevDash</h1>
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
              )}
              <span className="font-medium">{user.username}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}