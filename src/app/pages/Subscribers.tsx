import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, Users } from "lucide-react";

export default function Subscribers() {
  const navigate = useNavigate();

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/subscriptions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("SUBSCRIBERS =", res.data);
      setSubscribers(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";

      case "paused":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
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
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Subscribers
            </h1>

            <p className="text-white/80">
              Manage subscription customers
            </p>
          </div>

          <div className="bg-white/20 px-4 py-3 rounded-2xl">
            <p className="text-2xl font-bold text-white">
              {subscribers.length}
            </p>
            <p className="text-xs text-white">
              Total
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">

        {loading && (
          <div className="text-center py-10">
            Loading...
          </div>
        )}

        {!loading && subscribers.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center">
            <Users className="mx-auto mb-3" />

            <h3 className="font-bold">
              No Subscribers Yet
            </h3>

            <p className="text-gray-500 mt-2">
              Subscription customers will appear here
            </p>
          </div>
        )}

        <div className="space-y-4">

          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-3xl p-5 shadow-lg"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h3 className="font-bold text-lg">
                    {sub.customer}
                  </h3>

                  <p className="text-purple-600 font-medium">
                    {sub.plan}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    sub.status
                  )}`}
                >
                  {sub.status}
                </span>

              </div>

              <div className="mt-4 space-y-2">

                <div className="flex justify-between">
  <span className="text-gray-500">
    Plan Type
  </span>

  <span>
    {sub.plan_type === "normal" && "🥗 Normal Diet"}
    {sub.plan_type === "dietician" && "👨‍⚕️ Dietician Support"}
    {sub.plan_type === "gym" && "💪 Gym + Trainer"}
  </span>
</div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Quantity
                  </span>

                  <span>
                    {sub.quantity}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Delivery Time
                  </span>

                  <span>
                    {sub.time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Start Date
                  </span>

                  <span>
                    {sub.startDate}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Amount
                  </span>

                  <span className="font-bold text-purple-600">
                    ₹{sub.amount}
                  </span>
                </div>

              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {sub.days?.map((day: string) => (
                  <span
                    key={day}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs"
                  >
                    {day}
                  </span>
                ))}
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}