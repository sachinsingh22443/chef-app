import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";

export default function Orders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [subscriptionOrders, setSubscriptionOrders] = useState<any[]>([]);

  const [loadingId, setLoadingId] = useState<string | null>(null); // 🔥 FIX

  useEffect(() => {
    fetchOrders();
    fetchSubscriptions();
  }, []);

  // =========================
  // 🔥 FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("https://chef-backend-1.onrender.com/orders/chef-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = res.data.orders || []; // 🔥 FIX

      const newArr: any[] = [];
      const activeArr: any[] = [];
      const completedArr: any[] = [];

      orders.forEach((o: any) => {
        const items = o.items?.length
          ? o.items.map((i: any) => `${i.name} x${i.quantity}`).join(", ")
          : "";

        const formatted = {
          id: o.id,
          customer: o.customer_name || "Guest",
          items: items,
          time: o.created_at
            ? new Date(o.created_at).toLocaleString()
            : "Just now",
          amount: o.total_price || 0,
          status: o.status,
          prepTime: o.status === "ready" ? "Ready" : "15 min",
          address: o.address || "N/A",
          phone: o.phone || "N/A",
        };

        if (o.status === "pending") newArr.push(formatted);
        else if (["accepted", "preparing", "ready", "out_for_delivery"].includes(o.status))
          activeArr.push(formatted);
        else if (o.status === "delivered") completedArr.push(formatted);
      });

      setNewOrders(newArr);
      setActiveOrders(activeArr);
      setCompletedOrders(completedArr);

    } catch (err) {
      console.log("ORDER ERROR:", err);
    }
  };

  // =========================
  // 🔥 SEARCH FILTER (SAFE)
  // =========================
  const filterOrders = (orders: any[]) => {
    return orders.filter((order) =>
      (order.customer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // =========================
  // 🔥 UPDATE STATUS (SAFE)
  // =========================
  const updateStatus = async (id: string, status: string) => {
    if (loadingId === id) return; // 🔥 prevent spam

    try {
      setLoadingId(id);

      const token = localStorage.getItem("token");

      await axios.put(
        `https://chef-backend-1.onrender.com/orders/${id}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchOrders();
    } catch (err) {
      console.log("STATUS ERROR:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // =========================
  // 🔥 FETCH SUBSCRIPTIONS
  // =========================
  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("https://chef-backend-1.onrender.com/subscriptions/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = (res.data || []).map((s: any) => ({
        id: s.id,
        customer: s.customer || "Guest",
        plan: s.plan,
        items: `${s.dish} x${s.quantity}`,
        nextDelivery: s.time,
        amount: s.amount || 0,
      }));

      setSubscriptionOrders(mapped);

    } catch (err) {
      console.log("SUB ERROR:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Orders</h1>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 bg-white rounded-2xl border-none"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 py-6">
        <Tabs defaultValue="new" className="w-full">

          <TabsList className="w-full bg-white rounded-2xl p-1 mb-6">
            <TabsTrigger value="new" className="flex-1 rounded-xl">New</TabsTrigger>
            <TabsTrigger value="active" className="flex-1 rounded-xl">Active</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-xl">Completed</TabsTrigger>
            <TabsTrigger value="subscription" className="flex-1 rounded-xl">Subscription</TabsTrigger>
          </TabsList>

          {/* NEW */}
          <TabsContent value="new" className="space-y-4">
            {filterOrders(newOrders).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-3xl p-5 shadow-lg border-2 border-blue-200 cursor-pointer"
              >
                <p className="font-bold">{order.customer}</p>
                <p>{order.items}</p>
                <p className="text-sm text-gray-500">{order.address}</p>

                <div className="flex justify-between mt-2">
                  <span>{order.time}</span>
                  <span>₹{order.amount}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(order.id, "cancelled");
                    }}
                    className="py-3 bg-red-50 text-red-600 rounded-xl"
                  >
                    Reject
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(order.id, "accepted");
                    }}
                    className="py-3 bg-green-500 text-white rounded-xl"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ACTIVE */}
          <TabsContent value="active" className="space-y-4">
            {filterOrders(activeOrders).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-3xl p-5 shadow-lg cursor-pointer"
              >
                <p className="font-bold">{order.customer}</p>
                <p>{order.items}</p>
                <p className="text-sm text-gray-500">{order.address}</p>

                <div className="flex justify-between">
                  <span>{order.time}</span>
                  <span>₹{order.amount}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(order.id, "delivered");
                  }}
                  className="w-full mt-3 py-3 bg-orange-500 text-white rounded-xl"
                >
                  Mark Delivered
                </button>
              </div>
            ))}
          </TabsContent>

          {/* COMPLETED */}
          <TabsContent value="completed" className="space-y-4">
            {filterOrders(completedOrders).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-3xl p-5 shadow-lg cursor-pointer"
              >
                <p className="font-bold">{order.customer}</p>
                <p>{order.items}</p>
                <p className="text-sm text-gray-500">{order.address}</p>
                <span className="font-bold">₹{order.amount}</span>
              </div>
            ))}
          </TabsContent>

          {/* SUBSCRIPTIONS (same as before) */}
          {/* SUBSCRIPTIONS */}
<TabsContent value="subscription" className="space-y-4">
  {subscriptionOrders.length === 0 ? (
    <div className="bg-white rounded-3xl p-12 text-center">
      <div className="text-6xl mb-4">📅</div>
      <p className="text-gray-500 mb-2">No subscription orders</p>
      <button
        onClick={() => navigate("/app/subscriptions")}  // ✅ FIXED
        className="text-orange-500 font-medium"
      >
        View Subscription Settings
      </button>
    </div>
  ) : (
    subscriptionOrders.map((order) => (
      <div
        key={order.id}
        onClick={() => navigate("/app/subscriptions")}  // ✅ FIXED
        className="bg-white rounded-3xl p-5 shadow-lg border-2 border-purple-200 cursor-pointer"
      >
        <p className="font-bold">{order.customer}</p>
        <p>{order.items}</p>
      </div>
    ))
  )}
</TabsContent>


        </Tabs>
      </div>
    </div>
  );
}