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
    <div className="min-h-screen bg-[#FFF8F0] pb-24">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="bg-gradient-to-br from-[#FF7A30] via-[#5F2EEA] to-[#0FAD6E] p-6 text-white">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium"
        >
          <ArrowLeft
            className="mr-2"
            size={20}
          />

          Back
        </button>

        <div className="mt-5">
          <p className="text-white/80 text-sm">
            Chef Dashboard
          </p>

          <h1 className="text-3xl font-bold mt-1">
            Special History
          </h1>

          <p className="text-white/80 text-sm mt-2">
            View all your previous Tomorrow Specials
          </p>
        </div>
      </div>

      {/* =====================================================
          FILTER SECTION
      ====================================================== */}
      <div className="p-6">

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">

          <div className="flex items-center gap-2 mb-4">

            <CalendarDays
              size={20}
              className="text-purple-600"
            />

            <div>
              <h2 className="font-bold text-gray-900">
                Filter History
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Search by a specific date or date range
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">

            {/* SPECIFIC DATE */}
            <div>

              <label className="text-xs font-semibold text-gray-600">
                Specific Date
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
                className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white"
              />

            </div>

            {/* DATE RANGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>

                <label className="text-xs font-semibold text-gray-600">
                  From Date
                </label>

                <input
                  type="date"
                  value={historyFromDate}
                  onChange={(e) => {
                    setHistoryFromDate(
                      e.target.value
                    );

                    setHistoryDate("");
                  }}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white"
                />

              </div>

              <div>

                <label className="text-xs font-semibold text-gray-600">
                  To Date
                </label>

                <input
                  type="date"
                  value={historyToDate}
                  onChange={(e) => {
                    setHistoryToDate(
                      e.target.value
                    );

                    setHistoryDate("");
                  }}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white"
                />

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-2">

              <button
                type="button"
                onClick={fetchHistory}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60"
              >
                {loading
                  ? "Loading..."
                  : "Apply Filter"}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                disabled={loading}
                className="px-4 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
              >
                Reset
              </button>

            </div>

          </div>
        </div>

        {/* ===================================================
            HISTORY LIST
        ==================================================== */}
        <div className="mt-6 space-y-4">

          {loading ? (

            <div className="bg-white rounded-3xl p-10 text-center shadow-sm">

              <div className="text-4xl mb-3">
                ⏳
              </div>

              <p className="text-sm text-gray-500">
                Loading special history...
              </p>

            </div>

          ) : history.length === 0 ? (

            <div className="bg-white rounded-3xl p-10 text-center shadow-sm">

              <div className="text-6xl mb-4">
                📭
              </div>

              <h3 className="font-bold text-gray-900">
                No Special History
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                No Tomorrow Special found for the selected date.
              </p>

            </div>

          ) : (

            history.map((item: any) => {

              const totalPlates =
                Number(item.max_plates || 0);

              const orderedPlates =
                Number(item.pre_orders || 0);

              const remainingPlates =
                item.remaining != null
                  ? Number(item.remaining)
                  : Math.max(
                      0,
                      totalPlates - orderedPlates
                    );

              const discount =
                getDiscountPercent(
                  item.original_price,
                  item.price
                );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >

                  <div className="p-5">

                    <div className="flex gap-4">

                      {/* IMAGE */}
                      {item.image_url ? (

                        <img
                          src={item.image_url}
                          alt={item.dish_name}
                          className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                        />

                      ) : (

                        <div className="w-24 h-24 rounded-2xl bg-orange-50 flex items-center justify-center text-4xl flex-shrink-0">
                          🍱
                        </div>

                      )}

                      {/* BASIC INFO */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-2">

                          <h3 className="font-bold text-gray-900 text-lg">
                            {item.dish_name}
                          </h3>

                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                              remainingPlates <= 0
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {remainingPlates <= 0
                              ? "SOLD OUT"
                              : "COMPLETED"}
                          </span>

                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          📅 {item.special_date}
                        </p>

                        {item.cutoff_time && (
                          <p className="text-xs text-gray-500 mt-1">
                            ⏰ Order till {item.cutoff_time}
                          </p>
                        )}

                        {/* PRICE */}
                        <div className="flex items-center gap-2 mt-2">

                          <span className="text-xl font-bold text-orange-600">
                            ₹{item.price}
                          </span>

                          {item.original_price &&
                            Number(item.original_price) >
                              Number(item.price) && (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{item.original_price}
                                </span>

                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  {discount}% OFF
                                </span>
                              </>
                            )}

                        </div>

                      </div>
                    </div>

                    {/* PLATE SUMMARY */}
                    <div className="mt-4 bg-gray-50 rounded-2xl p-4">

                      <div className="grid grid-cols-3 gap-2 text-center">

                        <div>
                          <p className="text-[10px] text-gray-500">
                            Total
                          </p>

                          <p className="font-bold text-gray-900 mt-1">
                            {totalPlates}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-gray-500">
                            Ordered
                          </p>

                          <p className="font-bold text-orange-600 mt-1">
                            {orderedPlates}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-gray-500">
                            Remaining
                          </p>

                          <p className="font-bold text-green-600 mt-1">
                            {remainingPlates}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* VIEW BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        viewSpecial(item.id)
                      }
                      disabled={detailLoading}
                      className="w-full mt-4 bg-purple-50 text-purple-700 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-100 transition disabled:opacity-60"
                    >

                      {detailLoading ? (
                        "Loading..."
                      ) : (
                        <>
                          <Eye size={17} />
                          View Complete Special
                        </>
                      )}

                    </button>

                  </div>
                </div>
              );
            })

          )}

        </div>
      </div>

      {/* =====================================================
          COMPLETE SPECIAL DETAILS MODAL
      ====================================================== */}
      {selectedSpecial && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-6">

          <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex items-center justify-between">

              <div>

                <p className="text-xs text-gray-500">
                  Special Details
                </p>

                <h2 className="font-bold text-lg text-gray-900">
                  {selectedSpecial.dish_name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSpecial(null)
                }
                className="p-2 rounded-full bg-gray-100 text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}
            <div className="p-5">

              {/* IMAGE */}
              {selectedSpecial.image_url ? (

                <img
                  src={selectedSpecial.image_url}
                  alt={selectedSpecial.dish_name}
                  className="w-full h-64 object-cover rounded-3xl"
                />

              ) : (

                <div className="w-full h-64 rounded-3xl bg-gradient-to-br from-orange-100 via-purple-100 to-green-100 flex items-center justify-center text-7xl">
                  🍱
                </div>

              )}

              {/* TITLE */}
              <h2 className="text-2xl font-bold text-gray-900 mt-5">
                {selectedSpecial.dish_name}
              </h2>

              {/* BADGES */}
              <div className="flex flex-wrap gap-2 mt-3">

                {selectedSpecial.food_type && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                    {selectedSpecial.food_type === "veg"
                      ? "🌱 Veg"
                      : "🍗 Non-Veg"}
                  </span>
                )}

                {selectedSpecial.special_date && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700">
                    📅 {selectedSpecial.special_date}
                  </span>
                )}

                {selectedSpecial.cutoff_time && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-50 text-orange-700">
                    ⏰ {selectedSpecial.cutoff_time}
                  </span>
                )}

              </div>

              {/* DESCRIPTION */}
              {selectedSpecial.description && (

                <div className="mt-5">

                  <h3 className="font-bold text-gray-900">
                    Description
                  </h3>

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {selectedSpecial.description}
                  </p>

                </div>

              )}

              {/* PRICE */}
              <div className="mt-5 bg-orange-50 rounded-2xl p-4">

                <p className="text-xs text-gray-500">
                  Special Price
                </p>

                <div className="flex items-center gap-3 mt-1">

                  <span className="text-3xl font-bold text-orange-600">
                    ₹{selectedSpecial.price}
                  </span>

                  {selectedSpecial.original_price &&
                    Number(selectedSpecial.original_price) >
                      Number(selectedSpecial.price) && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{selectedSpecial.original_price}
                      </span>
                    )}

                </div>

              </div>

              {/* PLATE SUMMARY */}
              <div className="mt-5">

                <h3 className="font-bold text-gray-900 mb-3">
                  📦 Plate Summary
                </h3>

                <div className="grid grid-cols-3 gap-2">

                  <div className="bg-gray-50 rounded-2xl p-4 text-center">

                    <p className="text-xs text-gray-500">
                      Maximum
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {selectedSpecial.max_plates ?? 0}
                    </p>

                  </div>

                  <div className="bg-orange-50 rounded-2xl p-4 text-center">

                    <p className="text-xs text-gray-500">
                      Pre-orders
                    </p>

                    <p className="text-xl font-bold text-orange-600 mt-1">
                      {selectedSpecial.pre_orders ?? 0}
                    </p>

                  </div>

                  <div className="bg-green-50 rounded-2xl p-4 text-center">

                    <p className="text-xs text-gray-500">
                      Remaining
                    </p>

                    <p className="text-xl font-bold text-green-600 mt-1">
                      {selectedSpecial.remaining ?? 0}
                    </p>

                  </div>

                </div>
              </div>

              {/* NUTRITION */}
              {(selectedSpecial.calories != null ||
                selectedSpecial.protein != null ||
                selectedSpecial.carbs != null ||
                selectedSpecial.fats != null) && (

                <div className="mt-6">

                  <div className="flex items-center gap-2 mb-3">

                    <Flame
                      size={18}
                      className="text-orange-500"
                    />

                    <h3 className="font-bold text-gray-900">
                      Nutrition
                    </h3>

                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                    {selectedSpecial.calories != null && (
                      <div className="bg-orange-50 rounded-2xl p-3 text-center">

                        <p className="font-bold text-orange-600">
                          {selectedSpecial.calories}
                        </p>

                        <p className="text-[10px] text-gray-500">
                          kcal
                        </p>

                      </div>
                    )}

                    {selectedSpecial.protein != null && (
                      <div className="bg-green-50 rounded-2xl p-3 text-center">

                        <p className="font-bold text-green-600">
                          {selectedSpecial.protein}g
                        </p>

                        <p className="text-[10px] text-gray-500">
                          Protein
                        </p>

                      </div>
                    )}

                    {selectedSpecial.carbs != null && (
                      <div className="bg-blue-50 rounded-2xl p-3 text-center">

                        <p className="font-bold text-blue-600">
                          {selectedSpecial.carbs}g
                        </p>

                        <p className="text-[10px] text-gray-500">
                          Carbs
                        </p>

                      </div>
                    )}

                    {selectedSpecial.fats != null && (
                      <div className="bg-purple-50 rounded-2xl p-3 text-center">

                        <p className="font-bold text-purple-600">
                          {selectedSpecial.fats}g
                        </p>

                        <p className="text-[10px] text-gray-500">
                          Fats
                        </p>

                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* PREPARATION TIME */}
              {selectedSpecial.preparation_time != null && (

                <div className="mt-5 bg-gray-50 rounded-2xl p-4 flex items-center gap-3">

                  <Timer
                    size={20}
                    className="text-orange-500"
                  />

                  <div>

                    <p className="text-xs text-gray-500">
                      Preparation Time
                    </p>

                    <p className="font-bold text-gray-900">
                      {selectedSpecial.preparation_time} minutes
                    </p>

                  </div>

                </div>

              )}

              {/* INGREDIENTS */}
              {selectedSpecial.ingredients && (

                <div className="mt-5">

                  <div className="flex items-center gap-2">

                    <Leaf
                      size={18}
                      className="text-green-600"
                    />

                    <h3 className="font-bold text-gray-900">
                      Ingredients
                    </h3>

                  </div>

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {selectedSpecial.ingredients}
                  </p>

                </div>

              )}

              {/* CREATED AT */}
              {selectedSpecial.created_at && (

                <div className="mt-6 border-t border-gray-100 pt-4">

                  <div className="flex items-center gap-2 text-xs text-gray-500">

                    <Clock3 size={15} />

                    <span>
                      Created:{" "}
                      {new Date(
                        selectedSpecial.created_at
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>

                  </div>

                </div>

              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}