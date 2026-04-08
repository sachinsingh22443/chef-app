import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export default function SubscriptionOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");

  // ✅ STATES
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [todaysDeliveries, setTodaysDeliveries] = useState<any[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);

  // ✅ FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const subRes = await axios.get("https://chef-backend-1.onrender.com/subscriptions/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const todayRes = await axios.get("https://chef-backend-1.onrender.com/subscriptions/today", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const upcomingRes = await axios.get("https://chef-backend-1.onrender.com/subscriptions/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubscriptions(subRes.data);
      setTodaysDeliveries(todayRes.data);
      setUpcomingSchedule(upcomingRes.data);

    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-b-[40px] p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Subscriptions</h1>
            <p className="text-white/90">Manage recurring orders</p>
          </div>

          <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
            <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
            <p className="text-xs text-white/80">Active</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-md">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "daily" ? "bg-purple-500 text-white" : "text-gray-600"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "upcoming" ? "bg-purple-500 text-white" : "text-gray-600"
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "all" ? "bg-purple-500 text-white" : "text-gray-600"
            }`}
          >
            All Plans
          </button>
        </div>

        {/* TODAY */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-lg border">
              <h3 className="font-bold mb-4">Today's Deliveries</h3>

              {todaysDeliveries.map((delivery, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl mb-3">
                  <p className="font-bold">{delivery.customer}</p>
                  <p className="text-sm">{delivery.dish}</p>

                  <div className="flex justify-between text-sm mt-2">
                    <span>{delivery.time}</span>
                    <span>{delivery.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPCOMING */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingSchedule.map((u, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-lg">
                <p className="font-bold">{u.date}</p>
                <p className="text-sm">{u.count} deliveries</p>

                {u.dishes.map((d: string, idx: number) => (
                  <p key={idx} className="text-sm">{d}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ALL */}
        {activeTab === "all" && (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl p-5 shadow-lg">

                <div className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold">{sub.customer}</p>
                    <p className="text-sm text-purple-600">{sub.plan}</p>
                  </div>
                  <span className="text-green-600 text-xs">Active</span>
                </div>

                <p>{sub.dish} x{sub.quantity}</p>

                <div className="flex gap-2 my-2">
                  {sub.days.map((d: string) => (
                    <span key={d} className="text-xs bg-purple-100 px-2 rounded">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between">
                  <span>{sub.startDate}</span>
                  <span className="font-bold text-purple-600">₹{sub.amount}</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}