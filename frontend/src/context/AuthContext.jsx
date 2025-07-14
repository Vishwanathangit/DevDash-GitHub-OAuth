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
  
    if (initialized) return;

    const initializeAuth = async () => {
 

   
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
       
        
      
        const isSecure = window.location.protocol === 'https:';
        const cookieValue = `token=${tokenFromUrl}; path=/; max-age=${7 * 24 * 60 * 60}`;
        
        if (isSecure) {
          document.cookie = `${cookieValue}; secure; samesite=strict`;
        } else {
          document.cookie = `${cookieValue}; samesite=lax`;
        }
        
    
        if (isSecure) {
          document.cookie = `token_alt=${tokenFromUrl}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;
          document.cookie = `token_cross=${tokenFromUrl}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;
        }
        
   
        window.history.replaceState({}, document.title, window.location.pathname);
        
        
      }

      try {
   
        const profile = await getProfile();

        if (profile && profile.user) {
          
          setUser(profile.user);
        } else {
        
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

      }
    };

    initializeAuth();
  }, [initialized]);


  useEffect(() => {
    if (!initialized || loading) return;

    
    if (window.location.pathname === "/dashboard" && !user) {
  
      navigate("/login", { replace: true });
    }


    if (window.location.pathname === "/login" && user) {
    
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, initialized, navigate]);

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      console.log("OAuth error detected:", error);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(false); 
    }
  }, []);

  const login = async() => {
    try {
     
      setLoading(true);
      await loginWithGithub(); 
      setInitialized(true)
    } catch (error) {
    
      navigate("/login", { replace: true });
    }
    finally{
      setLoading(false)
    }
  };

  const logout = async () => {
    try {
 
      setLoading(true);
      await logoutUser();
   
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setLoading(false);
      
      navigate("/login", { replace: true });
    }
  };


  const refreshUser = async () => {
    try {
   
      const profile = await getProfile();
      if (profile && profile.user) {
        setUser(profile.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    initialized
  };



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
