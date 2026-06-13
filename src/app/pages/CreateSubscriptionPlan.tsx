import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function CreateSubscriptionPlan() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
  title: "",
  price: "",
  tagline: "",
  description: "",
  plan_type: "normal",

  emoji: "🍱",
  color: "#8b5cf6",

  goal: "Weight Loss",
  diet_type: "Veg",

  calories_per_day: "",
  duration_days: "30",

  meal_type: [] as string[],

  features: "",
  includes: "",
});

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "https://chef-backend-qh12.onrender.com/subscriptions/chef/plans",
        {
  title: form.title,
  price: Number(form.price),
  plan_type: form.plan_type,

  goal: form.goal,
  diet_type: form.diet_type,

  calories_per_day: Number(form.calories_per_day),
  duration_days: Number(form.duration_days),

  description: form.description,
  tagline: form.tagline,

  emoji: form.emoji,
  color: form.color,

  meal_type: form.meal_type,

  features: form.features
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean),

  includes: form.includes
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean),
},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Plan Created Successfully");

      navigate("/app/subscription-plans");

    } catch (err) {
      console.log(err);
      alert("Failed to create plan");
    } finally {
      setLoading(false);
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

        <div>
  <h1 className="text-3xl font-bold text-white">
    Create Diet Plan
  </h1>

  <p className="text-white/80 mt-2">
    Build a premium nutrition subscription
  </p>
</div>
      </div>

      <div className="p-6 space-y-4">

        <div className="bg-white rounded-3xl p-5 shadow-lg space-y-4">

  <input
    placeholder="Plan Name"
    className="w-full p-4 rounded-2xl border"
    value={form.title}
    onChange={(e) =>
      setForm({ ...form, title: e.target.value })
    }
  />

  <input
    placeholder="Tagline"
    className="w-full p-4 rounded-2xl border"
    value={form.tagline}
    onChange={(e) =>
      setForm({ ...form, tagline: e.target.value })
    }
  />

  <input
    placeholder="Price"
    type="number"
    className="w-full p-4 rounded-2xl border"
    value={form.price}
    onChange={(e) =>
      setForm({ ...form, price: e.target.value })
    }
  />

  <div className="bg-white rounded-3xl p-5 shadow-lg">
  <h3 className="font-bold mb-4">
    Subscription Type
  </h3>

  <select
    className="w-full p-4 rounded-2xl border"
    value={form.plan_type}
    onChange={(e) =>
      setForm({
        ...form,
        plan_type: e.target.value,
      })
    }
  >
    <option value="normal">
      🥗 Normal Diet
    </option>

    <option value="dietician">
      👨‍⚕️ Dietician Support
    </option>

    <option value="gym">
      💪 Gym + Diet + Trainer
    </option>
  </select>
</div>

</div>

<div className="bg-white rounded-3xl p-5 shadow-lg">

  <h3 className="font-bold mb-4">
    Goal
  </h3>

  <select
    className="w-full p-4 rounded-2xl border"
    value={form.goal}
    onChange={(e) =>
      setForm({
        ...form,
        goal: e.target.value,
      })
    }
  >
    <option>Weight Loss</option>
    <option>Weight Gain</option>
    <option>Muscle Building</option>
    <option>Healthy Lifestyle</option>
    <option>Diabetic Care</option>
  </select>

</div>

<div className="bg-white rounded-3xl p-5 shadow-lg">

  <h3 className="font-bold mb-4">
    Diet Type
  </h3>

  <select
    className="w-full p-4 rounded-2xl border"
    value={form.diet_type}
    onChange={(e) =>
      setForm({
        ...form,
        diet_type: e.target.value,
      })
    }
  >
    <option>Veg</option>
    <option>Non Veg</option>
    <option>Vegan</option>
    <option>Keto</option>
    <option>High Protein</option>
  </select>

</div>

<div className="grid grid-cols-2 gap-4">

  <input
    type="number"
    placeholder="Calories"
    className="p-4 rounded-2xl border bg-white"
    value={form.calories_per_day}
    onChange={(e) =>
      setForm({
        ...form,
        calories_per_day: e.target.value,
      })
    }
  />

  <select
  className="p-4 rounded-2xl border bg-white"
  value={form.duration_days}
  onChange={(e) =>
    setForm({
      ...form,
      duration_days: e.target.value,
    })
  }
>
  <option value="7">7 Days</option>
  <option value="15">15 Days</option>
  <option value="30">30 Days</option>
</select>

</div>

<div className="bg-white rounded-3xl p-5 shadow-lg">

  <h3 className="font-bold mb-4">
    Meals Included
  </h3>

  <div className="grid grid-cols-2 gap-3">
  {["Breakfast", "Lunch", "Dinner", "Snacks"].map(
    (meal) => {
      const selected =
        form.meal_type.includes(meal);

      return (
        <button
          type="button"
          key={meal}
          onClick={() => {
            if (selected) {
              setForm({
                ...form,
                meal_type:
                  form.meal_type.filter(
                    (m) => m !== meal
                  ),
              });
            } else {
              setForm({
                ...form,
                meal_type: [
                  ...form.meal_type,
                  meal,
                ],
              });
            }
          }}
          className={`p-4 rounded-2xl border font-medium ${
            selected
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-white"
          }`}
        >
          {meal}
        </button>
      );
    }
  )}
</div>

</div>

<textarea
  placeholder="Description"

  className="w-full p-4 rounded-2xl border bg-white"
  rows={4}
  value={form.description}
  onChange={(e) =>
    setForm({
      ...form,
      description: e.target.value,
    })
  }
/>


<input
  placeholder="Emoji"
  className="w-full p-4 rounded-2xl border bg-white"
  value={form.emoji}
  onChange={(e) =>
    setForm({
      ...form,
      emoji: e.target.value,
    })
  }
/>

<input
  type="color"
  className="w-full h-14 rounded-2xl border bg-white"
  value={form.color}
  onChange={(e) =>
    setForm({
      ...form,
      color: e.target.value,
    })
  }
/>

<textarea
  placeholder="Features (comma separated)"
  rows={3}
  className="w-full p-4 rounded-2xl border bg-white"
  value={form.features}
  onChange={(e) =>
    setForm({
      ...form,
      features: e.target.value,
    })
  }
/>

<textarea
  placeholder="Includes (comma separated)"
  rows={3}
  className="w-full p-4 rounded-2xl border bg-white"
  value={form.includes}
  onChange={(e) =>
    setForm({
      ...form,
      includes: e.target.value,
    })
  }
/>

<div
  className="rounded-[32px] p-6 text-white shadow-xl"
  style={{
    background: `linear-gradient(135deg, ${form.color}, #111827)`
  }}
>
  <div className="flex justify-between items-start">
    <div>
      <p className="text-5xl">
        {form.emoji}
      </p>

      <h2 className="text-2xl font-bold mt-3">
        {form.title || "Premium Plan"}
      </h2>

      <p className="text-white/80">
        {form.tagline || "Healthy Lifestyle"}
      </p>
    </div>

    <div className="text-right">
      <p className="text-white/70 text-sm">
  {form.duration_days} Days
</p>

      <p className="text-3xl font-bold">
        ₹{form.price || 0}
      </p>
    </div>
  </div>

  <div className="mt-6 flex flex-wrap gap-2">
    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
      {form.goal}
    </span>

    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
      {form.diet_type}
    </span>

    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
  {form.plan_type === "normal" && "🥗 Normal"}

  {form.plan_type === "dietician" &&
    "👨‍⚕️ Dietician"}

  {form.plan_type === "gym" &&
    "💪 Gym + Trainer"}
</span>
  </div>

  <div className="mt-5 text-sm text-white/90">
    {form.calories_per_day || 0} kcal/day
  </div>

  <div className="text-sm text-white/90">
    {form.duration_days || 0} days
  </div>
</div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-purple-500 text-white font-bold"
        >
          {loading ? "Creating..." : "Create Plan"}
        </button>

      </div>
    </div>
  );
}