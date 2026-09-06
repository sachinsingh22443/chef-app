import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  Flame,
  Leaf,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";

const API = "https://chef-backend-qh12.onrender.com";

export default function SpecialHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [historyDate, setHistoryDate] = useState("");
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");

  const [selectedSpecial, setSelectedSpecial] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // =========================================================
  // FETCH SPECIAL HISTORY
  // =========================================================
  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      let url = `${API}/tomorrow-special/history`;

      const params = new URLSearchParams();

      // Specific date has priority
      if (historyDate) {
        params.append("date_filter", historyDate);
      } else {
        if (historyFromDate) {
          params.append("from_date", historyFromDate);
        }

        if (historyToDate) {
          params.append("to_date", historyToDate);
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(res.data.specials || []);
    } catch (err: any) {
      console.error(
        "SPECIAL HISTORY ERROR:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.detail ||
          "Failed to load special history"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VIEW COMPLETE SPECIAL
  // =========================================================
  const viewSpecial = async (specialId: string) => {
    try {
      setDetailLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      const res = await axios.get(
        `${API}/tomorrow-special/${specialId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedSpecial(res.data?.special || null);
    } catch (err: any) {
      console.error(
        "SPECIAL DETAIL ERROR:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.detail ||
          "Failed to load special details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    fetchHistory();
  }, []);

  // =========================================================
  // DISCOUNT
  // =========================================================
  const getDiscountPercent = (
    original: any,
    price: any
  ) => {
    const oldPrice = Number(original);
    const newPrice = Number(price);

    if (
      !oldPrice ||
      !newPrice ||
      oldPrice <= newPrice
    ) {
      return 0;
    }

    return Math.round(
      ((oldPrice - newPrice) / oldPrice) * 100
    );
  };

  // =========================================================
  // RESET FILTER
  // =========================================================
  const resetFilters = async () => {
    setHistoryDate("");
    setHistoryFromDate("");
    setHistoryToDate("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      const res = await axios.get(
        `${API}/tomorrow-special/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(res.data.specials || []);
    } catch (err: any) {
      console.error(
        "RESET HISTORY ERROR:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.detail ||
          "Failed to reset history"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] pb-24 text-slate-900">
      {/* PREMIUM HEADER */}
      <header className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-200">
                <Flame size={13} />
                Chef archive
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Special History
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Your complete Tomorrow Special archive — dishes, pricing,
                orders and kitchen details in one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Archived specials
              </p>
              <p className="mt-1 text-3xl font-black">{history.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* FILTER COMMAND CENTER */}
        <section className="-mt-5 relative z-10 rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <CalendarDays size={21} />
                </div>
                <div>
                  <h2 className="font-black">Find a special</h2>
                  <p className="text-xs text-slate-500">
                    Search by date or use a custom range.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Specific date
                  </label>
                  <input
                    type="date"
                    value={historyDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setHistoryDate(value);
                      if (value) {
                        setHistoryFromDate("");
                        setHistoryToDate("");
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    From
                  </label>
                  <input
                    type="date"
                    value={historyFromDate}
                    onChange={(e) => {
                      setHistoryFromDate(e.target.value);
                      setHistoryDate("");
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    To
                  </label>
                  <input
                    type="date"
                    value={historyToDate}
                    onChange={(e) => {
                      setHistoryToDate(e.target.value);
                      setHistoryDate("");
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 lg:w-52">
              <button
                type="button"
                onClick={fetchHistory}
                disabled={loading}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Searching..." : "Apply Filter"}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                disabled={loading}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* HISTORY */}
        <section className="mt-8">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-violet-50 text-3xl">
                🍽️
              </div>
              <p className="mt-4 font-bold">Loading your chef archive...</p>
              <p className="mt-1 text-sm text-slate-500">
                Fetching your previous specials.
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
              <div className="relative px-6 py-14 text-center sm:py-20">
                <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-violet-100 blur-3xl" />
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-slate-100 text-4xl">
                  📭
                </div>
                <h3 className="relative mt-5 text-xl font-black">
                  No special history
                </h3>
                <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No Tomorrow Special was found for the selected date or range.
                  Try another filter.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                    Your archive
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Previous specials
                  </h2>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                  {history.length} found
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {history.map((item: any) => {
                  const totalPlates = Number(item.max_plates || 0);
                  const orderedPlates = Number(item.pre_orders || 0);
                  const remainingPlates =
                    item.remaining != null
                      ? Number(item.remaining)
                      : Math.max(0, totalPlates - orderedPlates);

                  const discount = getDiscountPercent(
                    item.original_price,
                    item.price
                  );

                  const soldPercent = totalPlates
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          (orderedPlates / totalPlates) * 100
                        )
                      )
                    : 0;

                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8"
                    >
                      <div className="relative h-60 overflow-hidden bg-slate-100">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.dish_name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 via-violet-100 to-emerald-100 text-7xl">
                            🍱
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1.5 text-[11px] font-black shadow-lg backdrop-blur ${
                              item.food_type === "veg"
                                ? "bg-emerald-500/90 text-white"
                                : "bg-red-500/90 text-white"
                            }`}
                          >
                            {item.food_type === "veg"
                              ? "🌱 VEG"
                              : "🍗 NON-VEG"}
                          </span>

                          {discount > 0 && (
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-emerald-700 shadow-lg">
                              {discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                                Chef special
                              </p>
                              <h3 className="mt-1 text-2xl font-black leading-tight">
                                {item.dish_name}
                              </h3>
                            </div>
                            <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur-md">
                              <p className="text-[10px] text-white/70">
                                Price
                              </p>
                              <p className="font-black">₹{item.price}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-violet-50 p-3">
                            <div className="flex items-center gap-2 text-violet-600">
                              <CalendarDays size={15} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                Date
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-black text-slate-800">
                              {item.special_date || "—"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-orange-50 p-3">
                            <div className="flex items-center gap-2 text-orange-600">
                              <Clock3 size={15} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                Cutoff
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-black text-slate-800">
                              {item.cutoff_time || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                              Plate performance
                            </span>
                            <span className="text-xs font-black text-slate-800">
                              {orderedPlates}/{totalPlates}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-violet-600 transition-all"
                              style={{ width: `${soldPercent}%` }}
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-3 text-center">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Total
                              </p>
                              <p className="mt-1 font-black">{totalPlates}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Ordered
                              </p>
                              <p className="mt-1 font-black text-orange-600">
                                {orderedPlates}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Left
                              </p>
                              <p className="mt-1 font-black text-emerald-600">
                                {remainingPlates}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Final status
                            </p>
                            <span
                              className={`mt-1 inline-flex rounded-full px-3 py-1.5 text-[10px] font-black ${
                                remainingPlates <= 0
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {remainingPlates <= 0
                                ? "SOLD OUT"
                                : "COMPLETED"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => viewSpecial(item.id)}
                            disabled={detailLoading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black text-white transition hover:bg-violet-700 disabled:opacity-60"
                          >
                            <Eye size={16} />
                            {detailLoading ? "Loading..." : "View details"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* PREMIUM DETAIL MODAL */}
      {selectedSpecial && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[32px] bg-white shadow-2xl sm:max-w-3xl sm:rounded-[32px]">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                  Archived special
                </p>
                <h2 className="mt-1 text-lg font-black">
                  {selectedSpecial.dish_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpecial(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="relative overflow-hidden rounded-[28px] bg-slate-100">
                {selectedSpecial.image_url ? (
                  <img
                    src={selectedSpecial.image_url}
                    alt={selectedSpecial.dish_name}
                    className="h-64 w-full object-cover sm:h-80"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gradient-to-br from-orange-100 via-violet-100 to-emerald-100 text-7xl sm:h-80">
                    🍱
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white">
                  <h3 className="text-3xl font-black">
                    {selectedSpecial.dish_name}
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedSpecial.food_type && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-black ${
                      selectedSpecial.food_type === "veg"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {selectedSpecial.food_type === "veg"
                      ? "🌱 Veg"
                      : "🍗 Non-Veg"}
                  </span>
                )}
                {selectedSpecial.special_date && (
                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
                    📅 {selectedSpecial.special_date}
                  </span>
                )}
                {selectedSpecial.cutoff_time && (
                  <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
                    ⏰ {selectedSpecial.cutoff_time}
                  </span>
                )}
              </div>

              {selectedSpecial.description && (
                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    About the dish
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {selectedSpecial.description}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                    Special price
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    ₹{selectedSpecial.price}
                  </p>
                  {selectedSpecial.original_price &&
                    Number(selectedSpecial.original_price) >
                      Number(selectedSpecial.price) && (
                      <p className="text-xs text-slate-400 line-through">
                        ₹{selectedSpecial.original_price}
                      </p>
                    )}
                </div>
                <div className="rounded-2xl bg-violet-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-600">
                    Maximum
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {selectedSpecial.max_plates ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    Remaining
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {selectedSpecial.remaining ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Pre-orders
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {selectedSpecial.pre_orders ?? 0}
                  </p>
                </div>
                {selectedSpecial.preparation_time != null && (
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Timer size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Preparation
                      </p>
                      <p className="mt-1 font-black">
                        {selectedSpecial.preparation_time} minutes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(selectedSpecial.calories != null ||
                selectedSpecial.protein != null ||
                selectedSpecial.carbs != null ||
                selectedSpecial.fats != null) && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" />
                    <h3 className="font-black">Nutrition</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {selectedSpecial.calories != null && (
                      <div className="rounded-2xl bg-orange-50 p-4 text-center">
                        <p className="font-black text-orange-600">
                          {selectedSpecial.calories}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          kcal
                        </p>
                      </div>
                    )}
                    {selectedSpecial.protein != null && (
                      <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                        <p className="font-black text-emerald-600">
                          {selectedSpecial.protein}g
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          Protein
                        </p>
                      </div>
                    )}
                    {selectedSpecial.carbs != null && (
                      <div className="rounded-2xl bg-blue-50 p-4 text-center">
                        <p className="font-black text-blue-600">
                          {selectedSpecial.carbs}g
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          Carbs
                        </p>
                      </div>
                    )}
                    {selectedSpecial.fats != null && (
                      <div className="rounded-2xl bg-violet-50 p-4 text-center">
                        <p className="font-black text-violet-600">
                          {selectedSpecial.fats}g
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          Fats
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSpecial.ingredients && (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <div className="flex items-center gap-2">
                    <Leaf size={18} className="text-emerald-600" />
                    <h3 className="font-black">Ingredients</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedSpecial.ingredients}
                  </p>
                </div>
              )}

              {selectedSpecial.created_at && (
                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <Clock3 size={14} />
                  Created{" "}
                  {new Date(selectedSpecial.created_at).toLocaleString(
                    "en-IN",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
