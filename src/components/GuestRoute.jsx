import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("access");

  if (isAuthenticated) {
    return <Navigate to={`/profile/${localStorage.getItem("uuid")}`} replace />;
  }

  return children;
}
