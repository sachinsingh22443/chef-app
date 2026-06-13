import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, Plus } from "lucide-react";

export default function SubscriptionPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/subscriptions/chef/plans",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPlans(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!window.confirm("Delete this plan?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `https://chef-backend-qh12.onrender.com/subscriptions/chef/plans/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPlans();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

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
      </div>

      <div className="p-6 space-y-4">

        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="bg-white p-10 rounded-3xl text-center">
            No plans found
          </div>
        )}

        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl p-5 shadow-lg"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {plan.emoji} {plan.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {plan.tagline}
                </p>
              </div>

              <span className="font-bold text-purple-600">
                ₹{plan.price}
              </span>
            </div>

            <p className="mt-3">
              {plan.description}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  navigate(
                    `/app/subscription-plans/edit/${plan.id}`
                  )
                }
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl"
              >
                Edit
              </button>

              <button
                onClick={() => deletePlan(plan.id)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
  onClick={() =>
    navigate("/app/subscription-plans/create")
  }
  className="
    fixed bottom-24 right-6
    bg-gradient-to-r
    from-purple-500
    to-pink-500
    text-white
    rounded-full
    px-5 py-4
    shadow-2xl
    flex items-center gap-2
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