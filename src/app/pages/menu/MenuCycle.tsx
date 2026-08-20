import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Save,
  RefreshCw,
} from "lucide-react";

const API = axios.create({
  baseURL: "https://chef-backend-qh12.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================================================
// TYPES
// =========================================================

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

type CycleItem = {
  cycle_day: number;
  menu_id: string;
};

type ExistingCycleItem = {
  id?: string;
  chef_id?: string;
  menu_id: string;
  cycle_day: number;
  cycle_start_date?: string;
};

type ExistingCycle = {
  cycle_start_date: string;
  total_days?: number;
  items: ExistingCycleItem[];
};

const TOTAL_DAYS = 30;

// =========================================================
// DATE HELPERS
// =========================================================

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  days: number
) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  date.setDate(
    date.getDate() + days
  );

  return formatDate(date);
}

function formatDisplayDate(
  dateString: string
) {
  if (!dateString) return "";

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// =========================================================
// COMPONENT
// =========================================================

export default function MenuCycle() {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>([]);

  const [cycles, setCycles] =
    useState<ExistingCycle[]>([]);

  const [cycleStartDate, setCycleStartDate] =
    useState<string>(
      formatDate(new Date())
    );

  const [selectedMenus, setSelectedMenus] =
    useState<Record<number, string>>({});

  const [loadingMenus, setLoadingMenus] =
    useState(true);

  const [loadingCycles, setLoadingCycles] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =======================================================
  // FETCH MENUS
  // =======================================================

  const fetchMenus = async () => {
    try {
      setLoadingMenus(true);
      setError("");

      const response =
        await API.get("/menu/my");

      const menus = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      const activeMenus =
        menus.filter(
          (menu: MenuItem) =>
            !menu.is_deleted
        );

      setMenuItems(activeMenus);
    } catch (err: any) {
      console.error(
        "FETCH MENUS ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load your menus."
      );
    } finally {
      setLoadingMenus(false);
    }
  };

  // =======================================================
  // FETCH EXISTING CYCLES
  // =======================================================

  const fetchCycles = async () => {
    try {
      setLoadingCycles(true);

      const response =
        await API.get("/menu-cycle/");

      /*
       * Backend can return:
       *
       * [
       *   {
       *     cycle_start_date,
       *     total_days,
       *     items
       *   }
       * ]
       *
       * OR a single cycle object.
       */

      if (
        response.data &&
        !Array.isArray(response.data) &&
        Array.isArray(
          response.data.items
        )
      ) {
        setCycles([
          response.data,
        ]);
      } else if (
        Array.isArray(response.data)
      ) {
        setCycles(response.data);
      } else {
        setCycles([]);
      }
    } catch (err: any) {
      console.error(
        "FETCH CYCLES ERROR:",
        err
      );

      /*
       * Existing cycles are not required
       * to create a new cycle.
       */
      setCycles([]);
    } finally {
      setLoadingCycles(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchMenus();
    fetchCycles();
  }, []);

  // =======================================================
  // CYCLE END DATE
  // =======================================================

  const cycleEndDate = useMemo(() => {
    if (!cycleStartDate) {
      return "";
    }

    return addDays(
      cycleStartDate,
      TOTAL_DAYS - 1
    );
  }, [cycleStartDate]);

  // =======================================================
  // SELECT MENU
  // =======================================================

  const handleMenuChange = (
    cycleDay: number,
    menuId: string
  ) => {
    setSelectedMenus((previous) => ({
      ...previous,
      [cycleDay]: menuId,
    }));

    setError("");
    setSuccess("");
  };

  // =======================================================
  // FILL ALL DAYS
  // =======================================================

  const handleFillAll = (
    menuId: string
  ) => {
    if (!menuId) {
      return;
    }

    const values: Record<
      number,
      string
    > = {};

    for (
      let day = 1;
      day <= TOTAL_DAYS;
      day++
    ) {
      values[day] = menuId;
    }

    setSelectedMenus(values);

    setError("");
    setSuccess("");
  };

  // =======================================================
  // CLEAR ALL
  // =======================================================

  const handleClearAll = () => {
    setSelectedMenus({});
    setError("");
    setSuccess("");
  };

  // =======================================================
  // SELECTED COUNT
  // =======================================================

  const selectedCount =
    Object.keys(
      selectedMenus
    ).filter(
      (day) =>
        Boolean(
          selectedMenus[
            Number(day)
          ]
        )
    ).length;

  const isComplete =
    selectedCount === TOTAL_DAYS;

  // =======================================================
  // SAVE 30 DAY CYCLE
  // =======================================================

  const handleSaveCycle = async () => {
    setError("");
    setSuccess("");

    // -----------------------------------------------------
    // DATE
    // -----------------------------------------------------

    if (!cycleStartDate) {
      setError(
        "Please select a cycle start date."
      );

      return;
    }

    // -----------------------------------------------------
    // VALIDATE ALL DAYS
    // -----------------------------------------------------

    const missingDays: number[] = [];

    for (
      let day = 1;
      day <= TOTAL_DAYS;
      day++
    ) {
      if (!selectedMenus[day]) {
        missingDays.push(day);
      }
    }

    if (missingDays.length > 0) {
      setError(
        `Please select menus for all 30 days. Missing: Day ${missingDays.join(
          ", Day "
        )}`
      );

      return;
    }

    // -----------------------------------------------------
    // BUILD ITEMS
    // -----------------------------------------------------

    const items: CycleItem[] = [];

    for (
      let day = 1;
      day <= TOTAL_DAYS;
      day++
    ) {
      items.push({
        cycle_day: day,
        menu_id:
          selectedMenus[day],
      });
    }

    // =====================================================
    // IMPORTANT
    // BACKEND SCHEMA:
    //
    // class MenuCycleBulkCreate:
    //     cycle_start_date: date
    //     items: list[MenuCycleItemCreate]
    //
    // =====================================================

    const payload = {
      cycle_start_date:
        cycleStartDate,

      items: items,
    };

    console.log(
      "MENU CYCLE PAYLOAD:",
      payload
    );

    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

    try {
      setSaving(true);

      const response =
        await API.post(
          "/menu-cycle/",
          payload
        );

      console.log(
        "CYCLE CREATED:",
        response.data
      );

      setSuccess(
        "30-day menu cycle created successfully."
      );

      await fetchCycles();

    } catch (err: any) {
      console.error(
        "CREATE CYCLE ERROR:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (
        Array.isArray(detail)
      ) {
        setError(
          detail
            .map(
              (item: any) =>
                item.msg ||
                "Validation error"
            )
            .join(", ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to create menu cycle."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // LOAD EXISTING CYCLE
  // =======================================================

  const handleLoadCycle = (
    cycle: ExistingCycle
  ) => {
    setCycleStartDate(
      cycle.cycle_start_date
    );

    const values: Record<
      number,
      string
    > = {};

    for (
      const item of
      cycle.items || []
    ) {
      values[item.cycle_day] =
        item.menu_id;
    }

    setSelectedMenus(values);

    setError("");

    setSuccess(
      "Existing cycle loaded."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    await Promise.all([
      fetchMenus(),
      fetchCycles(),
    ]);
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-8">

        <div className="flex items-center gap-3 mb-6">

          <button
            type="button"
            onClick={() =>
              navigate("/menu")
            }
            className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-orange-500" />
          </button>

          <div className="flex-1">

            <h1 className="text-3xl font-bold text-white">
              Menu Cycle
            </h1>

            <p className="text-white/90 text-sm mt-1">
              Plan your meals for 30 days
            </p>

          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <RefreshCw className="w-5 h-5 text-orange-500" />
          </button>

        </div>

        {/* =================================================
            START DATE
        ================================================= */}

        <div className="bg-white rounded-3xl p-5 shadow-lg">

          <div className="flex items-center gap-2 mb-3">

            <CalendarDays className="w-5 h-5 text-orange-500" />

            <label className="font-semibold text-gray-800">
              Cycle Start Date
            </label>

          </div>

          <input
            type="date"
            value={cycleStartDate}
            onChange={(e) => {
              setCycleStartDate(
                e.target.value
              );

              setError("");
              setSuccess("");
            }}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
          />

          {cycleEndDate && (
            <p className="text-sm text-gray-500 mt-3">
              Cycle:
              {" "}
              <span className="font-semibold text-gray-700">
                {formatDisplayDate(
                  cycleStartDate
                )}
              </span>
              {" → "}
              <span className="font-semibold text-gray-700">
                {formatDisplayDate(
                  cycleEndDate
                )}
              </span>
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="px-6 py-6 max-w-4xl mx-auto">

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 flex items-center gap-2">

            <Check className="w-5 h-5 shrink-0" />

            <span>
              {success}
            </span>

          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-3 gap-3 mb-6">

          <div className="bg-white rounded-2xl p-4 shadow-md text-center">

            <p className="text-2xl font-bold">
              30
            </p>

            <p className="text-xs text-gray-500">
              Total Days
            </p>

          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md text-center">

            <p className="text-2xl font-bold text-green-600">
              {selectedCount}
            </p>

            <p className="text-xs text-gray-500">
              Assigned
            </p>

          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md text-center">

            <p className="text-2xl font-bold text-orange-500">
              {TOTAL_DAYS -
                selectedCount}
            </p>

            <p className="text-xs text-gray-500">
              Remaining
            </p>

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        {!loadingMenus &&
          menuItems.length > 0 && (

            <div className="bg-white rounded-3xl p-5 shadow-lg mb-6">

              <h2 className="font-bold text-lg mb-4">
                Quick Actions
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">

                <select
                  defaultValue=""
                  onChange={(e) => {

                    if (
                      e.target.value
                    ) {

                      handleFillAll(
                        e.target.value
                      );

                      e.target.value =
                        "";
                    }

                  }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white"
                >

                  <option value="">
                    Fill all 30 days with...
                  </option>

                  {menuItems.map(
                    (menu) => (
                      <option
                        key={menu.id}
                        value={menu.id}
                      >
                        {menu.name} — ₹
                        {menu.price}
                      </option>
                    )
                  )}

                </select>

                <button
                  type="button"
                  onClick={
                    handleClearAll
                  }
                  className="px-5 py-3 bg-gray-100 rounded-xl font-medium"
                >
                  Clear All
                </button>

              </div>

            </div>
          )}


        


        {/* =================================================
    30-DAY MENU CYCLE
================================================= */}

<div className="bg-white rounded-3xl p-5 shadow-lg mb-6">

  <div className="flex items-center justify-between gap-3">

    <div>
      <h2 className="font-bold text-lg">
        30-Day Menu Cycle
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Plan which menu will be served each day
      </p>
    </div>

    <button
      type="button"
      onClick={() => navigate("/menu/cycle")}
      className="px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-sm active:scale-95"
    >
      Manage Cycle
    </button>

  </div>

</div>

        {/* =================================================
            MENUS
        ================================================= */}

        {loadingMenus ? (

          <div className="bg-white rounded-3xl p-8 shadow-lg text-center">

            <p className="text-gray-500">
              Loading your menus...
            </p>

          </div>

        ) : menuItems.length === 0 ? (

          <div className="bg-white rounded-3xl p-8 shadow-lg text-center">

            <div className="text-5xl mb-4">
              🍽️
            </div>

            <h2 className="text-xl font-bold mb-2">
              No menus found
            </h2>

            <p className="text-gray-500 mb-5">
              Create at least one menu item
              before creating a cycle.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/menu/add")
              }
              className="px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold"
            >
              Create Menu
            </button>

          </div>

        ) : (

          <div className="space-y-3">

            {Array.from(
              {
                length:
                  TOTAL_DAYS,
              },
              (_, index) => {

                const day =
                  index + 1;

                const selectedMenuId =
                  selectedMenus[day];

                const selectedMenu =
                  menuItems.find(
                    (menu) =>
                      menu.id ===
                      selectedMenuId
                  );

                const targetDate =
                  cycleStartDate
                    ? addDays(
                        cycleStartDate,
                        index
                      )
                    : "";

                return (
                  <div
                    key={day}
                    className={`bg-white rounded-3xl p-4 shadow-md border ${
                      selectedMenu
                        ? "border-green-200"
                        : "border-gray-100"
                    }`}
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                      {/* DAY */}

                      <div className="flex items-center gap-3 sm:w-48">

                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                            selectedMenu
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >

                          {selectedMenu ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            day
                          )}

                        </div>

                        <div>

                          <p className="font-bold">
                            Day {day}
                          </p>

                          {targetDate && (
                            <p className="text-xs text-gray-500">
                              {formatDisplayDate(
                                targetDate
                              )}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* MENU SELECT */}

                      <div className="flex-1">

                        <select
                          value={
                            selectedMenuId ||
                            ""
                          }
                          onChange={(e) =>
                            handleMenuChange(
                              day,
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-orange-300"
                        >

                          <option value="">
                            Select menu for Day{" "}
                            {day}
                          </option>

                          {menuItems.map(
                            (menu) => (
                              <option
                                key={menu.id}
                                value={menu.id}
                              >
                                {menu.name} — ₹
                                {menu.price}
                              </option>
                            )
                          )}

                        </select>

                        {/* SELECTED MENU */}

                        {selectedMenu && (

                          <div className="flex items-center gap-3 mt-3">

                            {selectedMenu
                              .image_urls?.[0] ? (

                              <img
                                src={
                                  selectedMenu
                                    .image_urls[0]
                                }
                                alt={
                                  selectedMenu.name
                                }
                                className="w-12 h-12 object-cover rounded-xl"
                              />

                            ) : (

                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                🍛
                              </div>

                            )}

                            <div>

                              <p className="font-semibold text-sm">
                                {
                                  selectedMenu.name
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                ₹
                                {
                                  selectedMenu.price
                                }
                              </p>

                            </div>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        {!loadingMenus &&
          menuItems.length > 0 && (

            <div className="mt-6">

              <button
                type="button"
                onClick={
                  handleSaveCycle
                }
                disabled={
                  saving ||
                  loadingMenus ||
                  !isComplete
                }
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg ${
                  saving ||
                  loadingMenus ||
                  !isComplete
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white active:scale-[0.99]"
                }`}
              >

                <Save className="w-5 h-5" />

                {saving
                  ? "Saving Cycle..."
                  : isComplete
                  ? "Save 30 Day Cycle"
                  : `Select ${
                      TOTAL_DAYS -
                      selectedCount
                    } More Days`}

              </button>

            </div>
          )}

        {/* =================================================
            EXISTING CYCLES
        ================================================= */}

        <div className="mt-8">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-xl font-bold">
              Existing Cycles
            </h2>

            <button
              type="button"
              onClick={
                fetchCycles
              }
              className="text-sm text-orange-500 font-semibold"
            >
              Refresh
            </button>

          </div>

          {loadingCycles ? (

            <div className="bg-white rounded-3xl p-6 shadow-md">

              <p className="text-gray-500">
                Loading cycles...
              </p>

            </div>

          ) : cycles.length === 0 ? (

            <div className="bg-white rounded-3xl p-6 shadow-md">

              <p className="text-gray-500">
                No menu cycles created yet.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {cycles.map(
                (
                  cycle,
                  index
                ) => {

                  const endDate =
                    addDays(
                      cycle.cycle_start_date,
                      TOTAL_DAYS - 1
                    );

                  return (

                    <div
                      key={`${cycle.cycle_start_date}-${index}`}
                      className="bg-white rounded-3xl p-5 shadow-md"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                          <p className="font-bold">
                            {formatDisplayDate(
                              cycle.cycle_start_date
                            )}
                          </p>

                          <p className="text-sm text-gray-500">
                            Ends{" "}
                            {formatDisplayDate(
                              endDate
                            )}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {
                              cycle.items?.length ||
                              0
                            }{" "}
                            days configured
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleLoadCycle(
                              cycle
                            )
                          }
                          className="px-4 py-2 bg-orange-100 text-orange-600 rounded-xl font-semibold"
                        >
                          Load Cycle
                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}