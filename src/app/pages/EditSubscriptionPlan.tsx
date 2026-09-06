import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Flame,
  Leaf,
  Palette,
  Plus,
  Save,
  Sparkles,
  Utensils,
} from "lucide-react";

type FormState = {
  title: string;
  price: string;
  plan_type: string;
  goal: string;
  diet_type: string;
  breakfast_available: boolean;
  lunch_price: string;
  dinner_price: string;
  calories_per_day: string;
  breakfast_price: string;
  description: string;
  tagline: string;
  emoji: string;
  color: string;
  meal_type: string[];
  features: string;
  includes: string;
};

const PLAN_TYPES = [
  { value: "normal", label: "Normal Diet", icon: "🥗", desc: "Everyday balanced meals" },
  { value: "dietician", label: "Dietician Support", icon: "👨‍⚕️", desc: "Goal-focused nutrition" },
  { value: "gym", label: "Gym + Trainer", icon: "💪", desc: "Performance meal program" },
];

const GOALS = [
  "Weight Loss",
  "Weight Gain",
  "Muscle Building",
  "Healthy Lifestyle",
  "Diabetic Care",
];

const DIETS = ["Veg", "Non Veg", "Vegan", "Keto", "High Protein"];

const MEALS = [
  { label: "Lunch", emoji: "🍛" },
  { label: "Dinner", emoji: "🍽️" },
  { label: "Snacks", emoji: "🥜" },
];

const PALETTE = ["#8b5cf6", "#f97316", "#0ea5e9", "#10b981", "#ec4899", "#e11d48"];

export default function EditSubscriptionPlan() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [form, setForm] = useState<FormState>({
    title: "",
    price: "",
    plan_type: "normal",
    goal: "Weight Loss",
    diet_type: "Veg",
    breakfast_available: false,
    lunch_price: "",
    dinner_price: "",
    calories_per_day: "",
    breakfast_price: "",
    description: "",
    tagline: "",
    emoji: "🍱",
    color: "#8b5cf6",
    meal_type: [],
    features: "",
    includes: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/subscriptions/chef/plans",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const plan = res.data.find((p: any) => String(p.id) === String(id));

      if (!plan) {
        alert("Plan not found");
        navigate("/app/subscription-plans");
        return;
      }

      setForm({
        title: plan.title || "",
        price: String(plan.price || ""),
        plan_type: plan.plan_type || "normal",
        goal: plan.goal || "Weight Loss",
        diet_type: plan.diet_type || "Veg",
        calories_per_day: String(plan.calories_per_day || ""),
        breakfast_available: Boolean(plan.breakfast_available),
        breakfast_price: String(plan.breakfast_price ?? ""),
        lunch_price: String(plan.lunch_price ?? ""),
        dinner_price: String(plan.dinner_price ?? ""),
        description: plan.description || "",
        tagline: plan.tagline || "",
        emoji: plan.emoji || "🍱",
        color: plan.color || "#8b5cf6",
        meal_type: (plan.meal_type || []).filter(
          (meal: string) => meal !== "Breakfast"
        ),
        features: (plan.features || []).join(", "),
        includes: (plan.includes || []).join(", "),
      });
    } catch (err) {
      console.log(err);
      alert("Failed to load plan");
    } finally {
      setPageLoading(false);
    }
  };

  const updatePlan = async () => {
    if (!form.title.trim()) {
      alert("Please enter plan name");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      alert("Please enter subscription price");
      return;
    }

    if (
      form.breakfast_price === "" ||
      Number(form.breakfast_price) <= 0
    ) {
      alert("Please enter a valid breakfast price");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `https://chef-backend-qh12.onrender.com/subscriptions/chef/plans/${id}`,
        {
          title: form.title,
          price: Number(form.price),
          plan_type: form.plan_type,
          goal: form.goal,
          diet_type: form.diet_type,
          calories_per_day: Number(form.calories_per_day),
          breakfast_available: form.breakfast_available,
          breakfast_price: Number(form.breakfast_price),
          lunch_price:
            form.lunch_price === "" ? null : Number(form.lunch_price),
          dinner_price:
            form.dinner_price === "" ? null : Number(form.dinner_price),
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

      alert("Plan Updated Successfully");
      navigate("/app/subscription-plans");
    } catch (err: any) {
      console.error("UPDATE PLAN ERROR:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Update Failed";

      alert(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = useMemo(
    () => PLAN_TYPES.find((p) => p.value === form.plan_type) ?? PLAN_TYPES[0],
    [form.plan_type]
  );

  const features = useMemo(
    () =>
      form.features
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 4),
    [form.features]
  );

  const includes = useMemo(
    () =>
      form.includes
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 4),
    [form.includes]
  );

  if (pageLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f7fb]">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600"
          />
          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading subscription plan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .control {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          border-radius: 1rem;
          padding: .875rem 1rem;
          font-size: .875rem;
          outline: none;
          transition: .2s ease;
        }
        .control::placeholder { color: rgb(148 163 184); }
        .control:focus {
          border-color: rgb(167 139 250);
          background: white;
          box-shadow: 0 0 0 4px rgb(139 92 246 / .10);
        }
      `}</style>

      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        {/* HERO */}
        <header className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 82% 8%, ${form.color} 0, transparent 32%), linear-gradient(135deg, #111827 0%, #1e1b4b 55%, #312e81 100%)`,
            }}
          />
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute right-10 top-12 h-32 w-32 rounded-full border border-white/10" />

          <div className="relative mx-auto max-w-7xl px-5 pb-9 pt-5 sm:px-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                  <Edit3 className="h-3.5 w-3.5" />
                  Subscription Studio
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Refine your plan.
                  <span className="block text-white/55">
                    Keep the value. Upgrade the presentation.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  Update pricing, nutrition, meals and positioning while seeing
                  the customer-facing card live.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-2xl">
                  {form.emoji || "🍱"}
                </div>
                <div>
                  <p className="text-xs text-white/50">Editing</p>
                  <p className="font-bold">{form.title || "Your plan"}</p>
                </div>
                <BadgeCheck className="ml-2 h-5 w-5 text-emerald-300" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
            <section className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="01"
                  icon={<Utensils className="h-4 w-4" />}
                  title="Plan identity"
                  subtitle="Shape the name, promise and price customers will see."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Plan name" required className="sm:col-span-2">
                    <Input
                      placeholder="e.g. Fit Kitchen 30"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                    />
                  </Field>

                  <Field label="Tagline">
                    <Input
                      placeholder="Eat smart. Feel stronger."
                      value={form.tagline}
                      onChange={(e) => update("tagline", e.target.value)}
                    />
                  </Field>

                  <Field label="30-day price" required>
                    <MoneyInput
                      value={form.price}
                      placeholder="2999"
                      onChange={(value) => update("price", value)}
                    />
                  </Field>

                  <Field label="Description" className="sm:col-span-2">
                    <textarea
                      rows={4}
                      placeholder="Explain what makes this plan valuable..."
                      className="control resize-none"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="02"
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Plan positioning"
                  subtitle="Choose the customer goal and the type of support you offer."
                />

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Subscription type
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {PLAN_TYPES.map((plan) => {
                      const active = form.plan_type === plan.value;

                      return (
                        <button
                          key={plan.value}
                          type="button"
                          onClick={() => update("plan_type", plan.value)}
                          className={`relative rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-violet-500 bg-violet-50 shadow-sm ring-2 ring-violet-500/10"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          {active && (
                            <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}

                          <div className="mb-3 text-2xl">{plan.icon}</div>
                          <p className="pr-5 text-sm font-extrabold">{plan.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {plan.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Primary goal">
                    <select
                      className="control"
                      value={form.goal}
                      onChange={(e) => update("goal", e.target.value)}
                    >
                      {GOALS.map((goal) => (
                        <option key={goal}>{goal}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Diet style">
                    <select
                      className="control"
                      value={form.diet_type}
                      onChange={(e) => update("diet_type", e.target.value)}
                    >
                      {DIETS.map((diet) => (
                        <option key={diet}>{diet}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="03"
                  icon={<CalendarDays className="h-4 w-4" />}
                  title="Daily nutrition"
                  subtitle="Control calories, breakfast and the optional meal pricing."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Calories per day">
                    <div className="relative">
                      <Flame className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                      <input
                        type="number"
                        min="0"
                        placeholder="1800"
                        className="control pl-11 pr-16"
                        value={form.calories_per_day}
                        onChange={(e) =>
                          update("calories_per_day", e.target.value)
                        }
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        kcal
                      </span>
                    </div>
                  </Field>

                  <Field label="Breakfast price / day" required>
                    <MoneyInput
                      value={form.breakfast_price}
                      placeholder="40"
                      onChange={(value) => update("breakfast_price", value)}
                    />
                  </Field>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold">Breakfast availability</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Allow customers to choose breakfast with this plan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        update("breakfast_available", !form.breakfast_available)
                      }
                      className={`relative h-7 w-12 rounded-full transition ${
                        form.breakfast_available ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      aria-label="Toggle breakfast availability"
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                          form.breakfast_available ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Lunch price / day" hint="Optional">
                    <MoneyInput
                      value={form.lunch_price}
                      placeholder="100"
                      onChange={(value) => update("lunch_price", value)}
                    />
                  </Field>

                  <Field label="Dinner price / day" hint="Optional">
                    <MoneyInput
                      value={form.dinner_price}
                      placeholder="120"
                      onChange={(value) => update("dinner_price", value)}
                    />
                  </Field>
                </div>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Meals included
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Breakfast is managed separately above.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-600 shadow-sm">
                      {form.meal_type.length} selected
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {MEALS.map((meal) => {
                      const selected = form.meal_type.includes(meal.label);

                      return (
                        <button
                          key={meal.label}
                          type="button"
                          onClick={() =>
                            update(
                              "meal_type",
                              selected
                                ? form.meal_type.filter((m) => m !== meal.label)
                                : [...form.meal_type, meal.label]
                            )
                          }
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 transition ${
                            selected
                              ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-xl">{meal.emoji}</span>
                            <span className="text-sm font-bold">{meal.label}</span>
                          </span>
                          {selected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="04"
                  icon={<Leaf className="h-4 w-4" />}
                  title="Customer value"
                  subtitle="Edit the benefits and inclusions displayed for your plan."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Features" hint="Comma separated">
                    <textarea
                      rows={4}
                      placeholder="Fresh meals, Flexible delivery, Macro focused"
                      className="control resize-none"
                      value={form.features}
                      onChange={(e) => update("features", e.target.value)}
                    />
                  </Field>

                  <Field label="Includes" hint="Comma separated">
                    <textarea
                      rows={4}
                      placeholder="Lunch, Dinner, Nutrition guide"
                      className="control resize-none"
                      value={form.includes}
                      onChange={(e) => update("includes", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="05"
                  icon={<Palette className="h-4 w-4" />}
                  title="Visual identity"
                  subtitle="Give this plan its own recognizable look."
                />

                <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
                  <Field label="Emoji">
                    <Input
                      className="text-center text-3xl"
                      value={form.emoji}
                      maxLength={4}
                      onChange={(e) => update("emoji", e.target.value)}
                    />
                  </Field>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Accent color
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      {PALETTE.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => update("color", color)}
                          className={`grid h-11 w-11 place-items-center rounded-full border-4 transition ${
                            form.color === color
                              ? "scale-105 border-slate-900"
                              : "border-white shadow-sm"
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Use ${color}`}
                        >
                          {form.color === color && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}

                      <label className="relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-white">
                        <Palette className="h-4 w-4 text-slate-500" />
                        <input
                          type="color"
                          value={form.color}
                          onChange={(e) => update("color", e.target.value)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LIVE PREVIEW */}
            <aside className="lg:sticky lg:top-6 lg:h-fit">
              <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Live preview
                      </p>
                      <p className="mt-1 text-sm font-extrabold">Customer plan card</p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                      <Edit3 className="h-3 w-3" />
                      Editing
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div
                    className="relative overflow-hidden rounded-[26px] p-5 text-white shadow-lg"
                    style={{
                      background: `linear-gradient(145deg, ${form.color} 0%, #111827 115%)`,
                    }}
                  >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-black/10" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                          {form.emoji || "🍱"}
                        </div>

                        <div className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
                          30 DAYS
                        </div>
                      </div>

                      <h2 className="mt-5 text-2xl font-black leading-tight">
                        {form.title || "Premium Plan"}
                      </h2>

                      <p className="mt-1 min-h-5 text-sm text-white/75">
                        {form.tagline || "Healthy lifestyle, made easier."}
                      </p>

                      <div className="mt-5 flex items-end gap-1">
                        <span className="text-sm font-bold text-white/60">₹</span>
                        <span className="text-4xl font-black">
                          {form.price || "0"}
                        </span>
                        <span className="pb-1 text-xs font-semibold text-white/60">
                          / 30 days
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Badge>{form.goal}</Badge>
                        <Badge>{form.diet_type}</Badge>
                        <Badge>
                          {selectedPlan.icon}{" "}
                          {selectedPlan.label
                            .replace("Dietician Support", "Dietician")
                            .replace("Gym + Trainer", "Gym")}
                        </Badge>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <MiniStat
                          label="Calories"
                          value={`${form.calories_per_day || "0"} kcal`}
                        />
                        <MiniStat
                          label="Breakfast"
                          value={`₹${form.breakfast_price || "0"}/day`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Meals
                      </p>
                      <span className="text-xs font-bold text-violet-600">
                        {form.meal_type.length} selected
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.meal_type.length ? (
                        form.meal_type.map((meal) => (
                          <span
                            key={meal}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                          >
                            <Check className="h-3 w-3 text-emerald-500" />
                            {meal}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">
                          No meals selected yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {(features.length > 0 || includes.length > 0) && (
                    <div className="mt-4 space-y-3">
                      {features.length > 0 && (
                        <PreviewList title="Features" items={features} />
                      )}
                      {includes.length > 0 && (
                        <PreviewList title="Includes" items={includes} />
                      )}
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Meal pricing
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <PricePill label="Breakfast" value={`₹${form.breakfast_price || "0"}`} />
                      <PricePill
                        label="Lunch"
                        value={form.lunch_price ? `₹${form.lunch_price}` : "—"}
                      />
                      <PricePill
                        label="Dinner"
                        value={form.dinner_price ? `₹${form.dinner_price}` : "—"}
                      />
                      <PricePill
                        label="Breakfast"
                        value={form.breakfast_available ? "Available" : "Optional"}
                      />
                    </div>
                  </div>

                  <button
                    onClick={updatePlan}
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${form.color}, #111827)`,
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                        {loading ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-black">
                          {loading ? "Saving changes..." : "Save plan changes"}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-white/60">
                          Update this subscription
                        </span>
                      </span>
                    </span>
                    {!loading && <ChevronRight className="h-5 w-5" />}
                  </button>

                  <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                    Existing subscription customers keep their locked breakfast
                    price according to your current plan logic.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

function SectionTitle({
  number,
  icon,
  title,
  subtitle,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.18em] text-violet-500">
            {number}
          </span>
          <h2 className="text-base font-black">{title}</h2>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`control ${className}`} />;
}

function MoneyInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <CircleDollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
      <input
        type="number"
        min="0"
        placeholder={placeholder}
        className="control pl-11 pr-14"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
        INR
      </span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/15 p-3 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
        {label}
      </p>
      <p className="mt-1 text-xs font-extrabold">{value}</p>
    </div>
  );
}

function PricePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-xs font-black">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-slate-600"
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-50">
              <Check className="h-2.5 w-2.5 text-emerald-600" />
            </span>
            <span className="truncate">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
