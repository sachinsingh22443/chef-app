import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  Search,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  ChefHat,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
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

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/orders/chef-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orders = res.data?.orders || [];

      const newArr: any[] = [];
      const activeArr: any[] = [];
      const completedArr: any[] = [];

      orders.forEach((o: any) => {
        const items = o.items?.length
          ? o.items
              .map((i: any) => `${i.name} x${i.quantity}`)
              .join(", ")
          : "";

        const formatted = {
          id: o.id,
          customer: o.customer_name || "Guest",
          items,
          time: o.created_at
            ? new Date(o.created_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just now",
          amount: o.total_price || 0,
          status: o.status,
          prepTime: o.status === "ready" ? "Ready" : "15 min",
          address: o.address || "N/A",
          phone: o.phone || "N/A",
          isTomorrowSpecial:
            o.is_tomorrow_special === true ||
            o.items?.some(
              (item: any) =>
                item.special_id || item.is_tomorrow_special === true
            ),
        };

        if (o.status === "pending") {
          newArr.push(formatted);
        } else if (
          ["accepted", "preparing", "ready", "out_for_delivery"].includes(
            o.status
          )
        ) {
          activeArr.push(formatted);
        } else if (o.status === "delivered") {
          completedArr.push(formatted);
        }
      });

      setNewOrders(newArr);
      setActiveOrders(activeArr);
      setCompletedOrders(completedArr);
    } catch (err) {
      console.log("ORDER ERROR:", err);
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================
  const updateStatus = async (id: string, status: string) => {
    if (loadingId === id) return;

    try {
      setLoadingId(id);
      const token = localStorage.getItem("token");

      await axios.put(
        `https://chef-backend-qh12.onrender.com/orders/${id}/status?status=${status}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchOrders();
    } catch (err) {
      console.log("STATUS ERROR:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filterOrders = (orders: any[]) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter(
      (order) =>
        (order.customer || "").toLowerCase().includes(query) ||
        (order.items || "").toLowerCase().includes(query)
    );
  };

  // =========================
  // STATUS LABEL
  // =========================
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "New Order";
      case "accepted":
        return "Order Accepted";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "out_for_delivery":
        return "Out For Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  // =========================
  // SUBSCRIPTIONS
  // =========================
  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/subscriptions/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const renderEmpty = (icon: string, title: string, text: string) => (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );

  const statusMeta = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "New Order", icon: ShoppingBag, cls: "bg-amber-50 text-amber-700 border-amber-100" };
      case "accepted":
        return { label: "Accepted", icon: CheckCircle2, cls: "bg-blue-50 text-blue-700 border-blue-100" };
      case "preparing":
        return { label: "Preparing", icon: ChefHat, cls: "bg-violet-50 text-violet-700 border-violet-100" };
      case "ready":
        return { label: "Ready", icon: PackageCheck, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "out_for_delivery":
        return { label: "Out for Delivery", icon: Truck, cls: "bg-orange-50 text-orange-700 border-orange-100" };
      case "delivered":
        return { label: "Delivered", icon: CheckCircle2, cls: "bg-slate-100 text-slate-700 border-slate-200" };
      default:
        return { label: getStatusLabel(status), icon: Clock3, cls: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const OrderCard = ({ order, type }: { order: any; type: "new" | "active" | "completed" }) => {
    const meta = statusMeta(order.status);
    const StatusIcon = meta.icon;

    return (
      <article
        onClick={() => navigate(`/orders/${order.id}`)}
        className={`group cursor-pointer overflow-hidden rounded-[28px] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
          type === "new" ? "border-amber-200" : "border-slate-200"
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 text-white shadow-lg shadow-orange-500/15">
                <ChefHat size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-black text-slate-900">{order.customer}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <Clock3 size={12} />
                  {order.time}
                </p>
              </div>
            </div>

            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${meta.cls}`}>
              <StatusIcon size={13} />
              {meta.label}
            </span>
          </div>

          {order.isTomorrowSpecial && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-50 to-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-violet-700">
              <Sparkles size={13} />
              Tomorrow Special
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order items</p>
            <p className="mt-1.5 text-sm font-bold leading-6 text-slate-800">{order.items || "No item details"}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-slate-100 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <MapPin size={14} />
                Delivery address
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-700">{order.address}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-left sm:min-w-[120px] sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
              <p className="mt-1 text-xl font-black text-white">₹{order.amount}</p>
            </div>
          </div>

          {type === "active" && (
            <>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kitchen progress</p>
                  <p className="text-[10px] font-bold text-slate-500">
                    {order.status === "accepted" ? "1 / 5" :
                     order.status === "preparing" ? "2 / 5" :
                     order.status === "ready" ? "3 / 5" :
                     order.status === "out_for_delivery" ? "4 / 5" : "5 / 5"}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map((step) => {
                    const current =
                      order.status === "accepted" ? 1 :
                      order.status === "preparing" ? 2 :
                      order.status === "ready" ? 3 :
                      order.status === "out_for_delivery" ? 4 : 5;
                    return <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= current ? "bg-gradient-to-r from-orange-500 to-violet-600" : "bg-slate-200"}`} />;
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Phone size={15} />
                  {order.phone}
                </div>
                <a
                  href={`tel:${order.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-emerald-700"
                >
                  Call
                </a>
              </div>
            </>
          )}

          {type === "new" && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(order.id, "cancelled");
                }}
                disabled={loadingId === order.id}
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(order.id, "accepted");
                }}
                disabled={loadingId === order.id}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {loadingId === order.id ? "Updating..." : "Accept"}
              </button>
            </div>
          )}

          {type === "active" && (
            <div className="mt-5">
              {order.status === "accepted" && (
                <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "preparing"); }} disabled={loadingId === order.id}
                  className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-600/15 transition hover:bg-violet-700 disabled:opacity-60">
                  {loadingId === order.id ? "Updating..." : "Start Preparing →"}
                </button>
              )}
              {order.status === "preparing" && (
                <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "ready"); }} disabled={loadingId === order.id}
                  className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:opacity-60">
                  {loadingId === order.id ? "Updating..." : "Mark Ready →"}
                </button>
              )}
              {order.status === "ready" && (
                <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "out_for_delivery"); }} disabled={loadingId === order.id}
                  className="w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600 disabled:opacity-60">
                  {loadingId === order.id ? "Updating..." : "Assign Delivery Partner →"}
                </button>
              )}
              {order.status === "out_for_delivery" && (
                <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "delivered"); }} disabled={loadingId === order.id}
                  className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60">
                  {loadingId === order.id ? "Updating..." : "Mark Delivered ✓"}
                </button>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] pb-24">
      {/* HERO */}
      <header className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-300">Chef command center</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Orders</h1>
              <p className="mt-2 text-sm text-slate-300">Manage your kitchen, one order at a time.</p>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live orders</p>
              <p className="mt-1 text-2xl font-black">{newOrders.length + activeOrders.length}</p>
            </div>
          </div>

          <div className="relative mt-7">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <Input
              type="text"
              placeholder="Search by customer or dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-2xl border border-white/10 bg-white pl-12 pr-4 text-slate-900 shadow-2xl placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-orange-400"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* MINI STATS */}
        <div className="-mt-5 relative z-10 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">New</p>
            <p className="mt-1 text-2xl font-black text-amber-600">{newOrders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Kitchen</p>
            <p className="mt-1 text-2xl font-black text-violet-600">{activeOrders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Done</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{completedOrders.length}</p>
          </div>
        </div>

        <div className="mt-7">
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <TabsTrigger value="new" className="rounded-xl py-3 text-xs font-black data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                New <span className="ml-1 opacity-60">({newOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-xl py-3 text-xs font-black data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Active <span className="ml-1 opacity-60">({activeOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-xl py-3 text-xs font-black data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Done <span className="ml-1 opacity-60">({completedOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="rounded-xl py-3 text-xs font-black data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Plans <span className="ml-1 opacity-60">({subscriptionOrders.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6 space-y-4">
              {filterOrders(newOrders).length ? filterOrders(newOrders).map((order) => <OrderCard key={order.id} order={order} type="new" />) :
                renderEmpty("🛎️", "No new orders", searchQuery ? "No new order matches your search." : "You're all caught up. New orders will appear here.")}
            </TabsContent>

            <TabsContent value="active" className="mt-6 space-y-4">
              {filterOrders(activeOrders).length ? filterOrders(activeOrders).map((order) => <OrderCard key={order.id} order={order} type="active" />) :
                renderEmpty("👨‍🍳", "Kitchen is clear", searchQuery ? "No active order matches your search." : "There are no active orders right now.")}
            </TabsContent>

            <TabsContent value="completed" className="mt-6 space-y-4">
              {filterOrders(completedOrders).length ? filterOrders(completedOrders).map((order) => <OrderCard key={order.id} order={order} type="completed" />) :
                renderEmpty("🏆", "No completed orders", "Delivered orders will appear here as your kitchen keeps growing.")}
            </TabsContent>

            <TabsContent value="subscription" className="mt-6 space-y-4">
              {subscriptionOrders.length === 0 ? (
                renderEmpty("📅", "No subscription orders", "Your recurring meal orders will appear here.")
              ) : (
                subscriptionOrders.map((order) => (
                  <article key={order.id} onClick={() => navigate("/app/subscriptions")}
                    className="group cursor-pointer rounded-[28px] border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                          <ShoppingBag size={21} />
                        </div>
                        <div>
                          <h3 className="font-black">{order.customer}</h3>
                          <p className="mt-1 text-xs text-slate-500">{order.plan || "Subscription"} · {order.nextDelivery || "Next delivery"}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-orange-600">₹{order.amount}</p>
                    </div>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meal</p>
                      <p className="mt-1 font-bold text-slate-800">{order.items}</p>
                    </div>
                  </article>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
