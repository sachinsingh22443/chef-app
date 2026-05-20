import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { ArrowLeft, Clock, MapPin, Phone, MessageCircle, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("pending");

  // 🔥 STATUS FLOW (same UI)
  const statusFlow = [
    { key: "pending", label: "New", color: "blue" },
    { key: "accepted", label: "Accepted", color: "green" },
    { key: "preparing", label: "Preparing", color: "orange" },
    { key: "ready", label: "Ready", color: "purple" },
    { key: "out_for_delivery", label: "Out for Delivery", color: "indigo" },
    { key: "delivered", label: "Delivered", color: "green" },
  ];

  const currentStatusIndex = statusFlow.findIndex((s) => s.key === status);

  // 🔥 FETCH ORDER
  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
  try {
    const token = localStorage.getItem("token"); // 🔥

    const res = await axios.get(
      `https://chef-backend-qh12.onrender.com/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setOrder(res.data);
    setStatus(res.data.status);
  } catch (err) {
    console.log(err);
  }
};

  // 🔥 UPDATE STATUS
  const handleStatusUpdate = async (newStatus: string) => {
  try {
    const token = localStorage.getItem("token"); // 🔥

    await axios.put(
      `https://chef-backend-qh12.onrender.com/orders/${orderId}/status?status=${newStatus}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStatus(newStatus);
    fetchOrder();
  } catch (err) {
    console.log(err);
  }
};

  const getNextStatus = () => {
    if (currentStatusIndex < statusFlow.length - 1) {
      return statusFlow[currentStatusIndex + 1];
    }
    return null;
  };

  const nextStatus = getNextStatus();

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-b-[40px] p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Order #{order.id}
            </h1>
            <p className="text-white/80 text-sm">
            {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white font-medium capitalize">
              {statusFlow.find((s) => s.key === status)?.label}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Status Timeline */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Order Progress</h3>
          <div className="space-y-3">
            {statusFlow.map((s, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div key={s.key} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p
                      className={`font-medium ${
                        isCurrent
                          ? "text-orange-600"
                          : isCompleted
                          ? "text-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
  <h3 className="font-bold text-gray-800 mb-4">Customer Details</h3>

  <div className="space-y-3">

    {/* 👤 Name */}
    <p className="font-medium text-gray-800">
      {order.customer_name || "Guest User"}
    </p>

    {/* 📞 Phone */}
    <p className="text-sm text-gray-500 flex items-center gap-2">
      <span>📞</span>
      {order.phone || "N/A"}
    </p>

    {/* 📍 Address */}
    <p className="text-sm text-gray-500 flex items-center gap-2">
      <span>📍</span>
      {order.address || "N/A"}
    </p>

  </div>
</div>

        {/* Order Items */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Order Items</h3>

          <div className="space-y-3 mb-4">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p>₹{item.price}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{order.total_price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6">
        {nextStatus && status !== "delivered" && (
          <Button
            onClick={() => handleStatusUpdate(nextStatus.key)}
            className="w-full py-4"
          >
            Mark as {nextStatus.label}
          </Button>
        )}
      </div>
    </div>
  );
}