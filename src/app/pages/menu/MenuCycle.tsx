import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  Coffee,
  Copy,
  Edit3,
  Loader2,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Sun,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

const API = axios.create({
  baseURL: "https://chef-backend-qh12.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_urls?: string[];
  is_available?: boolean;
  is_deleted?: boolean;
  food_type?: string;
};

type MealType = "breakfast" | "lunch" | "dinner";

type DayMenus = {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
};

type CycleItem = {
  cycle_day: number;
  meal_type: MealType;
  menu_id: string;
};

type ExistingCycleItem = {
  id?: string;
  chef_id?: string;
  menu_id: string;
  cycle_day: number;
  meal_type: MealType;
  cycle_start_date?: string;
};

type ExistingCycle = {
  cycle_start_date: string;
  cycle_end_date?: string;
  items: ExistingCycleItem[];
};

const TOTAL_DAYS = 30;
const TOTAL_MEAL_ASSIGNMENTS = 90;

const MEAL_CONFIG: Record<
  MealType,
  {
    label: string;
    cutoff: string;
    icon: typeof Coffee;
    accent: string;
    soft: string;
  }
> = {
  breakfast: {
    label: "Breakfast",
    cutoff: "08:30 AM",
    icon: Coffee,
    accent: "text-amber-300",
    soft: "bg-amber-300/10 border-amber-300/15",
  },
  lunch: {
    label: "Lunch",
    cutoff: "11:00 AM",
    icon: Sun,
    accent: "text-orange-300",
    soft: "bg-orange-300/10 border-orange-300/15",
  },
  dinner: {
    label: "Dinner",
    cutoff: "06:00 PM",
    icon: Moon,
    accent: "text-indigo-300",
    soft: "bg-indigo-300/10 border-indigo-300/15",
  },
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function formatDisplayDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMenu(items: MenuItem[], id?: string) {
  return items.find((menu) => String(menu.id) === String(id));
}

export default function MenuCycle() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cycles, setCycles] = useState<ExistingCycle[]>([]);
  const [cycleStartDate, setCycleStartDate] = useState(formatDate(new Date()));
  const [selectedMenus, setSelectedMenus] = useState<Record<number, DayMenus>>(
    {}
  );

  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingCycle, setDeletingCycle] = useState<string | null>(null);
  const [editingCycle, setEditingCycle] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDay, setOpenDay] = useState(1);

  const fetchMenus = async () => {
    try {
      setLoadingMenus(true);
      setError("");

      const response = await API.get("/menu/my");
      const menus = Array.isArray(response.data) ? response.data : [];

      setMenuItems(menus.filter((menu: MenuItem) => !menu.is_deleted));
    } catch (err: any) {
      console.error("FETCH MENUS ERROR:", err);
      setError(err.response?.data?.detail || "Unable to load your menus.");
    } finally {
      setLoadingMenus(false);
    }
  };

  const fetchCycles = async () => {
    try {
      setLoadingCycles(true);
      const response = await API.get("/menu-cycle/");
      const data = response.data;

      if (Array.isArray(data?.cycles)) setCycles(data.cycles);
      else if (Array.isArray(data)) setCycles(data);
      else setCycles([]);
    } catch (err: any) {
      console.error("FETCH CYCLES ERROR:", err.response?.data || err);
      setCycles([]);
    } finally {
      setLoadingCycles(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchCycles();
  }, []);

  const cycleEndDate = useMemo(
    () => (cycleStartDate ? addDays(cycleStartDate, TOTAL_DAYS - 1) : ""),
    [cycleStartDate]
  );

  const selectedCount = useMemo(
    () =>
      Object.values(selectedMenus).reduce(
        (total, day) =>
          total +
          Number(Boolean(day.breakfast)) +
          Number(Boolean(day.lunch)) +
          Number(Boolean(day.dinner)),
        0
      ),
    [selectedMenus]
  );

  const completion = Math.round(
    (selectedCount / TOTAL_MEAL_ASSIGNMENTS) * 100
  );
  const isComplete = selectedCount === TOTAL_MEAL_ASSIGNMENTS;

  const handleMenuChange = (
    day: number,
    mealType: MealType,
    menuId: string
  ) => {
    setSelectedMenus((previous) => ({
      ...previous,
      [day]: {
        ...(previous[day] || {}),
        [mealType]: menuId,
      },
    }));
    setError("");
    setSuccess("");
  };

  const handleFillAll = (mealType: MealType, menuId: string) => {
    if (!menuId) return;

    setSelectedMenus((previous) => {
      const updated = { ...previous };
      for (let day = 1; day <= TOTAL_DAYS; day++) {
        updated[day] = {
          ...(updated[day] || {}),
          [mealType]: menuId,
        };
      }
      return updated;
    });

    setError("");
    setSuccess("");
  };

  const handleClearAll = () => {
    setSelectedMenus({});
    setError("");
    setSuccess("");
    setOpenDay(1);
  };

  const buildCycleItems = (): CycleItem[] => {
    const items: CycleItem[] = [];

    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const dayMenus = selectedMenus[day];

      if (dayMenus?.breakfast) {
        items.push({
          cycle_day: day,
          meal_type: "breakfast",
          menu_id: dayMenus.breakfast,
        });
      }

      if (dayMenus?.lunch) {
        items.push({
          cycle_day: day,
          meal_type: "lunch",
          menu_id: dayMenus.lunch,
        });
      }

      if (dayMenus?.dinner) {
        items.push({
          cycle_day: day,
          meal_type: "dinner",
          menu_id: dayMenus.dinner,
        });
      }
    }

    return items;
  };

  const validateComplete = () => {
    if (!cycleStartDate) {
      setError("Please select a cycle start date.");
      return false;
    }

    if (!isComplete) {
      const remaining = TOTAL_MEAL_ASSIGNMENTS - selectedCount;
      setError(`Please select all 90 meals. ${remaining} meals are still missing.`);
      return false;
    }

    const items = buildCycleItems();

    if (items.length !== TOTAL_MEAL_ASSIGNMENTS) {
      setError("Exactly 90 menu entries are required.");
      return false;
    }

    return true;
  };

  const handleSaveCycle = async () => {
    setError("");
    setSuccess("");

    if (!validateComplete()) return;

    try {
      setSaving(true);

      await API.post("/menu-cycle/", {
        cycle_start_date: cycleStartDate,
        items: buildCycleItems(),
      });

      setSuccess("30-day menu cycle created successfully.");
      setSelectedMenus({});
      setOpenDay(1);
      await fetchCycles();
    } catch (err: any) {
      console.error("CREATE CYCLE ERROR:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item: any) => item.msg || "Validation error").join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Unable to create menu cycle.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLoadCycle = (cycle: ExistingCycle) => {
    const values: Record<number, DayMenus> = {};

    for (const item of cycle.items || []) {
      if (!values[item.cycle_day]) values[item.cycle_day] = {};

      const mealType = item.meal_type?.toLowerCase().trim();

      if (
        mealType === "breakfast" ||
        mealType === "lunch" ||
        mealType === "dinner"
      ) {
        values[item.cycle_day][mealType] = item.menu_id;
      }
    }

    setCycleStartDate(cycle.cycle_start_date);
    setSelectedMenus(values);
    setEditingCycle(cycle.cycle_start_date);
    setError("");
    setSuccess("Existing cycle loaded. Make your changes and update the cycle.");
    setOpenDay(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCycle(null);
    setSelectedMenus({});
    setCycleStartDate(formatDate(new Date()));
    setError("");
    setSuccess("Edit cancelled.");
  };

  const handleUpdateCycle = async () => {
    if (!editingCycle) {
      setError("No cycle selected for update.");
      return;
    }

    setError("");
    setSuccess("");

    if (!isComplete) {
      setError(
        `Please select all 90 meals. ${
          TOTAL_MEAL_ASSIGNMENTS - selectedCount
        } meals are still missing.`
      );
      return;
    }

    try {
      setSaving(true);

      await API.put(
        `/menu-cycle/cycle/${encodeURIComponent(editingCycle)}`,
        {
          cycle_start_date: editingCycle,
          items: buildCycleItems(),
        }
      );

      setSuccess("Menu cycle updated successfully.");
      setEditingCycle(null);
      setSelectedMenus({});
      setOpenDay(1);
      await fetchCycles();
    } catch (err: any) {
      console.error("UPDATE CYCLE ERROR:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item: any) => item.msg || "Validation error").join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Unable to update menu cycle.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCycle = async (cycle: ExistingCycle) => {
    const startDate = cycle.cycle_start_date;

    const confirmed = window.confirm(
      `Delete the menu cycle starting ${formatDisplayDate(
        startDate
      )}?\n\nOnly the menu cycle configuration will be deleted. Menus, orders and carts are not deleted.`
    );

    if (!confirmed) return;

    try {
      setDeletingCycle(startDate);
      setError("");
      setSuccess("");

      await API.delete(
        `/menu-cycle/cycle/${encodeURIComponent(startDate)}`
      );

      if (editingCycle === startDate) {
        setEditingCycle(null);
        setSelectedMenus({});
      }

      setSuccess("Menu cycle deleted successfully.");
      await fetchCycles();
    } catch (err: any) {
      console.error("DELETE CYCLE ERROR:", err);

      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Unable to delete menu cycle."
      );
    } finally {
      setDeletingCycle(null);
    }
  };

  const handleRefresh = async () => {
    setError("");
    setSuccess("");
    await Promise.all([fetchMenus(), fetchCycles()]);
  };

  const toggleDay = (day: number) => {
    setOpenDay((current) => (current === day ? 0 : day));
  };

  const renderMealSelect = (
    day: number,
    mealType: MealType,
    dayMenus: DayMenus
  ) => {
    const config = MEAL_CONFIG[mealType];
    const Icon = config.icon;
    const selectedMenuId = dayMenus[mealType];
    const selectedMenu = getMenu(menuItems, selectedMenuId);

    return (
      <div
        className={`rounded-2xl border ${config.soft} p-3 transition sm:p-4`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 ${config.accent}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black">{config.label}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                <Clock3 className="h-3 w-3" />
                cutoff {config.cutoff}
              </span>
            </div>
            {selectedMenu ? (
              <p className="mt-0.5 truncate text-xs text-white/45">
                {selectedMenu.name} · ₹{selectedMenu.price}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-white/25">Choose a dish</p>
            )}
          </div>

          {selectedMenu && (
            <CircleCheck className="hidden h-5 w-5 shrink-0 text-emerald-300 sm:block" />
          )}
        </div>

        <select
          value={selectedMenuId || ""}
          onChange={(e) => handleMenuChange(day, mealType, e.target.value)}
          className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-[#0a1511] px-3 text-sm text-white outline-none transition focus:border-orange-300/40 focus:ring-2 focus:ring-orange-300/10"
        >
          <option value="">Select {config.label}</option>
          {menuItems.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.name} — ₹{menu.price}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#07100d] pb-28 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-40 h-[500px] w-[500px] rounded-full bg-orange-300/10 blur-3xl" />
        <div className="absolute -right-48 top-[35%] h-[520px] w-[520px] rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-[#08130f]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                  Menu Planner
                </span>
              </div>
              <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">
                30-Day Menu Cycle
              </h1>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  loadingMenus || loadingCycles ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniStat
              icon={<CalendarDays className="h-4 w-4" />}
              label="Cycle window"
              value={`${formatDisplayDate(cycleStartDate)} → ${formatDisplayDate(
                cycleEndDate
              )}`}
            />
            <MiniStat
              icon={<Utensils className="h-4 w-4" />}
              label="Meals assigned"
              value={`${selectedCount} / 90`}
            />
            <MiniStat
              icon={<CircleCheck className="h-4 w-4" />}
              label="Completion"
              value={`${completion}%`}
              positive={completion === 100}
            />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Status messages */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-300/[0.07] p-4 text-sm text-red-100">
            <X className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] p-4 text-sm text-emerald-100">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <span>{success}</span>
          </div>
        )}

        {/* Editing banner */}
        {editingCycle && (
          <section className="mb-5 rounded-[26px] border border-orange-300/20 bg-orange-300/[0.07] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-300/10">
                <Pencil className="h-5 w-5 text-orange-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-orange-100">
                  Editing existing cycle
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Started {formatDisplayDate(editingCycle)}. The original
                  start date will be preserved.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white"
              >
                Cancel edit
              </button>
            </div>
          </section>
        )}

        {/* Start date */}
        <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-300/10">
                <CalendarDays className="h-6 w-6 text-orange-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">
                  Schedule
                </p>
                <h2 className="mt-1 text-lg font-black">Cycle start date</h2>
                <p className="mt-1 text-xs leading-5 text-white/30">
                  This automatically creates a continuous 30-day window.
                </p>
              </div>
            </div>

            <div className="w-full lg:max-w-xs">
              <input
                type="date"
                value={cycleStartDate}
                onChange={(e) => {
                  setCycleStartDate(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                disabled={!!editingCycle}
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-300/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-2 text-center text-[11px] text-white/25">
                {formatDisplayDate(cycleStartDate)} —{" "}
                {formatDisplayDate(cycleEndDate)}
              </p>
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                Build progress
              </p>
              <h2 className="mt-1 text-xl font-black">
                {isComplete ? "Cycle is ready." : "Fill your 90 meal slots."}
              </h2>
            </div>
            <span className="text-2xl font-black text-orange-300">
              {completion}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-300 to-emerald-300 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-[11px] text-white/30">
            <span>{selectedCount} assigned</span>
            <span>{TOTAL_MEAL_ASSIGNMENTS - selectedCount} remaining</span>
          </div>
        </section>

        {/* Quick fill */}
        {!loadingMenus && menuItems.length > 0 && (
          <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                <Copy className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <h2 className="font-black">Quick fill</h2>
                <p className="mt-1 text-xs leading-5 text-white/30">
                  Assign one dish to all 30 days for a meal type. You can
                  customize individual days afterwards.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {(["breakfast", "lunch", "dinner"] as MealType[]).map(
                (mealType) => {
                  const config = MEAL_CONFIG[mealType];
                  const Icon = config.icon;

                  return (
                    <div
                      key={mealType}
                      className="rounded-2xl border border-white/10 bg-black/15 p-3"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.accent}`} />
                        <span className="text-xs font-black">
                          {config.label}
                        </span>
                      </div>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleFillAll(mealType, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="h-11 w-full rounded-xl border border-white/10 bg-[#0a1511] px-3 text-xs text-white outline-none focus:border-orange-300/30"
                      >
                        <option value="">Fill all 30 days…</option>
                        {menuItems.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} — ₹{menu.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
              )}
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Clear all assignments
            </button>
          </section>
        )}

        {/* Days */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">
                Daily planner
              </p>
              <h2 className="mt-1 text-2xl font-black">30 days</h2>
            </div>
            <p className="hidden text-xs text-white/25 sm:block">
              3 meals × 30 days
            </p>
          </div>

          {loadingMenus ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-10 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-orange-300" />
              <p className="mt-3 text-sm text-white/35">Loading your menu…</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-300/10">
                <Utensils className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="mt-4 text-xl font-black">No menu items yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/30">
                Create at least one dish before building your 30-day cycle.
              </p>
              <button
                type="button"
                onClick={() => navigate("/menu/add")}
                className="mt-5 rounded-xl bg-orange-300 px-5 py-3 text-sm font-black text-[#171006]"
              >
                <Plus className="mr-1.5 inline h-4 w-4" />
                Create menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: TOTAL_DAYS }, (_, index) => {
                const day = index + 1;
                const dayMenus = selectedMenus[day] || {};
                const dayComplete =
                  !!dayMenus.breakfast &&
                  !!dayMenus.lunch &&
                  !!dayMenus.dinner;
                const targetDate = addDays(cycleStartDate, index);
                const expanded = openDay === day;

                return (
                  <div
                    key={day}
                    className={`overflow-hidden rounded-[24px] border transition ${
                      dayComplete
                        ? "border-emerald-300/15 bg-emerald-300/[0.025]"
                        : "border-white/10 bg-white/[0.035]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                          dayComplete
                            ? "bg-emerald-300/10 text-emerald-300"
                            : "bg-orange-300/10 text-orange-300"
                        }`}
                      >
                        {dayComplete ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          String(day).padStart(2, "0")
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black">Day {day}</span>
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                              dayComplete
                                ? "bg-emerald-300/10 text-emerald-300"
                                : "bg-white/[0.06] text-white/30"
                            }`}
                          >
                            {dayComplete ? "Complete" : "Pending"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/30">
                          {formatDisplayDate(targetDate)}
                        </p>
                      </div>

                      <div className="hidden items-center gap-1 sm:flex">
                        {(["breakfast", "lunch", "dinner"] as MealType[]).map(
                          (mealType) => (
                            <span
                              key={mealType}
                              className={`h-2 w-2 rounded-full ${
                                dayMenus[mealType]
                                  ? "bg-emerald-300"
                                  : "bg-white/10"
                              }`}
                            />
                          )
                        )}
                      </div>

                      {expanded ? (
                        <ChevronDown className="h-5 w-5 text-white/30" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-white/30" />
                      )}
                    </button>

                    {expanded && (
                      <div className="border-t border-white/10 p-4 sm:p-5">
                        <div className="grid gap-3 lg:grid-cols-3">
                          {renderMealSelect(day, "breakfast", dayMenus)}
                          {renderMealSelect(day, "lunch", dayMenus)}
                          {renderMealSelect(day, "dinner", dayMenus)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Save CTA */}
        {!loadingMenus && menuItems.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-[28px] border border-orange-300/15 bg-gradient-to-br from-orange-300/[0.10] via-white/[0.04] to-emerald-300/[0.06] p-5 shadow-2xl sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CircleCheck className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-orange-300" />
                  )}
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
                    {isComplete ? "Ready to publish" : "Almost there"}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-black">
                  {editingCycle ? "Update this cycle" : "Save your 30-day plan"}
                </h3>
                <p className="mt-1 text-xs leading-5 text-white/30">
                  {isComplete
                    ? "All 90 meal slots are configured."
                    : `${TOTAL_MEAL_ASSIGNMENTS - selectedCount} meal slots still need a dish.`}
                </p>
              </div>

              <button
                type="button"
                onClick={editingCycle ? handleUpdateCycle : handleSaveCycle}
                disabled={saving || !isComplete}
                className={`flex h-13 min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-black transition ${
                  saving || !isComplete
                    ? "cursor-not-allowed bg-white/10 text-white/25"
                    : "bg-orange-300 text-[#171006] hover:bg-orange-200 active:scale-[0.98]"
                }`}
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingCycle ? (
                  <Edit3 className="h-5 w-5" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving
                  ? editingCycle
                    ? "Updating…"
                    : "Saving…"
                  : editingCycle
                    ? "Update cycle"
                    : "Save 30-day cycle"}
              </button>
            </div>
          </section>
        )}

        {/* Existing cycles */}
        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
              Archive
            </p>
            <h2 className="mt-1 text-2xl font-black">Existing cycles</h2>
          </div>

          {loadingCycles ? (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-7 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-white/30" />
            </div>
          ) : cycles.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] p-7 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-white/15" />
              <p className="mt-3 text-sm font-bold text-white/40">
                No menu cycles created yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {cycles.map((cycle, index) => {
                const endDate =
                  cycle.cycle_end_date ||
                  addDays(cycle.cycle_start_date, TOTAL_DAYS - 1);
                const isEditing =
                  editingCycle === cycle.cycle_start_date;
                const isDeleting =
                  deletingCycle === cycle.cycle_start_date;
                const mealCount = cycle.items?.length || 0;
                const cycleComplete = mealCount === TOTAL_MEAL_ASSIGNMENTS;

                return (
                  <div
                    key={`${cycle.cycle_start_date}-${index}`}
                    className={`rounded-[24px] border p-4 sm:p-5 ${
                      isEditing
                        ? "border-orange-300/25 bg-orange-300/[0.06]"
                        : "border-white/10 bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                        <CalendarDays className="h-5 w-5 text-white/50" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black">
                            {formatDisplayDate(cycle.cycle_start_date)}
                          </h3>
                          {isEditing && (
                            <span className="rounded-full bg-orange-300/10 px-2 py-1 text-[9px] font-black uppercase text-orange-300">
                              Editing
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-white/30">
                          Ends {formatDisplayDate(endDate)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              cycleComplete
                                ? "bg-emerald-300/10 text-emerald-300"
                                : "bg-orange-300/10 text-orange-300"
                            }`}
                          >
                            {mealCount}/90 meals
                          </span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-white/30">
                            30 days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadCycle(cycle)}
                        disabled={saving || isDeleting}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-300/10 text-xs font-black text-orange-300 transition hover:bg-orange-300/15 disabled:opacity-40"
                      >
                        <Pencil className="h-4 w-4" />
                        {isEditing ? "Editing" : "Edit cycle"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCycle(cycle)}
                        disabled={saving || isDeleting}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-300/[0.07] text-xs font-black text-red-300 transition hover:bg-red-300/10 disabled:opacity-40"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Sticky bottom progress on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07100d]/90 p-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-white/35">
            <span>{selectedCount}/90 meals assigned</span>
            <span>{completion}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-orange-300 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
      <div className="flex items-center gap-2 text-white/35">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`mt-2 truncate text-xs font-black ${
          positive ? "text-emerald-300" : "text-white/70"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
