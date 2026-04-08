import { Outlet, useLocation, useNavigate, Navigate } from "react-router";
import { Home, ShoppingBag, Menu as MenuIcon, User } from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔐 auth check
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  const navItems = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/app/orders", icon: ShoppingBag, label: "Orders" },
    { path: "/app/menu", icon: MenuIcon, label: "Menu" },
    { path: "/app/profile", icon: User, label: "Profile" },
  ];

  // 🔥 FIXED ACTIVE LOGIC (important)
  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1"
              >
                <Icon
                  className={`w-6 h-6 ${
                    active ? "text-orange-500" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    active ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}