import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, Plus } from "lucide-react";

export default function SubscriptionPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH SUBSCRIPTION PLANS
  // =========================================================

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Authentication token not found.");
        return;
      }

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/subscriptions/chef/plans",
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

  // =========================================================
  // DELETE PLAN
  // =========================================================

  const deletePlan = async (id: string) => {
    if (!id) {
      console.error("Plan ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription plan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Authentication token not found.");
        return;
      }

      await axios.delete(
        `https://chef-backend-qh12.onrender.com/subscriptions/chef/plans/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh list after successful deletion
      await fetchPlans();
    } catch (err) {
      console.error("Failed to delete subscription plan:", err);

      alert(
        "Unable to delete this subscription plan. Please try again."
      );
    }
  };

  // =========================================================
  // OPEN 30-DAY MENU MAPPING
  // =========================================================

  const handleOpenMenuCycle = (planId: string) => {
    if (!planId) {
      console.error("Subscription plan ID is missing.");
      return;
    }

    navigate(
      `/app/subscription-plans/menu-cycle/${planId}`
    );
  };

  // =========================================================
  // OPEN EDIT PLAN
  // =========================================================

  const handleEditPlan = (planId: string) => {
    if (!planId) {
      console.error("Subscription plan ID is missing.");
      return;
    }

    navigate(
      `/app/subscription-plans/edit/${planId}`
    );
  };

  // =========================================================
  // CREATE NEW PLAN
  // =========================================================

  const handleCreatePlan = () => {
    navigate("/app/subscription-plans/create");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-b-[40px] p-6 pb-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />

          Back
        </button>

        <h1 className="text-3xl font-bold text-white">
          Subscription Plans
        </h1>

        <p className="text-purple-100 text-sm mt-2">
          Manage your 30-day subscription plans
        </p>

      </div>

      {/* =====================================================
          PLAN LIST
      ===================================================== */}

      <div className="p-6 space-y-4">

        {/* LOADING */}

        {loading && (
          <div className="bg-white p-10 rounded-3xl text-center shadow-sm">

            <p className="text-gray-500">
              Loading subscription plans...
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!loading && plans.length === 0 && (
          <div className="bg-white p-10 rounded-3xl text-center shadow-sm">

            <div className="text-4xl mb-3">
              🥗
            </div>

            <h3 className="font-bold text-lg text-gray-800">
              No plans found
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Create your first subscription plan.
            </p>

            <button
              onClick={handleCreatePlan}
              className="mt-5 bg-purple-600 text-white px-5 py-3 rounded-xl font-semibold"
            >
              Create Plan
            </button>

          </div>
        )}

        {/* ===================================================
            PLANS
        =================================================== */}

        {!loading &&
          plans.map((plan) => (

            <div
              key={plan.id}
              className="bg-white rounded-3xl p-5 shadow-lg"
            >

              {/* =================================================
                  PLAN HEADER
              ================================================= */}

              <div className="flex justify-between items-start gap-3">

                {/* LEFT */}

                <div className="min-w-0">

                  <h3 className="font-bold text-lg text-gray-800">
                    {plan.emoji} {plan.title}
                  </h3>

                  {plan.tagline && (
                    <p className="text-sm text-gray-500 mt-1">
                      {plan.tagline}
                    </p>
                  )}

                  {/* TAGS */}

                  <div className="flex flex-wrap gap-2 mt-3">

                    {plan.goal && (
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                        {plan.goal}
                      </span>
                    )}

                    {plan.diet_type && (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        {plan.diet_type}
                      </span>
                    )}

                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">

                      {plan.plan_type === "normal" &&
                        "🥗 Normal"}

                      {plan.plan_type === "dietician" &&
                        "👨‍⚕️ Dietician"}

                      {plan.plan_type === "gym" &&
                        "💪 Gym + Trainer"}

                    </span>

                  </div>

                </div>

                {/* RIGHT */}

                <div className="text-right shrink-0">

                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">

                    ₹{plan.price}

                  </span>

                  <p className="text-xs text-gray-500 mt-2">
                    30 days
                  </p>

                  {/* BREAKFAST PRICE */}

                  {plan.breakfast_price != null && (
                    <p className="text-xs text-orange-600 font-semibold mt-1">

                      🍳 Breakfast ₹
                      {plan.breakfast_price}
                      /day

                    </p>
                  )}

                </div>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {plan.description && (
                <p className="mt-3 text-gray-600 text-sm line-clamp-3">

                  {plan.description}

                </p>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="grid grid-cols-3 gap-2 mt-5">

                {/* EDIT */}

                <button
                  onClick={() =>
                    handleEditPlan(plan.id)
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  Edit
                </button>

                {/* 30-DAY MENU */}

                <button
                  onClick={() =>
                    handleOpenMenuCycle(plan.id)
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  30-Day Menu
                </button>

                {/* DELETE */}

                <button
                  onClick={() =>
                    deletePlan(plan.id)
                  }
                  className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

      </div>

      {/* =======================================================
          ADD PLAN BUTTON
      ======================================================= */}

      <button
        onClick={handleCreatePlan}
        className="
          fixed
          bottom-24
          right-6
          bg-gradient-to-r
          from-purple-500
          to-pink-500
          text-white
          rounded-full
          px-5
          py-4
          shadow-2xl
          flex
          items-center
          gap-2
          hover:scale-105
          transition
        "
      >

        <Plus size={20} />

        <span className="font-semibold">
          Add Plan
        </span>

      </button>

    </div>
  );
}