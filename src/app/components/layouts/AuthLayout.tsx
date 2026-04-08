import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 p-6">
      <Outlet />
    </div>
  );
}
