import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginWithGithub, logoutUser, getProfile } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const profile = await getProfile();
        setUser(profile.user);
      } catch (error) {
        console.error("User not logged in or session expired:", error);
        setUser(null);
        // Only redirect to login if trying to access protected routes
        if (location.pathname === "/dashboard") {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  const login = () => {
    try {
      loginWithGithub(); // redirects to GitHub OAuth
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/login", { replace: true });
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); // clears the cookie
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
