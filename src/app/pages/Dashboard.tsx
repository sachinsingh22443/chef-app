import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Location from "./Location";

import axios from "axios";
import {
  Package,
  Star,
  IndianRupee,
  Bell
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [locationName, setLocationName] = useState("Set Kitchen Location");

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =========================
  // 🔥 FETCH DASHBOARD
  // =========================
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Dashboard API
      const res = await axios.get("https://chef-backend-qh12.onrender.com/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data || {});
      setWeeklyData(res.data?.weekly_data || []);
      setTopDishes(res.data?.top_dishes || []);

      // =========================
      // ✅ ORDERS API (FIXED)
      // =========================
      const ordersRes = await axios.get(
        "https://chef-backend-qh12.onrender.com/orders/chef-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orders = ordersRes.data?.orders || []; // 🔥 FIX

      const active = orders
        .filter((o: any) =>
          ["accepted", "preparing", "ready"].includes(o.status)
        )
        .map((order: any) => ({
          id: order.id,
          customer: order.customer_name || "Customer",
          items: order.items?.map((i: any) => i.name).join(", ") || "", // 🔥 FIX
          amount: order.total_price || 0,
        }));

      setActiveOrders(active);

    } catch (err: any) {
  console.log("Dashboard Error:", err);

  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    navigate("/auth/login"); // ya tumhara login route
  }
}
  };

  // =========================
  // 📍 LOCATION LOAD
  // =========================
  useEffect(() => {
    const saved = localStorage.getItem("location_name");
    if (saved) setLocationName(saved);
  }, []);
  return (
  <div className="min-h-screen bg-gray-50">

    {/* HEADER */}
    <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-32">
      <div className="flex justify-between items-start mb-6">
        
        {/* LEFT */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, Chef 👨‍🍳
          </h1>
          <p className="text-white/90">Let’s grow your kitchen 🚀</p>

          {/* LOCATION */}
          <div
            className="flex items-center gap-2 mt-2 cursor-pointer"
            onClick={() => setShowLocation(true)}
          >
            <MapPin className="w-5 h-5 text-white" />
            <p className="text-white text-sm font-medium">
              {locationName}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <button
          onClick={() => navigate("/notifications")}
          className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"
        >
          <Bell className="w-6 h-6 text-white" />
        </button>

      </div>
    </div>

    <div className="px-6 -mt-24 pb-8">

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <Package className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-gray-500 text-sm">Total Orders</p>
          <span className="text-3xl font-bold">
            {stats?.total_orders || 0}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <Star className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-gray-500 text-sm">Avg Rating</p>
          <span className="text-3xl font-bold">
            {stats?.avg_rating || 0}
          </span>
        </div>
      </div>

      {/* TODAY EARNINGS */}
      <div className="bg-white rounded-3xl p-5 shadow-lg mb-6">
        <IndianRupee className="w-6 h-6 text-purple-600 mb-2" />
        <p className="text-gray-500 text-sm">Today's Earnings</p>
        <span className="text-3xl font-bold">
          ₹{stats?.today_earnings || 0}
        </span>
      </div>

      {/* MONTH */}
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 shadow-lg text-white mb-6">
        <h3 className="text-xl font-bold mb-4">This Month</h3>

        <p className="text-3xl font-bold mb-2">
          ₹{stats?.monthly_earnings?.toLocaleString() || 0}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-300/30">
          <div>
            <p className="text-sm">Total Orders</p>
            <p className="text-2xl font-bold">
              {stats?.monthly_orders || 0}
            </p>
          </div>
          <div>
            <p className="text-sm">Avg/Order</p>
            <p className="text-2xl font-bold">
              ₹{Math.round(stats?.avg_order_value || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* GRAPH */}
      <div className="bg-white rounded-3xl p-5 shadow-lg mb-6">
        <h3 className="font-bold mb-4">Weekly Performance</h3>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="earnings" stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-6">
        <h3 className="font-bold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/menu/add")}
            className="bg-orange-500 rounded-3xl p-6 text-white"
          >
            Add Menu Item
          </button>

          <button
            onClick={() => navigate("/tomorrow-special")}
            className="bg-purple-500 rounded-3xl p-6 text-white"
          >
            Tomorrow Special
          </button>
        </div>
      </div>

      {/* ACTIVE ORDERS */}
      <div>
        <h3 className="font-bold mb-4">
  Active Orders ({activeOrders.length})
</h3>

        {activeOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center text-gray-500">
  🎉 No active orders right now
</div>
        ) : (
          activeOrders.slice(0, 3).map((order) => (
            
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white p-4 mb-3 rounded-xl shadow cursor-pointer"
            >
              <p className="font-bold">{order.customer}</p>
              <p className="text-sm">{order.items}</p>
              <p>₹{order.amount}</p>
            </div>
          ))
        

        )}
       
      </div>
    <button
  onClick={() => navigate("/orders")}
  className="w-full mt-3 py-3 bg-orange-100 text-orange-600 rounded-xl"
>
  View All Orders
</button>


    </div>

    {/* ✅ LOCATION MODAL (FIXED POSITION) */}
    {showLocation && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <Location
      onLocationSelect={async (lat, lng, city) => {
  try {
    setLocationName(city);

    const token = localStorage.getItem("token");

    if (!token) {
      console.error(" No token found");
      return;
    }

    const res = await fetch(
      "https://chef-backend-qh12.onrender.com/menu/chef/set-location",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          latitude: lat.toString(),
          longitude: lng.toString(),
          location: city,
        }),
      }
    );

    if (res.status === 401) {
    localStorage.removeItem("token");
    navigate("/auth/login");
    return;
 }

    if (!res.ok) {
      throw new Error("Failed to save location");
    }

    const data = await res.json();

    console.log(" Location saved:", data);

    localStorage.setItem("lat", lat.toString());
    localStorage.setItem("lng", lng.toString());
    localStorage.setItem("location_name", city);

    alert("Location saved successfully ✅");

  } catch (err) {
    console.error("❌ Location error:", err);
  } finally {
    setShowLocation(false);
  }
  }}


      onClose={() => setShowLocation(false)}
    />
  </div>
)}



  </div>
);
}