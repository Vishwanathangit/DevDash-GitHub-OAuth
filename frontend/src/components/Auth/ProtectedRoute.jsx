import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();


  
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

  
  if (!loading && initialized && !user) {
   
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  if (user && initialized) {
    
    return children;
  }



  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600/30"></div>
      </div>
    </div>
  );
}
