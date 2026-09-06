import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  RefreshCw,
  Truck,
  Utensils,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Users,
  IndianRupee,
  CircleCheck,
  Layers3,
  ChefHat,
  Search,
  Filter,
} from "lucide-react";

const BASE_URL = "https://chef-backend-qh12.onrender.com";

type Subscription = {
  id: string | number;
  customer?: string;
  plan?: string;
  dish?: string;
  quantity?: string | number;
  days?: string[];
  startDate?: string;
  amount?: string | number;
  status?: string;
  plan_type?: string;
};

type TodayDelivery = {
  id?: string | number;
  customer?: string;
  dish?: string;
  time?: string;
  address?: string;
  quantity?: string | number;
  status?: string;
};

type UpcomingItem = {
  date?: string;
  count?: string | number;
  dishes?: string[];
};

export default function SubscriptionOrders() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("daily");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [todaysDeliveries, setTodaysDeliveries] = useState<TodayDelivery[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [subRes, todayRes, upcomingRes] = await Promise.all([
        axios.get(`${BASE_URL}/subscriptions/`, { headers }),
        axios.get(`${BASE_URL}/subscriptions/today`, { headers }),
        axios.get(`${BASE_URL}/subscriptions/upcoming`, { headers }),
      ]);

      setSubscriptions(subRes.data || []);
      setTodaysDeliveries(todayRes.data || []);
      setUpcomingSchedule(upcomingRes.data || []);
    } catch (err) {
      console.log("ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return subscriptions;

    return subscriptions.filter(
      (sub) =>
        String(sub.customer || "").toLowerCase().includes(q) ||
        String(sub.plan || "").toLowerCase().includes(q) ||
        String(sub.dish || "").toLowerCase().includes(q)
    );
  }, [subscriptions, search]);

  const activeCount = subscriptions.filter(
    (sub) => String(sub.status || "active").toLowerCase() === "active"
  ).length;

  const todayCount = todaysDeliveries.length;

  const totalValue = subscriptions.reduce(
    (sum, sub) => sum + Number(sub.amount || 0),
    0
  );

  const getPlan = (type?: string) => {
    if (type === "dietician") return { emoji: "👨‍⚕️", name: "Dietician Support" };
    if (type === "gym") return { emoji: "💪", name: "Gym + Trainer" };
    if (type === "normal") return { emoji: "🥗", name: "Normal Diet" };
    return { emoji: "🍽️", name: "Custom Plan" };
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-orange-500/5 blur-[130px]" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-purple-400/30 hover:bg-purple-500/10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-300" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.9)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-purple-300">
                  Recurring kitchen
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Subscription Orders
              </h1>
            </div>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-300 transition hover:border-purple-400/25 hover:bg-purple-500/10 disabled:opacity-50 sm:px-4"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#17121c] via-[#111] to-[#0b0b0b] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-64 rounded-full bg-orange-400/5 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
                <Layers3 className="h-5 w-5 text-purple-300" />
              </div>
              <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                Your recurring delivery command center
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Plan today's subscription deliveries, preview what's coming
                next and keep every recurring customer on schedule.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <HeroStat
                icon={<Users className="h-4 w-4" />}
                label="Plans"
                value={subscriptions.length}
              />
              <HeroStat
                icon={<Truck className="h-4 w-4" />}
                label="Today"
                value={todayCount}
              />
              <HeroStat
                icon={<CircleCheck className="h-4 w-4" />}
                label="Active"
                value={activeCount}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric
            icon={<Truck className="h-4 w-4" />}
            label="Today's deliveries"
            value={`${todayCount} orders`}
          />
          <Metric
            icon={<IndianRupee className="h-4 w-4" />}
            label="Subscription value"
            value={`₹${totalValue.toLocaleString("en-IN")}`}
          />
          <Metric
            icon={<CalendarDays className="h-4 w-4" />}
            label="Upcoming schedule"
            value={`${upcomingSchedule.length} days`}
          />
        </section>

        {/* Tabs */}
        <section className="mt-5 rounded-[26px] border border-white/10 bg-[#101010] p-2">
          <div className="grid grid-cols-3 gap-1">
            <TabButton
              active={activeTab === "daily"}
              onClick={() => setActiveTab("daily")}
              icon={<Truck className="h-4 w-4" />}
              label="Today"
              count={todaysDeliveries.length}
            />
            <TabButton
              active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
              icon={<Calendar className="h-4 w-4" />}
              label="Upcoming"
              count={upcomingSchedule.length}
            />
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              icon={<Users className="h-4 w-4" />}
              label="All Plans"
              count={subscriptions.length}
            />
          </div>
        </section>

        {/* Content */}
        <section className="mt-5">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {activeTab === "daily" && (
                <div>
                  <SectionTitle
                    icon={<Truck className="h-4 w-4" />}
                    title="Today's delivery run"
                    subtitle={`${todaysDeliveries.length} recurring deliveries scheduled`}
                  />

                  {todaysDeliveries.length === 0 ? (
                    <EmptyState
                      icon={<Truck className="h-6 w-6" />}
                      title="No deliveries today"
                      description="Your subscription delivery queue is clear for today."
                    />
                  ) : (
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {todaysDeliveries.map((delivery, i) => (
                        <article
                          key={delivery.id ?? i}
                          className="group rounded-[26px] border border-white/10 bg-[#101010] p-4 transition hover:border-purple-400/20 sm:p-5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/[0.08] text-lg">
                              🍱
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate text-base font-bold text-white">
                                    {delivery.customer || "Guest Customer"}
                                  </h3>
                                  <p className="mt-0.5 truncate text-xs font-semibold text-purple-300">
                                    {delivery.dish || "Subscription meal"}
                                  </p>
                                </div>

                                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-400/15 bg-orange-400/10 px-2.5 py-1.5 text-[10px] font-bold text-orange-300">
                                  <Clock className="h-3 w-3" />
                                  {delivery.time || "—"}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                <InfoRow
                                  icon={<MapPinIcon />}
                                  label="Address"
                                  value={delivery.address || "—"}
                                />
                                <InfoRow
                                  icon={<Utensils className="h-3.5 w-3.5" />}
                                  label="Quantity"
                                  value={String(delivery.quantity ?? "—")}
                                />
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "upcoming" && (
                <div>
                  <SectionTitle
                    icon={<CalendarDays className="h-4 w-4" />}
                    title="Upcoming schedule"
                    subtitle="A quick view of the next recurring delivery days"
                  />

                  {upcomingSchedule.length === 0 ? (
                    <EmptyState
                      icon={<CalendarDays className="h-6 w-6" />}
                      title="No upcoming schedule"
                      description="Upcoming subscription deliveries will appear here."
                    />
                  ) : (
                    <div className="mt-4 space-y-3">
                      {upcomingSchedule.map((item, i) => (
                        <article
                          key={`${item.date}-${i}`}
                          className="rounded-[26px] border border-white/10 bg-[#101010] p-4 sm:p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex items-center gap-3 sm:w-48">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/[0.08]">
                                <Calendar className="h-5 w-5 text-purple-300" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">
                                  {item.date || "—"}
                                </p>
                                <p className="mt-0.5 text-[11px] text-zinc-600">
                                  {item.count ?? 0} deliveries
                                </p>
                              </div>
                            </div>

                            <div className="flex-1">
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                                Planned dishes
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(item.dishes || []).length > 0 ? (
                                  item.dishes?.map((dish, idx) => (
                                    <span
                                      key={`${dish}-${idx}`}
                                      className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-300"
                                    >
                                      {dish}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-zinc-600">
                                    No dishes listed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "all" && (
                <div>
                  <SectionTitle
                    icon={<Users className="h-4 w-4" />}
                    title="All subscription plans"
                    subtitle="Every recurring customer currently connected to your kitchen"
                  />

                  <div className="mt-4 rounded-[26px] border border-white/10 bg-[#101010] p-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search customer, plan or dish..."
                        className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-purple-400/30"
                      />
                    </div>
                  </div>

                  {filteredSubscriptions.length === 0 ? (
                    <EmptyState
                      icon={<Users className="h-6 w-6" />}
                      title={
                        subscriptions.length
                          ? "No matching plans"
                          : "No subscription plans"
                      }
                      description={
                        subscriptions.length
                          ? "Try another customer, plan or dish name."
                          : "Recurring customers will appear here once they subscribe."
                      }
                    />
                  ) : (
                    <div className="mt-4 space-y-3">
                      {filteredSubscriptions.map((sub) => {
                        const plan = getPlan(sub.plan_type);
                        const isExpanded = expandedId === sub.id;

                        return (
                          <article
                            key={sub.id}
                            className="overflow-hidden rounded-[26px] border border-white/10 bg-[#101010] transition hover:border-white/15"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : sub.id)
                              }
                              className="w-full p-4 text-left sm:p-5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/10 bg-purple-500/[0.08] text-xl">
                                  {plan.emoji}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="truncate text-base font-bold text-white">
                                        {sub.customer || "Guest Customer"}
                                      </p>
                                      <p className="mt-0.5 truncate text-xs font-semibold text-purple-300">
                                        {sub.plan || "Subscription Plan"}
                                      </p>
                                    </div>
                                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                      {sub.status || "Active"}
                                    </span>
                                  </div>

                                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    <Mini
                                      label="Dish"
                                      value={sub.dish || "—"}
                                    />
                                    <Mini
                                      label="Quantity"
                                      value={String(sub.quantity ?? "—")}
                                    />
                                    <Mini
                                      label="Start"
                                      value={sub.startDate || "—"}
                                    />
                                    <Mini
                                      label="Amount"
                                      value={`₹${Number(sub.amount || 0).toLocaleString("en-IN")}`}
                                    />
                                  </div>
                                </div>

                                <ChevronRight
                                  className={`mt-2 hidden h-4 w-4 shrink-0 text-zinc-600 transition sm:block ${
                                    isExpanded ? "rotate-90 text-purple-300" : ""
                                  }`}
                                />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="border-t border-white/8 bg-black/15 px-4 pb-5 pt-4 sm:px-5">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                  <Detail
                                    icon={<ChefHat />}
                                    label="Plan type"
                                    value={plan.name}
                                  />
                                  <Detail
                                    icon={<Utensils />}
                                    label="Dish"
                                    value={sub.dish || "—"}
                                  />
                                  <Detail
                                    icon={<Calendar />}
                                    label="Start date"
                                    value={sub.startDate || "—"}
                                  />
                                  <Detail
                                    icon={<IndianRupee />}
                                    label="Amount"
                                    value={`₹${Number(sub.amount || 0).toLocaleString("en-IN")}`}
                                  />
                                </div>

                                {sub.days && sub.days.length > 0 && (
                                  <div className="mt-4">
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                                      Delivery days
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {sub.days.map((day) => (
                                        <span
                                          key={day}
                                          className="rounded-full border border-purple-400/10 bg-purple-500/[0.06] px-3 py-1.5 text-[11px] text-purple-200"
                                        >
                                          {day}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-700">
          <Sparkles className="h-3 w-3" />
          Chef workspace • Subscription orders
        </div>
      </main>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/8 bg-white/[0.035] p-4 ${className}`}
    >
      <div className="text-purple-300">{icon}</div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#101010] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-xs font-bold transition sm:gap-2 ${
        active
          ? "bg-purple-500 text-white shadow-lg shadow-purple-950/30"
          : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] ${
          active ? "bg-white/15 text-white" : "bg-white/5 text-zinc-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/6 bg-white/[0.025] p-3">
      <div className="flex items-center gap-1.5 text-zinc-600">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1 truncate text-[11px] font-medium text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-semibold text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-zinc-600 [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-4 rounded-[28px] border border-white/10 bg-[#101010] px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#101010] py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
        <RefreshCw className="h-6 w-6 animate-spin text-purple-300" />
      </div>
      <p className="text-sm font-semibold text-white">Loading subscriptions</p>
      <p className="mt-1 text-xs text-zinc-600">
        Fetching today's and upcoming delivery data...
      </p>
    </div>
  );
}

function MapPinIcon() {
  return (
    <span className="text-zinc-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-3.5 w-3.5"
      >
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    </span>
  );
}
