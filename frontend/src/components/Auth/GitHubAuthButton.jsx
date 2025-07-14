import { useAuth } from "../../context/AuthContext";
import { FaGithub } from "react-icons/fa";

export default function GitHubAuthButton() {
  const { login, user, loading, initialized } = useAuth();

  return (
    <button
      onClick={login}
      className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
    >
      <FaGithub className="text-xl" />
      <span>Login with GitHub</span>
    </button>
  );
}   