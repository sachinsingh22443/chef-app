import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  UserRound,
  Crown,
  PauseCircle,
  XCircle,
  CircleCheck,
  CalendarDays,
  Clock3,
  Utensils,
  IndianRupee,
  Sparkles,
  ChevronDown,
  Filter,
} from "lucide-react";

const BASE_URL = "https://chef-backend-qh12.onrender.com";

type Subscriber = {
  id: string | number;
  customer?: string;
  plan?: string;
  status?: string;
  plan_type?: string;
  quantity?: number | string;
  time?: string;
  startDate?: string;
  amount?: number | string;
  days?: string[];
};

export default function Subscribers() {
  const navigate = useNavigate();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const fetchSubscribers = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/subscriptions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("SUBSCRIBERS =", res.data);
      setSubscribers(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const getStatusConfig = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return {
          label: "Active",
          icon: CircleCheck,
          className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/15",
          dot: "bg-emerald-400",
        };
      case "paused":
        return {
          label: "Paused",
          icon: PauseCircle,
          className: "bg-amber-400/10 text-amber-300 border-amber-400/15",
          dot: "bg-amber-400",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className: "bg-red-400/10 text-red-300 border-red-400/15",
          dot: "bg-red-400",
        };
      default:
        return {
          label: status || "Unknown",
          icon: Clock3,
          className: "bg-zinc-400/10 text-zinc-400 border-white/10",
          dot: "bg-zinc-500",
        };
    }
  };

  const getPlanConfig = (planType?: string) => {
    switch (planType) {
      case "normal":
        return { emoji: "🥗", label: "Normal Diet" };
      case "dietician":
        return { emoji: "👨‍⚕️", label: "Dietician Support" };
      case "gym":
        return { emoji: "💪", label: "Gym + Trainer" };
      default:
        return { emoji: "🍽️", label: planType || "Custom Plan" };
    }
  };

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscribers.filter((sub) => {
      const matchesSearch =
        !query ||
        String(sub.customer || "").toLowerCase().includes(query) ||
        String(sub.plan || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        String(sub.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  const activeCount = subscribers.filter(
    (s) => String(s.status).toLowerCase() === "active"
  ).length;
  const pausedCount = subscribers.filter(
    (s) => String(s.status).toLowerCase() === "paused"
  ).length;
  const totalRevenue = subscribers.reduce(
    (sum, sub) => sum + Number(sub.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      {/* Ambient background */}
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
                  Subscription hub
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Subscribers
              </h1>
            </div>
          </div>

          <button
            onClick={() => fetchSubscribers(true)}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-300 transition hover:border-purple-400/25 hover:bg-purple-500/10 disabled:opacity-50 sm:px-4"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* Hero stats */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#17121c] via-[#111] to-[#0b0b0b] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-64 rounded-full bg-orange-400/5 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
                <Users className="h-5 w-5 text-purple-300" />
              </div>
              <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
                Your recurring customer base
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Keep an eye on active plans, delivery preferences and the
                customers who keep coming back to your kitchen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatCard
                label="Total"
                value={subscribers.length}
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                label="Active"
                value={activeCount}
                icon={<CircleCheck className="h-4 w-4" />}
              />
              <StatCard
                label="Paused"
                value={pausedCount}
                icon={<PauseCircle className="h-4 w-4" />}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>
        </section>

        {/* Revenue strip */}
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric
            icon={<IndianRupee className="h-4 w-4" />}
            label="Listed subscription value"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          />
          <Metric
            icon={<Crown className="h-4 w-4" />}
            label="Active retention"
            value={`${subscribers.length ? Math.round((activeCount / subscribers.length) * 100) : 0}%`}
          />
          <Metric
            icon={<Sparkles className="h-4 w-4" />}
            label="Customer programs"
            value={`${new Set(subscribers.map((s) => s.plan).filter(Boolean)).size}`}
          />
        </section>

        {/* Search + filters */}
        <section className="mt-5 rounded-[26px] border border-white/10 bg-[#101010] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer or subscription plan..."
                className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-400/30 focus:bg-white/[0.05]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <Filter className="h-4 w-4 shrink-0 text-zinc-600" />
              {["all", "active", "paused", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-semibold capitalize transition ${
                    statusFilter === status
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-950/30"
                      : "border border-white/8 bg-white/[0.025] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* List */}
        <section className="mt-5">
          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-[#101010] py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
                <Users className="h-6 w-6 animate-pulse text-purple-300" />
              </div>
              <p className="text-sm font-semibold text-white">
                Loading subscribers
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Fetching your subscription customers...
              </p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-[#101010] px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                <Users className="h-6 w-6 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {subscribers.length === 0
                  ? "No subscribers yet"
                  : "No matching subscribers"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                {subscribers.length === 0
                  ? "Subscription customers will appear here as soon as they join one of your plans."
                  : "Try a different customer name, plan or status filter."}
              </p>
              {subscribers.length > 0 && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscribers.map((sub) => {
                const status = getStatusConfig(sub.status);
                const StatusIcon = status.icon;
                const plan = getPlanConfig(sub.plan_type);
                const isExpanded = expandedId === sub.id;

                return (
                  <article
                    key={sub.id}
                    className="group overflow-hidden rounded-[26px] border border-white/10 bg-[#101010] transition hover:border-white/15"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : sub.id)
                      }
                      className="w-full p-4 text-left sm:p-5"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/10 bg-purple-500/[0.08] text-xl">
                          {plan.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold text-white sm:text-lg">
                                {sub.customer || "Guest Customer"}
                              </h3>
                              <p className="mt-0.5 truncate text-xs font-semibold text-purple-300">
                                {sub.plan || "Subscription Plan"}
                              </p>
                            </div>

                            <span
                              className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <MiniInfo
                              icon={<Crown />}
                              label="Program"
                              value={plan.label}
                            />
                            <MiniInfo
                              icon={<Utensils />}
                              label="Quantity"
                              value={String(sub.quantity ?? "—")}
                            />
                            <MiniInfo
                              icon={<Clock3 />}
                              label="Delivery"
                              value={sub.time || "—"}
                            />
                            <MiniInfo
                              icon={<IndianRupee />}
                              label="Amount"
                              value={`₹${Number(sub.amount || 0).toLocaleString("en-IN")}`}
                            />
                          </div>
                        </div>

                        <ChevronDown
                          className={`mt-2 hidden h-4 w-4 shrink-0 text-zinc-600 transition sm:block ${
                            isExpanded ? "rotate-180 text-purple-300" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-white/8 bg-black/15 px-4 pb-5 pt-4 sm:px-5">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <Detail
                            icon={<Crown />}
                            label="Plan type"
                            value={plan.label}
                          />
                          <Detail
                            icon={<Utensils />}
                            label="Quantity"
                            value={String(sub.quantity ?? "—")}
                          />
                          <Detail
                            icon={<Clock3 />}
                            label="Delivery time"
                            value={sub.time || "—"}
                          />
                          <Detail
                            icon={<CalendarDays />}
                            label="Start date"
                            value={sub.startDate || "—"}
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
                                  className="rounded-full border border-purple-400/10 bg-purple-500/[0.06] px-3 py-1.5 text-[11px] font-medium text-purple-200"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                              Subscription amount
                            </p>
                            <p className="mt-0.5 text-lg font-bold text-white">
                              ₹{Number(sub.amount || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <UserRound className="h-3.5 w-3.5" />
                            Subscriber #{sub.id}
                          </span>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-700">
          Chef workspace • Subscription customers
        </p>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/8 bg-white/[0.035] p-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-purple-300">{icon}</div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
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

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-600">
        <span className="[&_svg]:h-3 [&_svg]:w-3">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
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
      <div className="flex items-center gap-2 text-zinc-600">
        <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}
