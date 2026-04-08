import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/signup" replace />;
  }

  return children;
}