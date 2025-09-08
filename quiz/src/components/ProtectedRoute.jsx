import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, credits, isPremium, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isPremium && credits <= 0) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold">Out of Credits</h2>
        <p>You've used your 5 free quizzes for today.</p>
        <p>Come back in 24h or upgrade to Premium.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;