import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, Check } from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH NOTIFICATIONS
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("https://chef-backend-qh12.onrender.com/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data);
    } catch (err) {
      console.log("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MARK SINGLE AS READ
  const markAsRead = async (id: string) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `https://chef-backend-qh12.onrender.com/notifications/${id}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchNotifications();
  } catch (err) {
    console.log(err);
  }
};

  // ✅ MARK ALL AS READ
  const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      "https://chef-backend-qh12.onrender.com/notifications/mark-all-read",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchNotifications();
  } catch (err) {
    console.log(err);
  }
};

  // ✅ ICON SELECTOR
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "🛒";
      case "payment":
        return "💰";
      case "review":
        return "⭐";
      case "system":
        return "📢";
      default:
        return "🔔";
    }
  };

  // ✅ TIME FORMAT
  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Notifications
            </h1>
            <p className="text-white/90">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-white/20 rounded-xl text-white text-sm"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-6 py-6 space-y-3">

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() =>
              notification.unread && markAsRead(notification.id)
                }
              className={`bg-white rounded-3xl p-5 shadow-lg cursor-pointer ${
                !notification.unread
                  ? "border border-gray-100"
                  : "border-2 border-orange-200 bg-orange-50/30"
              }`}
            >
              <div className="flex items-start gap-4">

                {/* ICON */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    !notification.unread ? "bg-gray-100" : "bg-orange-100"
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-gray-800">
                      {notification.title}
                    </h3>

                    {notification.unread && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      {notification.time}
                    </p>

                    {!notification.unread && (
                   <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        )}

        {/* SETTINGS */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 mt-6">
          <h3 className="font-bold text-gray-800 mb-4">
            Notification Preferences
          </h3>

          <div className="space-y-3">
            {[
              { icon: "🛒", label: "Order Notifications" },
              { icon: "💰", label: "Payment Alerts" },
              { icon: "⭐", label: "Review Notifications" },
              { icon: "📢", label: "System Updates" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}