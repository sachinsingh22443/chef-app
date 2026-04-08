import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Dashboard API
      const res = await axios.get("https://chef-backend-1.onrender.com/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
      setWeeklyData(res.data.weekly_data || []);
      setTopDishes(res.data.top_dishes || []);

      // ✅ Active Orders
      const ordersRes = await axios.get(
        "https://chef-backend-1.onrender.com/orders/chef-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const active = ordersRes.data
        .filter((o: any) =>
          ["accepted", "preparing", "ready"].includes(o.status)
        )
        .map((order: any) => ({
          id: order.id,
          customer: "Customer",
          items: order.items.map((i: any) => i.item_name).join(", "),
          amount: order.total_price,
        }));

      setActiveOrders(active);

    } catch (err) {
      console.log("Dashboard Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-32">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, Chef 👨‍🍳
            </h1>
            <p className="text-white/90">Let’s grow your kitchen 🚀</p>
          </div>

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

        {/* 🔥 THIS MONTH */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 shadow-lg text-white mb-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold">This Month</h3>
            <IndianRupee className="w-8 h-8" />
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold mb-2">
              ₹{stats?.monthly_earnings?.toLocaleString() || 0}
            </p>
            <p className="text-green-100 text-sm">
              Performance overview
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-300/30">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Orders</p>
              <p className="text-2xl font-bold">
                {stats?.monthly_orders || 0}
              </p>
            </div>
            <div>
              <p className="text-green-100 text-sm mb-1">Avg/Order</p>
              <p className="text-2xl font-bold">
                ₹{Math.round(stats?.avg_order_value || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* 📊 WEEKLY GRAPH */}
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


        {/* 🔥 QUICK ACTIONS */}
<div className="mb-6">
  <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>

  <div className="grid grid-cols-2 gap-4">

    {/* Add Menu */}
    <button
      onClick={() => navigate("/menu/add")}
      className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white flex flex-col items-center justify-center active:scale-95 shadow-lg"
    >
      <div className="text-4xl mb-2">+</div>
      <span className="font-medium">Add Menu Item</span>
    </button>

    {/* Tomorrow Special */}
    <button
      onClick={() => navigate("/tomorrow-special")}
      className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white flex flex-col items-center justify-center active:scale-95 shadow-lg"
    >
      <div className="text-4xl mb-2">⭐</div>
      <span className="font-medium">Tomorrow Special</span>
    </button>

  </div>
</div>

        {/* 🏆 TOP DISHES */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">
            Top Performing Dishes
          </h3>

          <div className="space-y-3">
            {topDishes.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No data available
              </p>
            ) : (
              topDishes.map((dish, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {dish.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dish.orders} orders
                    </p>
                  </div>

                  <span className="font-bold text-green-600">
                    ₹{dish.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTIVE ORDERS */}
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">Active Orders</h3>
            <button onClick={() => navigate("/orders")}>
              View All →
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <p>No active orders</p>
          ) : (
            activeOrders.map((order) => (
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

      </div>
    </div>
  );
}