import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Truck,
  ShoppingBag,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { Button } from "../../components/ui/button";

const API = "https://chef-backend-qh12.onrender.com";

const statusFlow = [
  { key: "pending", label: "New Order", icon: ShoppingBag },
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: PackageCheck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("pending");
  const [updating, setUpdating] = useState(false);

  const currentStatusIndex = Math.max(
    0,
    statusFlow.findIndex((s) => s.key === status)
  );

  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrder(res.data);
      setStatus(res.data?.status || "pending");
    } catch (err) {
      console.log("ORDER DETAIL ERROR:", err);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderId || updating) return;

    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/orders/${orderId}/status?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus(newStatus);
      await fetchOrder();
    } catch (err) {
      console.log("STATUS UPDATE ERROR:", err);
    } finally {
      setUpdating(false);
    }
  };

  const nextStatus =
    currentStatusIndex < statusFlow.length - 1
      ? statusFlow[currentStatusIndex + 1]
      : null;

  const getProgressWidth = () => {
    if (statusFlow.length <= 1) return "0%";
    return `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%`;
  };

  const formatDate = (value: any) => {
    if (!value) return "Just now";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-xl border border-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
            <ChefHat size={30} />
          </div>
          <h2 className="mt-5 text-xl font-black text-slate-900">
            Loading order...
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Fetching the latest order details.
          </p>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const customerName = order.customer_name || "Guest User";
  const phone = order.phone || "";
  const address = order.address || "No delivery address";
  const total = Number(order.total_price || 0);

  return (
    <div className="min-h-screen bg-[#f7f7fb] pb-32">
      {/* HERO */}
      <header className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 pb-8 pt-5 sm:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-7 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-300">
                <Sparkles size={15} />
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                  Chef command center
                </span>
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Order #{order.id}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Clock3 size={15} />
                {formatDate(order.created_at)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Current status
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {statusFlow.find((s) => s.key === status)?.label || status}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        {/* PROGRESS */}
        <section className="-mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                Live journey
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                Order Progress
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600">
              {currentStatusIndex + 1}/{statusFlow.length}
            </span>
          </div>

          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-100" />
            <div
              className="absolute left-0 top-5 h-1 rounded-full bg-gradient-to-r from-orange-500 to-violet-600 transition-all duration-500"
              style={{ width: getProgressWidth() }}
            />

            <div className="relative grid grid-cols-6 gap-1">
              {statusFlow.map((step, index) => {
                const Icon = step.icon;
                const completed = index <= currentStatusIndex;
                const current = index === currentStatusIndex;

                return (
                  <div key={step.key} className="flex min-w-0 flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-white shadow-sm transition ${
                        completed
                          ? "bg-gradient-to-br from-orange-500 to-violet-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      } ${current ? "ring-4 ring-orange-100" : ""}`}
                    >
                      <Icon size={17} />
                    </div>
                    <span
                      className={`mt-2 text-center text-[8px] font-black uppercase leading-3 sm:text-[10px] ${
                        current
                          ? "text-orange-600"
                          : completed
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          {/* CUSTOMER */}
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Phone size={21} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Customer
                </p>
                <h2 className="text-lg font-black text-slate-900">
                  {customerName}
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Phone
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {phone || "N/A"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-orange-500" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Delivery address
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  {address}
                </p>
              </div>

              {phone && (
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                  <a
                    href={`sms:${phone}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    <MessageCircle size={16} />
                    Message
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* ITEMS */}
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Kitchen ticket
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Order Items
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ShoppingBag size={20} />
              </div>
            </div>

            <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {items.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  No item details available.
                </div>
              ) : (
                items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <CircleDot size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-800">
                          {item.name || "Menu Item"}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          Qty {item.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-black text-slate-900">
                      ₹{Number(item.price || 0)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Order Total
              </span>
              <span className="text-2xl font-black text-white">₹{total}</span>
            </div>
          </section>
        </div>

        {/* KITCHEN NOTE */}
        <section className="mt-5 rounded-[28px] border border-orange-100 bg-gradient-to-r from-orange-50 to-violet-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
              <ChefHat size={19} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                Kitchen action
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Keep the order status updated so the customer and delivery
                workflow stay synchronized.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* STICKY ACTION */}
      {nextStatus && status !== "delivered" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <div className="hidden min-w-0 flex-1 sm:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Next step
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-900">
                Move order to {nextStatus.label}
              </p>
            </div>

            <Button
              onClick={() => handleStatusUpdate(nextStatus.key)}
              disabled={updating}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-violet-600 text-sm font-black text-white shadow-xl shadow-orange-500/20 hover:from-orange-600 hover:to-violet-700 sm:w-auto sm:min-w-[280px]"
            >
              {updating ? "Updating Order..." : `Mark as ${nextStatus.label} →`}
            </Button>
          </div>
        </div>
      )}

      {status === "delivered" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-100 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3.5 text-sm font-black text-emerald-700">
            <CheckCircle2 size={18} />
            Order Delivered Successfully
          </div>
        </div>
      )}
    </div>
  );
}
