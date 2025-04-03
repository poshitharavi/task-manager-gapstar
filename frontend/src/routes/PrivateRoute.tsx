import { Navigate, useLocation } from "react-router-dom";
import { JSX } from "react";
import { useAuth } from "../context/AuthContext";
// import LoadingScreen from "../components/common/LoadingScreen";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // return <LoadingScreen message="Authenticating..." />;
    return "Loading...";
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
