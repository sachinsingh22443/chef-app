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
  total_days?: number;
  items: ExistingCycleItem[];
};

const TOTAL_DAYS = 30;
const TOTAL_MEAL_ASSIGNMENTS = TOTAL_DAYS * 3;

// =========================================================
// MEAL CONFIG
// =========================================================

const MEAL_CONFIG: Record<
  MealType,
  {
    label: string;
    cutoff: string;
  }
> = {
  breakfast: {
    label: "Breakfast",
    cutoff: "08:30 AM",
  },
  lunch: {
    label: "Lunch",
    cutoff: "11:00 AM",
  },
  dinner: {
    label: "Dinner",
    cutoff: "06:00 PM",
  },
};

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
    useState<
      Record<number, DayMenus>
    >({});

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

      console.log(
        "EXISTING CYCLES RESPONSE:",
        response.data
      );

      const data = response.data;

      if (Array.isArray(data?.cycles)) {
        setCycles(data.cycles);
      } else if (Array.isArray(data)) {
        setCycles(data);
      } else if (
        data &&
        Array.isArray(data.items)
      ) {
        setCycles([data]);
      } else {
        setCycles([]);
      }
    } catch (err: any) {
      console.error(
        "FETCH CYCLES ERROR:",
        err.response?.data || err
      );

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
    mealType: MealType,
    menuId: string
  ) => {
    setSelectedMenus((previous) => ({
      ...previous,

      [cycleDay]: {
        ...(previous[cycleDay] || {}),
        [mealType]: menuId,
      },
    }));

    setError("");
    setSuccess("");
  };

  // =======================================================
  // FILL ALL DAYS FOR ONE MEAL
  // =======================================================

  const handleFillAll = (
    mealType: MealType,
    menuId: string
  ) => {
    if (!menuId) {
      return;
    }

    setSelectedMenus((previous) => {
      const values = {
        ...previous,
      };

      for (
        let day = 1;
        day <= TOTAL_DAYS;
        day++
      ) {
        values[day] = {
          ...(values[day] || {}),
          [mealType]: menuId,
        };
      }

      return values;
    });

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
    Object.values(selectedMenus).reduce(
      (total, day) => {
        return (
          total +
          (day.breakfast ? 1 : 0) +
          (day.lunch ? 1 : 0) +
          (day.dinner ? 1 : 0)
        );
      },
      0
    );

  const isComplete =
    selectedCount ===
    TOTAL_MEAL_ASSIGNMENTS;

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
    // VALIDATE ALL 30 DAYS × 3 MEALS
    // -----------------------------------------------------

    const missingMeals: string[] = [];

    for (
      let day = 1;
      day <= TOTAL_DAYS;
      day++
    ) {
      const dayMenus =
        selectedMenus[day];

      if (!dayMenus?.breakfast) {
        missingMeals.push(
          `Day ${day} Breakfast`
        );
      }

      if (!dayMenus?.lunch) {
        missingMeals.push(
          `Day ${day} Lunch`
        );
      }

      if (!dayMenus?.dinner) {
        missingMeals.push(
          `Day ${day} Dinner`
        );
      }
    }

    if (missingMeals.length > 0) {
      setError(
        `Please select all meals. Missing: ${missingMeals.join(
          ", "
        )}`
      );

      return;
    }

    // -----------------------------------------------------
    // BUILD 90 ITEMS
    // -----------------------------------------------------

    const items: CycleItem[] = [];

    for (
      let day = 1;
      day <= TOTAL_DAYS;
      day++
    ) {
      const dayMenus =
        selectedMenus[day];

      items.push({
        cycle_day: day,
        meal_type: "breakfast",
        menu_id: dayMenus!.breakfast!,
      });

      items.push({
        cycle_day: day,
        meal_type: "lunch",
        menu_id: dayMenus!.lunch!,
      });

      items.push({
        cycle_day: day,
        meal_type: "dinner",
        menu_id: dayMenus!.dinner!,
      });
    }

    // -----------------------------------------------------
    // PAYLOAD
    // -----------------------------------------------------

    const payload = {
      cycle_start_date:
        cycleStartDate,

      items,
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
      DayMenus
    > = {};

    for (
      const item of cycle.items || []
    ) {
      if (!values[item.cycle_day]) {
        values[item.cycle_day] = {};
      }

      values[item.cycle_day][
        item.meal_type
      ] = item.menu_id;
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
  // RENDER MEAL SELECT
  // =======================================================

  const renderMealSelect = (
    day: number,
    mealType: MealType,
    dayMenus: DayMenus
  ) => {
    const config =
      MEAL_CONFIG[mealType];

    const selectedMenuId =
      dayMenus[mealType];

    const selectedMenu =
      menuItems.find(
        (menu) =>
          menu.id === selectedMenuId
      );

    return (
      <div className="bg-gray-50 rounded-2xl p-4">

        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-gray-800">
            {config.label}
          </label>

          <span className="text-xs text-orange-600 font-medium">
            Cutoff {config.cutoff}
          </span>
        </div>

        <select
          value={selectedMenuId || ""}
          onChange={(e) =>
            handleMenuChange(
              day,
              mealType,
              e.target.value
            )
          }
          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">
            Select {config.label}
          </option>

          {menuItems.map((menu) => (
            <option
              key={menu.id}
              value={menu.id}
            >
              {menu.name} — ₹
              {menu.price}
            </option>
          ))}
        </select>

        <p className="text-xs text-gray-500 mt-2">
          Customers can order this meal
          before {config.cutoff}.
        </p>

        {selectedMenu && (
          <div className="flex items-center gap-3 mt-3">

            {selectedMenu.image_urls?.[0] ? (
              <img
                src={
                  selectedMenu.image_urls[0]
                }
                alt={
                  selectedMenu.name
                }
                className="w-12 h-12 object-cover rounded-xl"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                🍛
              </div>
            )}

            <div>
              <p className="font-semibold text-sm">
                {selectedMenu.name}
              </p>

              <p className="text-xs text-gray-500">
                ₹{selectedMenu.price}
              </p>
            </div>

          </div>
        )}

      </div>
    );
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
              Plan breakfast, lunch and
              dinner for 30 days
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

              Cycle:{" "}

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

        {/* ERROR */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            {error}
          </div>
        )}

        {/* SUCCESS */}

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
              {TOTAL_DAYS}
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
              Meals Assigned
            </p>

          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md text-center">

            <p className="text-2xl font-bold text-orange-500">
              {TOTAL_MEAL_ASSIGNMENTS -
                selectedCount}
            </p>

            <p className="text-xs text-gray-500">
              Meals Remaining
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

              <div className="space-y-3">

                {/* BREAKFAST */}

                <div className="flex flex-col sm:flex-row gap-2">

                  <div className="sm:w-28 flex items-center font-semibold text-orange-600">
                    Breakfast
                  </div>

                  <select
                    defaultValue=""
                    onChange={(e) => {

                      if (e.target.value) {

                        handleFillAll(
                          "breakfast",
                          e.target.value
                        );

                        e.target.value = "";
                      }

                    }}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white"
                  >

                    <option value="">
                      Fill all Breakfast with...
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

                </div>

                {/* LUNCH */}

                <div className="flex flex-col sm:flex-row gap-2">

                  <div className="sm:w-28 flex items-center font-semibold text-orange-600">
                    Lunch
                  </div>

                  <select
                    defaultValue=""
                    onChange={(e) => {

                      if (e.target.value) {

                        handleFillAll(
                          "lunch",
                          e.target.value
                        );

                        e.target.value = "";
                      }

                    }}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white"
                  >

                    <option value="">
                      Fill all Lunch with...
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

                </div>

                {/* DINNER */}

                <div className="flex flex-col sm:flex-row gap-2">

                  <div className="sm:w-28 flex items-center font-semibold text-orange-600">
                    Dinner
                  </div>

                  <select
                    defaultValue=""
                    onChange={(e) => {

                      if (e.target.value) {

                        handleFillAll(
                          "dinner",
                          e.target.value
                        );

                        e.target.value = "";
                      }

                    }}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white"
                  >

                    <option value="">
                      Fill all Dinner with...
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

                </div>

                {/* CLEAR */}

                <button
                  type="button"
                  onClick={
                    handleClearAll
                  }
                  className="w-full py-3 bg-gray-100 rounded-xl font-medium"
                >
                  Clear All
                </button>

              </div>

            </div>
          )}

        {/* =================================================
            30-DAY MENU CYCLE
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

          <div className="space-y-4">

            {Array.from(
              {
                length:
                  TOTAL_DAYS,
              },
              (_, index) => {

                const day =
                  index + 1;

                const dayMenus =
                  selectedMenus[day] ||
                  {};

                const dayComplete =
                  !!dayMenus.breakfast &&
                  !!dayMenus.lunch &&
                  !!dayMenus.dinner;

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
                    className={`bg-white rounded-3xl p-5 shadow-md border ${
                      dayComplete
                        ? "border-green-200"
                        : "border-gray-100"
                    }`}
                  >

                    {/* DAY HEADER */}

                    <div className="flex items-center gap-3 mb-5">

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                          dayComplete
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >

                        {dayComplete ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          day
                        )}

                      </div>

                      <div>

                        <p className="font-bold text-lg">
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

                      <div className="ml-auto">

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            dayComplete
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {dayComplete
                            ? "Complete"
                            : "Pending"}
                        </span>

                      </div>

                    </div>

                    {/* THREE MEALS */}

                    <div className="space-y-4">

                      {renderMealSelect(
                        day,
                        "breakfast",
                        dayMenus
                      )}

                      {renderMealSelect(
                        day,
                        "lunch",
                        dayMenus
                      )}

                      {renderMealSelect(
                        day,
                        "dinner",
                        dayMenus
                      )}

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
                      TOTAL_MEAL_ASSIGNMENTS -
                      selectedCount
                    } More Meals`}

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
                            {cycle.items?.length || 0} meals configured
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