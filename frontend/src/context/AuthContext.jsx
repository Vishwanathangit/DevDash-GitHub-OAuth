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

      // ✅ Check for token in URL (fallback from OAuth)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
        console.log("🔑 Found token in URL, setting as cookie...");
        // Set the token as a cookie
        document.cookie = `token=${tokenFromUrl}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
        
        // Clear the token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log("✅ Token set as cookie from URL");
      }

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

  // ✅ Add effect to handle URL parameters after OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      console.log("❌ OAuth error detected:", error);
      // Clear any error parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  // ✅ Add function to check if we're coming from OAuth callback
  const checkOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const token = urlParams.get('token');
    
    if (code && state) {
      console.log("🔄 Detected OAuth callback, waiting for cookie...");
      // Wait a bit for the cookie to be set, then refresh user state
      setTimeout(async () => {
        console.log("🔄 Checking user state after OAuth callback...");
        const success = await refreshUser();
        if (success) {
          console.log("✅ User authenticated after OAuth callback");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("❌ Failed to authenticate after OAuth callback");
          navigate("/login", { replace: true });
        }
      }, 1000);
    } else if (token) {
      console.log("🔑 Detected token in URL, setting cookie and checking user...");
      // Set the token as a cookie
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
      
      // Clear the token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Check user state
      setTimeout(async () => {
        const success = await refreshUser();
        if (success) {
          console.log("✅ User authenticated with token from URL");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("❌ Failed to authenticate with token from URL");
          navigate("/login", { replace: true });
        }
      }, 500);
    }
  };

  // ✅ Check for OAuth callback on mount
  useEffect(() => {
    checkOAuthCallback();
  }, []);

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
