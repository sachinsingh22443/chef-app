import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  // 🔥 FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://chef-backend-1.onrender.com/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          description: "Update your personal information",
          action: () => navigate("/profile/edit"),
        },
        {
          icon: Lock,
          label: "Change Password",
          description: "Update your security credentials",
          action: () => navigate("/change-password"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage notification settings",
          action: () => navigate("/notifications"),
        },
      ],
    },
    {
      title: "Business",
      items: [
        {
          icon: FileText,
          label: "Terms & Conditions",
          description: "Read our terms of service",
          action: () => navigate("/terms"), // ✅ FIX
        },
        {
          icon: Shield,
          label: "Privacy Policy",
          description: "How we handle your data",
          action: () => navigate("/privacy"), // ✅ FIX
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          description: "Get help or contact us",
          action: () => navigate("/support"), // ✅ FIX
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-b-[40px] p-6 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/90">Manage your account and preferences</p>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* PROFILE */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-3xl overflow-hidden bg-gray-200">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-3xl">
                  👨‍🍳
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-500">
                {user?.email || "No email"}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ Verified Chef
              </p>
            </div>

          </div>
        </div>

        {/* SECTIONS */}
        {settingsSections.map((section, index) => (
          <div key={index}>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 px-2">
              {section.title}
            </h3>

            <div className="bg-white rounded-3xl p-3 shadow-lg border space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;

                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>

                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-gray-400">→</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* APP INFO */}
        <div className="bg-white rounded-3xl p-5 shadow-lg text-center">
          <p className="text-sm text-gray-500">Chef Partner App</p>
          <p className="text-xs text-gray-400">Version 1.0.0</p>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/auth/login");
          }}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-red-200 text-red-600 rounded-2xl"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

      </div>
    </div>
  );
}