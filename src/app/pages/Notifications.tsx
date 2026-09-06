import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Megaphone,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

type NotificationItem = {
  id: string | number;
  type?: string;
  title?: string;
  message?: string;
  time?: string;
  unread?: boolean;
  created_at?: string;
};

const API_BASE = "https://chef-backend-qh12.onrender.com";

const notificationTypes = [
  { value: "all", label: "All", icon: Bell },
  { value: "order", label: "Orders", icon: ShoppingCart },
  { value: "payment", label: "Payments", icon: CircleDollarSign },
  { value: "review", label: "Reviews", icon: Star },
  { value: "system", label: "System", icon: Megaphone },
];

function getNotificationIcon(type?: string) {
  switch (type) {
    case "order": return "🛒";
    case "payment": return "💰";
    case "review": return "⭐";
    case "system": return "📢";
    default: return "🔔";
  }
}

function getTypeMeta(type?: string) {
  switch (type) {
    case "order":
      return { label: "Order", className: "bg-blue-50 text-blue-700 border-blue-100", iconClass: "bg-blue-50 text-blue-600" };
    case "payment":
      return { label: "Payment", className: "bg-emerald-50 text-emerald-700 border-emerald-100", iconClass: "bg-emerald-50 text-emerald-600" };
    case "review":
      return { label: "Review", className: "bg-amber-50 text-amber-700 border-amber-100", iconClass: "bg-amber-50 text-amber-600" };
    case "system":
      return { label: "System", className: "bg-violet-50 text-violet-700 border-violet-100", iconClass: "bg-violet-50 text-violet-600" };
    default:
      return { label: "General", className: "bg-slate-50 text-slate-600 border-slate-200", iconClass: "bg-slate-100 text-slate-600" };
  }
}

function formatTime(notification: NotificationItem) {
  if (notification.time) return notification.time;
  if (!notification.created_at) return "";
  const d = new Date(notification.created_at);
  if (Number.isNaN(d.getTime())) return notification.created_at;
  return d.toLocaleString();
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [markingId, setMarkingId] = useState<string | number | null>(null);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found.");
        return;
      }
      const res = await axios.get(`${API_BASE}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Error fetching notifications", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      setMarkingId(id);
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifications(true);
    } catch (err) {
      console.log(err);
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(`${API_BASE}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifications(true);
    } catch (err) {
      console.log(err);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const counts = useMemo(() => ({
    order: notifications.filter((n) => n.type === "order").length,
    payment: notifications.filter((n) => n.type === "payment").length,
    review: notifications.filter((n) => n.type === "review").length,
    system: notifications.filter((n) => n.type === "system").length,
  }), [notifications]);

  const filteredNotifications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((notification) => {
      const matchesType = activeFilter === "all" || notification.type === activeFilter;
      const matchesUnread = !showOnlyUnread || notification.unread;
      const matchesSearch = !q || [notification.title, notification.message, notification.type]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
      return matchesType && matchesUnread && matchesSearch;
    });
  }, [notifications, activeFilter, search, showOnlyUnread]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <header className="relative overflow-hidden bg-[#10101a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.30),transparent_28%),radial-gradient(circle_at_88%_70%,rgba(139,92,246,0.28),transparent_32%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 backdrop-blur transition hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> Back
            </button>
            <button onClick={() => fetchNotifications(true)} disabled={refreshing} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
                <Sparkles className="h-4 w-4" /> Chef command center
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Notifications</h1>
                  <p className="mt-1 text-sm text-white/50">Stay on top of orders, payments and customer signals.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Inbox status</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${unreadCount ? "bg-orange-400" : "bg-emerald-400"}`} />
                <span className="text-sm font-black">{unreadCount ? `${unreadCount} unread` : "All caught up"}</span>
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <HeaderMetric value={notifications.length} label="Total" icon={<Bell className="h-4 w-4" />} />
            <HeaderMetric value={unreadCount} label="Unread" icon={<span className="text-sm">●</span>} />
            <HeaderMetric value={counts.order} label="Orders" icon={<ShoppingCart className="h-4 w-4" />} />
            <HeaderMetric value={counts.review} label="Reviews" icon={<Star className="h-4 w-4" />} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications..." className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"><X className="h-4 w-4" /></button>}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1">
              {notificationTypes.map((item) => {
                const Icon = item.icon;
                const count = item.value === "all" ? notifications.length : counts[item.value as keyof typeof counts];
                return (
                  <button key={item.value} onClick={() => setActiveFilter(item.value)} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${activeFilter === item.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-800"}`}>
                    <Icon className="h-3.5 w-3.5" /><span>{item.label}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] ${activeFilter === item.value ? "bg-white/10 text-white" : "bg-white text-slate-500"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
            <button onClick={() => setShowOnlyUnread((value) => !value)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${showOnlyUnread ? "bg-orange-50 text-orange-700" : "text-slate-500 hover:bg-slate-100"}`}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> {showOnlyUnread ? "Showing unread only" : "Show unread only"}
            </button>
            {unreadCount > 0 && <button onClick={markAllAsRead} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-orange-500"><CheckCheck className="h-3.5 w-3.5" /> Mark all as read</button>}
          </div>
        </section>

        {!loading && notifications.length > 0 && (
          <div className="mb-4 mt-6">
            <p className="text-sm font-black text-slate-800">{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}</p>
            <p className="mt-0.5 text-xs text-slate-400">Latest activity in your chef workspace</p>
          </div>
        )}

        {loading && <div className="space-y-3">{[1,2,3,4,5].map((item) => <NotificationSkeleton key={item} />)}</div>}

        {!loading && notifications.length === 0 && (
          <EmptyState title="No notifications yet" description="When something important happens in your chef workspace, it will appear here." icon="🔔" />
        )}

        {!loading && notifications.length > 0 && filteredNotifications.length === 0 && (
          <EmptyState title="Nothing matches" description="Try another category or clear your search and unread filter." icon="🔎"
            action={<button onClick={() => { setSearch(""); setActiveFilter("all"); setShowOnlyUnread(false); }} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Clear filters</button>}
          />
        )}

        {!loading && filteredNotifications.length > 0 && (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const meta = getTypeMeta(notification.type);
              const unread = Boolean(notification.unread);
              const busy = markingId === notification.id;
              return (
                <article key={notification.id} onClick={() => unread && !busy && markAsRead(notification.id)}
                  className={`group relative overflow-hidden rounded-[1.45rem] border bg-white p-4 shadow-sm transition duration-200 sm:p-5 ${unread ? "cursor-pointer border-orange-200 shadow-orange-900/[0.04] hover:border-orange-300 hover:shadow-md" : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"}`}>
                  {unread && <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-orange-400 to-violet-500" />}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${meta.iconClass}`}>{getNotificationIcon(notification.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className={`text-sm sm:text-base ${unread ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>{notification.title || "Notification"}</h2>
                            <span className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${meta.className}`}>{meta.label}</span>
                            {unread && <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-orange-600"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> New</span>}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-slate-400">{formatTime(notification)}</span>
                      </div>
                      <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">{notification.message}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        {unread ? <span className="text-[10px] font-bold text-slate-400">Tap to mark as read</span> : <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600"><Check className="h-3.5 w-3.5" /> Read</span>}
                        {unread && <ChevronRight className={`h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-orange-400 ${busy ? "animate-pulse" : ""}`} />}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><SlidersHorizontal className="h-5 w-5 text-slate-600" /></div>
              <div>
                <h2 className="font-black text-slate-900">Notification Preferences</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">Control which notification categories you want to keep visible.</p>
              </div>
            </div>
          </div>
          <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {[
              { icon: "🛒", label: "Order Notifications" },
              { icon: "💰", label: "Payment Alerts" },
              { icon: "⭐", label: "Review Notifications" },
              { icon: "📢", label: "System Updates" },
            ].map((item) => <PreferenceRow key={item.label} item={item} />)}
          </div>
        </section>
      </main>
    </div>
  );
}

function HeaderMetric({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3.5 backdrop-blur"><div className="flex items-center gap-2 text-white/40">{icon}<span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span></div><p className="mt-2 text-xl font-black">{value}</p></div>;
}

function PreferenceRow({ item }: { item: { icon: string; label: string } }) {
  const [enabled, setEnabled] = useState(true);
  return <div className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50">
    <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl">{item.icon}</span><div><p className="text-xs font-bold text-slate-700">{item.label}</p><p className="mt-0.5 text-[10px] text-slate-400">{enabled ? "Enabled" : "Muted"}</p></div></div>
    <button type="button" aria-label={`Toggle ${item.label}`} aria-pressed={enabled} onClick={() => setEnabled((value) => !value)} className={`relative h-6 w-11 shrink-0 rounded-full p-1 transition ${enabled ? "bg-slate-900" : "bg-slate-200"}`}><span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : "translate-x-0"}`} /></button>
  </div>;
}

function EmptyState({ title, description, icon, action }: { title: string; description: string; icon: string; action?: React.ReactNode }) {
  return <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">{icon}</div><h2 className="mt-5 text-lg font-black text-slate-900">{title}</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function NotificationSkeleton() {
  return <div className="animate-pulse rounded-[1.45rem] border border-slate-200 bg-white p-5"><div className="flex gap-4"><div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-100" /><div className="flex-1 space-y-3"><div className="flex justify-between gap-4"><div className="h-4 w-48 rounded bg-slate-100" /><div className="h-3 w-20 rounded bg-slate-100" /></div><div className="h-3 w-full max-w-2xl rounded bg-slate-100" /><div className="h-3 w-32 rounded bg-slate-100" /></div></div></div>;
}
