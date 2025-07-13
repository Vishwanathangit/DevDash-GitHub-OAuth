import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGithub, logoutUser, getProfile } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only run initialization once
    if (initialized) return;

    const initializeAuth = async () => {
      console.log("🔍 Starting authentication initialization...");
      console.log("🌐 Current URL:", window.location.href);
      console.log("🍪 Current cookies:", document.cookie);
      console.log(
        "🎯 API Base URL:",
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      );

      try {
        console.log("📡 Attempting to fetch user profile...");
        const profile = await getProfile();

        if (profile && profile.user) {
          console.log("✅ User authenticated successfully:", profile.user);
          setUser(profile.user);
        } else {
          console.log("❌ No user profile found in response:", profile);
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Authentication initialization failed:", error);
        console.error("📊 Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });

        setUser(null);

        // Only clear cookies if it's a 401 error (unauthorized)
        if (error.response?.status === 401) {
          console.log("🔐 401 error - attempting to clear session...");
          try {
            await logoutUser();
            console.log("✅ Session cleared successfully");
          } catch (logoutError) {
            console.error("❌ Failed to clear session:", logoutError);
          }
        }
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log("🏁 Authentication initialization complete");
        console.log("👤 Final user state:", user);
        console.log("⏳ Final loading state:", false);
      }
    };

    initializeAuth();
  }, [initialized]);

  // ✅ Add effect to handle URL changes after login
  useEffect(() => {
    if (!initialized || loading) return;

    // Check if we're on the dashboard but have no user
    if (window.location.pathname === "/dashboard" && !user) {
      console.log("🚫 On dashboard but no user, redirecting to login");
      navigate("/login", { replace: true });
    }

    // Check if we're on login but have a user
    if (window.location.pathname === "/login" && user) {
      console.log("✅ On login but user exists, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, initialized, navigate]);

  const login = () => {
    try {
      console.log("🔐 Initiating GitHub login...");
      setLoading(true);
      loginWithGithub(); // redirects to GitHub OAuth
    } catch (error) {
      console.error("❌ Login initiation failed:", error);
      setLoading(false);
      navigate("/login", { replace: true });
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Initiating logout...");
      setLoading(true);
      await logoutUser();
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setUser(null);
      setLoading(false);
      console.log("🏠 Navigating to login page...");
      navigate("/login", { replace: true });
    }
  };

  // ✅ Add function to refresh user state
  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user state...");
      const profile = await getProfile();
      if (profile && profile.user) {
        setUser(profile.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to refresh user:", error);
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser, // ✅ Expose refresh function
  };

  console.log(
    "🏗️ AuthContext render - User:",
    user ? "exists" : "null",
    "Loading:",
    loading,
    "Initialized:",
    initialized
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
