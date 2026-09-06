import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Edit3,
  Flame,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Utensils,
  Users,
  X,
  Zap,
} from "lucide-react";

type SubscriptionPlan = {
  id: string | number;
  title?: string;
  tagline?: string;
  description?: string;
  price?: number | string;
  breakfast_price?: number | string | null;
  plan_type?: string;
  goal?: string;
  diet_type?: string;
  calories_per_day?: number | string | null;
  meal_type?: string[] | string | null;
  features?: string[] | string | null;
  includes?: string[] | string | null;
  emoji?: string;
  color?: string;
};

const API_BASE = "https://chef-backend-qh12.onrender.com";

const planMeta: Record<
  string,
  { label: string; icon: string; className: string }
> = {
  normal: {
    label: "Normal",
    icon: "🥗",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  dietician: {
    label: "Dietician",
    icon: "🩺",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
  gym: {
    label: "Gym + Trainer",
    icon: "💪",
    className: "bg-orange-50 text-orange-700 border-orange-100",
  },
};

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function money(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function getPlanMeta(type?: string) {
  return planMeta[type || "normal"] || {
    label: type || "Plan",
    icon: "✨",
    className: "bg-slate-50 text-slate-700 border-slate-100",
  };
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Authentication token not found.");
        return;
      }

      const res = await axios.get(
        `${API_BASE}/subscriptions/chef/plans`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string | number) => {
    if (!id) {
      console.error("Plan ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription plan?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Authentication token not found.");
        return;
      }

      await axios.delete(
        `${API_BASE}/subscriptions/chef/plans/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchPlans();
    } catch (err) {
      console.error("Failed to delete subscription plan:", err);
      alert("Unable to delete this subscription plan. Please try again.");
    } finally {
      setDeletingId(null);
      setOpenMenu(null);
    }
  };

  const handleOpenMenuCycle = (planId: string | number) => {
    if (!planId) {
      console.error("Subscription plan ID is missing.");
      return;
    }
    navigate(`/app/subscription-plans/menu-cycle/${planId}`);
  };

  const handleEditPlan = (planId: string | number) => {
    if (!planId) {
      console.error("Subscription plan ID is missing.");
      return;
    }
    navigate(`/app/subscription-plans/edit/${planId}`);
  };

  const handleCreatePlan = () => {
    navigate("/app/subscription-plans/create");
  };

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        !q ||
        [
          plan.title,
          plan.tagline,
          plan.description,
          plan.goal,
          plan.diet_type,
          plan.plan_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesFilter =
        activeFilter === "all" || plan.plan_type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [plans, query, activeFilter]);

  const counts = useMemo(
    () => ({
      total: plans.length,
      normal: plans.filter((p) => p.plan_type === "normal").length,
      dietician: plans.filter((p) => p.plan_type === "dietician").length,
      gym: plans.filter((p) => p.plan_type === "gym").length,
    }),
    [plans]
  );

  const averagePrice = useMemo(() => {
    if (!plans.length) return 0;
    const total = plans.reduce((sum, plan) => sum + Number(plan.price || 0), 0);
    return Math.round(total / plans.length);
  }, [plans]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute right-0 top-48 h-96 w-96 rounded-full bg-orange-100/40 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative overflow-hidden bg-[#10101a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(139,92,246,0.30),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(249,115,22,0.18),transparent_28%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              Back
            </button>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              Chef subscription studio
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                <Sparkles className="h-4 w-4" />
                Revenue workspace
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Subscription Plans
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                Build, refine and map your 30-day meal experiences from one
                clean command center.
              </p>
            </div>

            <button
              onClick={handleCreatePlan}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              <Plus className="h-4 w-4" />
              Create new plan
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Header stats */}
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <HeaderStat
              label="Total plans"
              value={counts.total}
              icon={<Grid3X3 className="h-4 w-4" />}
            />
            <HeaderStat
              label="Normal"
              value={counts.normal}
              icon={<Utensils className="h-4 w-4" />}
            />
            <HeaderStat
              label="Specialized"
              value={counts.dietician + counts.gym}
              icon={<Zap className="h-4 w-4" />}
            />
            <HeaderStat
              label="Avg. price"
              value={`₹${averagePrice}`}
              icon={<Flame className="h-4 w-4" />}
            />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        {/* Controls */}
        <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plans, goals, diet type..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {[
                ["all", "All", counts.total],
                ["normal", "Normal", counts.normal],
                ["dietician", "Dietician", counts.dietician],
                ["gym", "Gym", counts.gym],
              ].map(([value, label, count]) => (
                <button
                  key={String(value)}
                  onClick={() => setActiveFilter(String(value))}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    activeFilter === value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      activeFilter === value
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="hidden h-8 w-px bg-slate-200 lg:block" />

            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1">
              <ViewButton
                active={view === "grid"}
                onClick={() => setView("grid")}
                icon={<Grid3X3 className="h-4 w-4" />}
                label="Grid"
              />
              <ViewButton
                active={view === "list"}
                onClick={() => setView("list")}
                icon={<List className="h-4 w-4" />}
                label="List"
              />
            </div>
          </div>
        </section>

        {/* Result heading */}
        {!loading && plans.length > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {filteredPlans.length} plan
                {filteredPlans.length !== 1 ? "s" : ""} visible
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {query || activeFilter !== "all"
                  ? "Filtered from your subscription catalogue"
                  : "Your complete subscription catalogue"}
              </p>
            </div>

            <button
              onClick={fetchPlans}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            className={
              view === "grid"
                ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-3"
            }
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <PlanSkeleton key={item} list={view === "list"} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && plans.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-4xl">
              🥗
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-900">
              No plans yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create your first 30-day subscription and turn your menu into a
              recurring customer experience.
            </p>
            <button
              onClick={handleCreatePlan}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
            >
              <Plus className="h-4 w-4" />
              Create first plan
            </button>
          </div>
        )}

        {/* Filter empty */}
        {!loading && plans.length > 0 && filteredPlans.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-900">
              Nothing matches
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try another search or clear the active filter.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActiveFilter("all");
              }}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && filteredPlans.length > 0 && view === "grid" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                deleting={deletingId === plan.id}
                menuOpen={openMenu === plan.id}
                onMenu={() =>
                  setOpenMenu(openMenu === plan.id ? null : plan.id)
                }
                onEdit={() => handleEditPlan(plan.id)}
                onCycle={() => handleOpenMenuCycle(plan.id)}
                onDelete={() => deletePlan(plan.id)}
              />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && filteredPlans.length > 0 && view === "list" && (
          <div className="space-y-3">
            {filteredPlans.map((plan) => (
              <PlanListRow
                key={plan.id}
                plan={plan}
                deleting={deletingId === plan.id}
                menuOpen={openMenu === plan.id}
                onMenu={() =>
                  setOpenMenu(openMenu === plan.id ? null : plan.id)
                }
                onEdit={() => handleEditPlan(plan.id)}
                onCycle={() => handleOpenMenuCycle(plan.id)}
                onDelete={() => deletePlan(plan.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating create button */}
      <button
        onClick={handleCreatePlan}
        aria-label="Create subscription plan"
        className="fixed bottom-6 right-5 z-20 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-2xl shadow-slate-900/25 transition hover:-translate-y-1 hover:bg-violet-600 sm:right-8"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10">
          <Plus className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">New plan</span>
      </button>
    </div>
  );
}

function HeaderStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3.5 backdrop-blur">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`rounded-lg p-2 transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {icon}
    </button>
  );
}

function PlanCard({
  plan,
  deleting,
  menuOpen,
  onMenu,
  onEdit,
  onCycle,
  onDelete,
}: {
  plan: SubscriptionPlan;
  deleting: boolean;
  menuOpen: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onCycle: () => void;
  onDelete: () => void;
}) {
  const meta = getPlanMeta(plan.plan_type);
  const meals = asArray(plan.meal_type);
  const features = asArray(plan.features);
  const includes = asArray(plan.includes);
  const accent =
    plan.color && plan.color.startsWith("#") ? plan.color : "#8b5cf6";

  return (
    <article className="group relative overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/[0.06]">
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, #f97316)` }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-inner"
              style={{
                backgroundColor: `${accent}12`,
                borderColor: `${accent}22`,
              }}
            >
              {plan.emoji || "🥗"}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-slate-900">
                {plan.title || "Untitled Plan"}
              </h2>
              {plan.tagline && (
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {plan.tagline}
                </p>
              )}
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={onMenu}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-10 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <MenuAction
                  icon={<Edit3 className="h-3.5 w-3.5" />}
                  label="Edit plan"
                  onClick={onEdit}
                />
                <MenuAction
                  icon={<Grid3X3 className="h-3.5 w-3.5" />}
                  label="30-day menu"
                  onClick={onCycle}
                />
                <MenuAction
                  danger
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  label={deleting ? "Deleting..." : "Delete plan"}
                  onClick={onDelete}
                  disabled={deleting}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge className={meta.className}>
            {meta.icon} {meta.label}
          </Badge>
          {plan.goal && (
            <Badge className="border-orange-100 bg-orange-50 text-orange-700">
              {plan.goal}
            </Badge>
          )}
          {plan.diet_type && (
            <Badge className="border-sky-100 bg-sky-50 text-sky-700">
              {plan.diet_type}
            </Badge>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              30-day price
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              ₹{money(plan.price)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Daily avg.
            </p>
            <p className="mt-1 text-sm font-black text-slate-700">
              ₹{Math.round(Number(plan.price || 0) / 30)}/day
            </p>
          </div>
        </div>

        {plan.description && (
          <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">
            {plan.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoTile
            icon={<Clock3 className="h-3.5 w-3.5" />}
            label="Duration"
            value="30 days"
          />
          <InfoTile
            icon={<Flame className="h-3.5 w-3.5" />}
            label="Calories"
            value={
              plan.calories_per_day
                ? `${plan.calories_per_day}/day`
                : "Flexible"
            }
          />
        </div>

        {plan.breakfast_price != null && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2.5">
            <span className="text-xs font-semibold text-orange-700">
              🍳 Breakfast add-on
            </span>
            <span className="text-xs font-black text-orange-800">
              ₹{money(plan.breakfast_price)}/day
            </span>
          </div>
        )}

        {meals.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Meal coverage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {meals.slice(0, 4).map((meal) => (
                <span
                  key={meal}
                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600"
                >
                  {meal}
                </span>
              ))}
            </div>
          </div>
        )}

        {(features.length > 0 || includes.length > 0) && (
          <div className="mt-4 space-y-1.5">
            {[...features, ...includes].slice(0, 3).map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-start gap-2 text-[11px] text-slate-500"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-[1fr_1.25fr] gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={onCycle}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-violet-600"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            30-Day Menu
          </button>
        </div>
      </div>
    </article>
  );
}

function PlanListRow({
  plan,
  deleting,
  menuOpen,
  onMenu,
  onEdit,
  onCycle,
  onDelete,
}: {
  plan: SubscriptionPlan;
  deleting: boolean;
  menuOpen: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onCycle: () => void;
  onDelete: () => void;
}) {
  const meta = getPlanMeta(plan.plan_type);
  const accent =
    plan.color && plan.color.startsWith("#") ? plan.color : "#8b5cf6";

  return (
    <article className="relative overflow-visible rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${accent}12` }}
          >
            {plan.emoji || "🥗"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-black text-slate-900">
              {plan.title || "Untitled Plan"}
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {plan.tagline || plan.description || "30-day subscription plan"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={meta.className}>
            {meta.icon} {meta.label}
          </Badge>
          {plan.goal && (
            <Badge className="border-orange-100 bg-orange-50 text-orange-700">
              {plan.goal}
            </Badge>
          )}
          {plan.diet_type && (
            <Badge className="border-sky-100 bg-sky-50 text-sky-700">
              {plan.diet_type}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-7">
          <Metric label="Price" value={`₹${money(plan.price)}`} />
          <Metric
            label="Breakfast"
            value={
              plan.breakfast_price != null
                ? `₹${money(plan.breakfast_price)}`
                : "—"
            }
          />
          <Metric
            label="Calories"
            value={plan.calories_per_day ? String(plan.calories_per_day) : "—"}
          />
        </div>

        <div className="flex items-center gap-2 xl:ml-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={onCycle}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-600"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Menu
          </button>

          <div className="relative">
            <button
              onClick={onMenu}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <MenuAction
                  icon={<Edit3 className="h-3.5 w-3.5" />}
                  label="Edit plan"
                  onClick={onEdit}
                />
                <MenuAction
                  icon={<Grid3X3 className="h-3.5 w-3.5" />}
                  label="30-day menu"
                  onClick={onCycle}
                />
                <MenuAction
                  danger
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  label={deleting ? "Deleting..." : "Delete plan"}
                  onClick={onDelete}
                  disabled={deleting}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-black text-slate-700">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function MenuAction({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PlanSkeleton({ list = false }: { list?: boolean }) {
  if (list) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-3 w-56 rounded bg-slate-100" />
          </div>
          <div className="hidden h-8 w-20 rounded bg-slate-100 sm:block" />
          <div className="h-9 w-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-3 w-44 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 h-20 rounded-2xl bg-slate-100" />
      <div className="mt-4 h-8 rounded-xl bg-slate-100" />
      <div className="mt-5 h-11 rounded-xl bg-slate-100" />
    </div>
  );
}
