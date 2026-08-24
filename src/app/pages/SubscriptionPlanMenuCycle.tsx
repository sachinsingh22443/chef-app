import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";

const API_BASE = "https://chef-backend-qh12.onrender.com";

type MealType = "breakfast" | "lunch" | "dinner";

type Menu = {
  id: string;
  name: string;
  price?: number;
  category?: string;
  food_type?: string;
  is_available?: boolean;
  is_deleted?: boolean;
};

type Mapping = {
  day_number: number;
  meal_type: MealType;
  menu_id: string;
};

type Plan = {
  id: string;
  title: string;
  price: number;
  breakfast_available?: boolean;
  breakfast_price?: number | null;
  duration_days?: number;
};

const MEAL_TYPES: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
];

const DAYS = Array.from(
  { length: 30 },
  (_, index) => index + 1
);

export default function SubscriptionPlanMenuCycle() {
  const navigate = useNavigate();

  const { planId } = useParams<{
    planId: string;
  }>();

  const [plan, setPlan] = useState<Plan | null>(null);

  const [menus, setMenus] = useState<Menu[]>([]);

  const [mappings, setMappings] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // AUTH
  // =========================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================================================
  // MAPPING KEY
  // =========================================================

  const getMappingKey = (
    day: number,
    mealType: MealType
  ) => {
    return `${day}-${mealType}`;
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    if (!planId) {
      setError("Subscription plan ID is missing.");
      setLoading(false);
      return;
    }

    loadData();
  }, [planId]);

  const loadData = async () => {
    if (!planId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const headers = getAuthHeaders();

      // =====================================================
      // 1. LOAD SUBSCRIPTION PLANS
      // =====================================================

      const planResponse = await axios.get(
        `${API_BASE}/subscriptions/chef/plans`,
        {
          headers,
        }
      );

      const plans = Array.isArray(planResponse.data)
        ? planResponse.data
        : [];

      const currentPlan = plans.find(
        (item: Plan) =>
          String(item.id) === String(planId)
      );

      if (!currentPlan) {
        throw new Error(
          "Subscription plan not found."
        );
      }

      setPlan(currentPlan);

      // =====================================================
      // 2. LOAD EXISTING NORMAL MENUS
      // =====================================================

      const menuResponse = await axios.get(
        `${API_BASE}/menu/my`,
        {
          headers,
        }
      );

      const menuData = Array.isArray(menuResponse.data)
        ? menuResponse.data
        : Array.isArray(menuResponse.data?.menus)
        ? menuResponse.data.menus
        : [];

      const validMenus = menuData.filter(
        (menu: Menu) =>
          menu.is_deleted !== true
      );

      setMenus(validMenus);

      // =====================================================
      // 3. LOAD SAVED SUBSCRIPTION MENU CYCLE
      // =====================================================

      const mappingResponse = await axios.get(
        `${API_BASE}/subscriptions/chef/plans/${planId}/menu-cycle`,
        {
          headers,
        }
      );

      const savedMappings = Array.isArray(
        mappingResponse.data
      )
        ? mappingResponse.data
        : [];

      const mappingState: Record<
        string,
        string
      > = {};

      savedMappings.forEach(
        (item: Mapping) => {
          if (
            item.day_number >= 1 &&
            item.day_number <= 30 &&
            MEAL_TYPES.includes(item.meal_type)
          ) {
            mappingState[
              getMappingKey(
                item.day_number,
                item.meal_type
              )
            ] = item.menu_id;
          }
        }
      );

      setMappings(mappingState);
    } catch (err: any) {
      console.error(
        "Failed to load subscription menu cycle:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load subscription menu.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHANGE MENU
  // =========================================================

  const handleMenuChange = (
    day: number,
    mealType: MealType,
    menuId: string
  ) => {
    const key = getMappingKey(
      day,
      mealType
    );

    setMappings((previous) => ({
      ...previous,
      [key]: menuId,
    }));

    setSuccess("");
    setError("");
  };

  // =========================================================
  // CLEAR MENU
  // =========================================================

  const handleClearMeal = (
    day: number,
    mealType: MealType
  ) => {
    const key = getMappingKey(
      day,
      mealType
    );

    setMappings((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[key];

      return updated;
    });

    setSuccess("");
    setError("");
  };

  // =========================================================
  // VALIDATION
  //
  // Lunch + Dinner REQUIRED
  // Breakfast OPTIONAL
  // =========================================================

  const validation = useMemo(() => {
    const missingLunch: number[] = [];
    const missingDinner: number[] = [];

    DAYS.forEach((day) => {
      const lunch =
        mappings[
          getMappingKey(day, "lunch")
        ];

      const dinner =
        mappings[
          getMappingKey(day, "dinner")
        ];

      if (!lunch) {
        missingLunch.push(day);
      }

      if (!dinner) {
        missingDinner.push(day);
      }
    });

    return {
      missingLunch,
      missingDinner,
      isValid:
        missingLunch.length === 0 &&
        missingDinner.length === 0,
    };
  }, [mappings]);

  // =========================================================
  // SELECTED COUNT
  //
  // Breakfast optional.
  // Completion is based on required 60 meals.
  // =========================================================

  const selectedCount = useMemo(() => {
    return Object.values(mappings).filter(
      Boolean
    ).length;
  }, [mappings]);

  const requiredMealCount = 60;

  const requiredSelectedCount = useMemo(() => {
    let count = 0;

    DAYS.forEach((day) => {
      if (
        mappings[
          getMappingKey(day, "lunch")
        ]
      ) {
        count++;
      }

      if (
        mappings[
          getMappingKey(day, "dinner")
        ]
      ) {
        count++;
      }
    });

    return count;
  }, [mappings]);

  const completionPercentage = Math.round(
    (requiredSelectedCount /
      requiredMealCount) *
      100
  );

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!planId) {
      setError(
        "Subscription plan ID is missing."
      );
      return;
    }

    // -------------------------------------------------------
    // VALIDATE REQUIRED MEALS
    // -------------------------------------------------------

    if (!validation.isValid) {
      const messages: string[] = [];

      if (
        validation.missingLunch.length > 0
      ) {
        messages.push(
          `Lunch missing on Day ${validation.missingLunch.join(
            ", "
          )}`
        );
      }

      if (
        validation.missingDinner.length > 0
      ) {
        messages.push(
          `Dinner missing on Day ${validation.missingDinner.join(
            ", "
          )}`
        );
      }

      setError(messages.join(" • "));
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const headers = getAuthHeaders();

      // =====================================================
      // CREATE PAYLOAD
      //
      // Lunch + Dinner always included.
      // Breakfast included only if selected.
      // =====================================================

      const items: Mapping[] = [];

      DAYS.forEach((day) => {
        MEAL_TYPES.forEach(
          (mealType) => {
            const key = getMappingKey(
              day,
              mealType
            );

            const menuId = mappings[key];

            if (menuId) {
              items.push({
                day_number: day,
                meal_type: mealType,
                menu_id: menuId,
              });
            }
          }
        );
      });

      // =====================================================
      // SAVE
      // =====================================================

      await axios.put(
        `${API_BASE}/subscriptions/chef/plans/${planId}/menu-cycle`,
        {
          items,
        },
        {
          headers,
        }
      );

      setSuccess(
        "30-day subscription menu saved successfully."
      );

      // Reload saved state
      await loadData();
    } catch (err: any) {
      console.error(
        "Failed to save subscription menu cycle:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to save 30-day menu.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <RefreshCw className="w-7 h-7 mx-auto animate-spin text-purple-600" />

          <p className="mt-4 text-gray-600">
            Loading 30-day menu...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PLAN NOT FOUND
  // =========================================================

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow text-center">
          <p className="text-red-600 font-semibold">
            {error ||
              "Subscription plan not found."}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-b-[40px] p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-5"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-white">
          30-Day Menu
        </h1>

        <p className="text-purple-100 mt-1">
          {plan.title}
        </p>

        <div className="mt-5 bg-white/20 rounded-2xl p-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm">
              Required Menu Setup
            </span>

            <span className="font-bold">
              {requiredSelectedCount}/60
            </span>
          </div>

          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{
                width: `${Math.min(
                  completionPercentage,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="text-xs text-purple-100 mt-2">
            {Math.min(
              completionPercentage,
              100
            )}
            % completed
          </p>
        </div>
      </div>

      {/* =====================================================
          INFO
      ===================================================== */}

      <div className="p-5">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm text-blue-800 font-semibold">
            Existing Menu Only
          </p>

          <p className="text-xs text-blue-600 mt-1">
            Lunch and Dinner are required for all
            30 days. Breakfast is optional and can
            be added for any day. No new menu will
            be created.
          </p>
        </div>
      </div>

      {/* =====================================================
          BREAKFAST INFO
      ===================================================== */}

      {plan.breakfast_available && (
        <div className="mx-5 mb-4 bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-sm text-orange-800 font-semibold">
            🍳 Breakfast Add-on
          </p>

          <p className="text-xs text-orange-600 mt-1">
            Breakfast is optional.
            {plan.breakfast_price != null &&
              ` Price: ₹${plan.breakfast_price}/day.`}
          </p>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mx-5 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-700 font-medium">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm text-green-700 font-medium">
            {success}
          </p>
        </div>
      )}

      {/* =====================================================
          DAYS
      ===================================================== */}

      <div className="px-5 space-y-4">
        {DAYS.map((day) => {
          const lunchSelected =
            Boolean(
              mappings[
                getMappingKey(
                  day,
                  "lunch"
                )
              ]
            );

          const dinnerSelected =
            Boolean(
              mappings[
                getMappingKey(
                  day,
                  "dinner"
                )
              ]
            );

          const breakfastSelected =
            Boolean(
              mappings[
                getMappingKey(
                  day,
                  "breakfast"
                )
              ]
            );

          const daySelectedCount =
            Number(
              breakfastSelected
            ) +
            Number(lunchSelected) +
            Number(dinnerSelected);

          return (
            <div
              key={day}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* DAY HEADER */}

              <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Subscription Cycle
                    </p>

                    <h2 className="text-xl font-bold text-gray-800">
                      Day {day}
                    </h2>
                  </div>

                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {daySelectedCount}/3
                  </div>
                </div>
              </div>

              {/* MEALS */}

              <div className="p-5 space-y-4">
                {MEAL_TYPES.map(
                  (mealType) => {
                    const key =
                      getMappingKey(
                        day,
                        mealType
                      );

                    const selectedMenuId =
                      mappings[key];

                    const isBreakfast =
                      mealType ===
                      "breakfast";

                    return (
                      <div
                        key={mealType}
                        className="space-y-2"
                      >
                        <label className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 capitalize">
                            {mealType ===
                              "breakfast" &&
                              "🍳 "}

                            {mealType ===
                              "lunch" &&
                              "🍛 "}

                            {mealType ===
                              "dinner" &&
                              "🍽️ "}

                            {mealType}

                            {isBreakfast && (
                              <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                Optional
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            {selectedMenuId && (
                              <span className="text-xs text-green-600 font-semibold">
                                Selected
                              </span>
                            )}

                            {selectedMenuId && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleClearMeal(
                                    day,
                                    mealType
                                  )
                                }
                                className="text-xs text-red-500 font-semibold"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </label>

                        <select
                          value={
                            selectedMenuId ||
                            ""
                          }
                          onChange={(event) =>
                            handleMenuChange(
                              day,
                              mealType,
                              event.target.value
                            )
                          }
                          className="
                            w-full
                            border
                            border-gray-200
                            rounded-xl
                            px-4
                            py-3
                            bg-white
                            text-gray-800
                            outline-none
                            focus:ring-2
                            focus:ring-purple-300
                          "
                        >
                          <option value="">
                            {isBreakfast
                              ? "Skip breakfast"
                              : `Select existing ${mealType} menu`}
                          </option>

                          {menus.map(
                            (menu) => (
                              <option
                                key={menu.id}
                                value={menu.id}
                              >
                                {menu.name}
                                {menu.price !=
                                null
                                  ? ` • ₹${menu.price}`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          SAVE BUTTON
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
        <div className="max-w-[600px] mx-auto">
          <button
            onClick={handleSave}
            disabled={
              saving ||
              !validation.isValid
            }
            className={`
              w-full
              py-4
              rounded-2xl
              font-bold
              flex
              items-center
              justify-center
              gap-2
              transition
              ${
                saving ||
                !validation.isValid
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }
            `}
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save 30-Day Menu
              </>
            )}
          </button>

          {!validation.isValid && (
            <p className="text-center text-xs text-gray-500 mt-2">
              Lunch and dinner must be selected
              for all 30 days.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}