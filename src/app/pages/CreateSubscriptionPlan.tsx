import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Leaf,
  Palette,
  Plus,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

type FormState = {
  title: string;
  price: string;
  tagline: string;
  description: string;
  plan_type: string;
  emoji: string;
  color: string;
  goal: string;
  diet_type: string;
  calories_per_day: string;
  breakfast_price: string;
  meal_type: string[];
  features: string;
  includes: string;
};

const PLAN_TYPES = [
  {
    value: "normal",
    label: "Normal Diet",
    icon: "🥗",
    description: "Simple everyday balanced meals",
  },
  {
    value: "dietician",
    label: "Dietician Support",
    icon: "👨‍⚕️",
    description: "Goal-focused nutrition guidance",
  },
  {
    value: "gym",
    label: "Gym + Trainer",
    icon: "💪",
    description: "Performance-focused meal program",
  },
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

const PALETTE = [
  "#8b5cf6",
  "#f97316",
  "#0ea5e9",
  "#10b981",
  "#ec4899",
  "#e11d48",
];

export default function CreateSubscriptionPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormState>({
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
    breakfast_price: "",
    meal_type: [],
    features: "",
    includes: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedPlan = useMemo(
    () => PLAN_TYPES.find((item) => item.value === form.plan_type) ?? PLAN_TYPES[0],
    [form.plan_type]
  );

  const featureList = useMemo(
    () =>
      form.features
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 4),
    [form.features]
  );

  const includeList = useMemo(
    () =>
      form.includes
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 4),
    [form.includes]
  );

  const handleSubmit = async () => {
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

      await axios.post(
        "https://chef-backend-qh12.onrender.com/subscriptions/chef/plans",
        {
          title: form.title,
          price: Number(form.price),
          plan_type: form.plan_type,
          goal: form.goal,
          diet_type: form.diet_type,
          calories_per_day: Number(form.calories_per_day),
          breakfast_price: Number(form.breakfast_price),
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
          className="absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 80% 10%, ${form.color} 0, transparent 32%), linear-gradient(135deg, #111827 0%, #1e1b4b 55%, #312e81 100%)`,
          }}
        />
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-white/10" />

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
                <Sparkles className="h-3.5 w-3.5" />
                Subscription Studio
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Build a plan people{" "}
                <span className="text-white/60">want to subscribe to.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Create a polished 30-day nutrition experience with your own
                pricing, meals, positioning and visual identity.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-2xl">
                {form.emoji || "🍱"}
              </div>
              <div>
                <p className="text-xs text-white/50">Live preview</p>
                <p className="font-bold">{form.title || "Your new plan"}</p>
              </div>
              <BadgeCheck className="ml-2 h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* FORM */}
          <section className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                number="01"
                icon={<Utensils className="h-4 w-4" />}
                title="Plan identity"
                subtitle="Give your subscription a clear, memorable identity."
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
                    placeholder="e.g. Eat smart. Feel stronger."
                    value={form.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                  />
                </Field>

                <Field label="30-day subscription price" required>
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
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
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
                title="Position the plan"
                subtitle="Choose the audience and promise behind the subscription."
              />

              <div className="space-y-5">
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
                          <p className="pr-5 text-sm font-extrabold text-slate-900">
                            {plan.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {plan.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                number="03"
                icon={<CalendarDays className="h-4 w-4" />}
                title="Daily nutrition"
                subtitle="Define the meal experience customers receive."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Calories per day">
                  <div className="relative">
                    <Flame className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                    <input
                      type="number"
                      min="0"
                      placeholder="1800"
                      className="control pl-11"
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

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold">Meals included</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Select the meals customers can subscribe to.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
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
                title="What customers get"
                subtitle="Turn the plan into a clear value proposition."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Features" hint="Separate with commas">
                  <textarea
                    rows={4}
                    placeholder="Fresh meals, Flexible delivery, Macro focused"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    value={form.features}
                    onChange={(e) => update("features", e.target.value)}
                  />
                </Field>

                <Field label="Includes" hint="Separate with commas">
                  <textarea
                    rows={4}
                    placeholder="Lunch, Dinner, Nutrition guide"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
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
                subtitle="Make the plan feel like a real product."
              />

              <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
                <Field label="Emoji">
                  <Input
                    className="text-center text-3xl"
                    value={form.emoji}
                    onChange={(e) => update("emoji", e.target.value)}
                    maxLength={4}
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
                        aria-label={`Use ${color}`}
                        onClick={() => update("color", color)}
                        className={`grid h-11 w-11 place-items-center rounded-full border-4 transition ${
                          form.color === color
                            ? "border-slate-900 scale-105"
                            : "border-white shadow-sm"
                        }`}
                        style={{ backgroundColor: color }}
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

          {/* PREVIEW / CTA */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Customer preview
                    </p>
                    <p className="mt-1 text-sm font-extrabold">Plan card</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
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
                      <Badge>{selectedPlan.icon} {selectedPlan.label.replace("Dietician Support", "Dietician")}</Badge>
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
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Meals
                    </p>
                    <span className="text-xs font-bold text-violet-600">
                      {form.meal_type.length || 0} selected
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
                        Select meals above to show them here.
                      </p>
                    )}
                  </div>
                </div>

                {(featureList.length > 0 || includeList.length > 0) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {featureList.length > 0 && (
                      <PreviewList title="Features" items={featureList} />
                    )}
                    {includeList.length > 0 && (
                      <PreviewList title="Includes" items={includeList} />
                    )}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-5 flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${form.color}, #111827)`,
                  }}
                >
                  <span>
                    <span className="block text-sm font-black">
                      {loading ? "Creating plan..." : "Create subscription plan"}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/65">
                      {loading ? "Please wait" : "Publish this plan to your chef dashboard"}
                    </span>
                  </span>
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  Your pricing and breakfast rate are sent exactly as configured.
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
  return (
    <input
      {...props}
      className={`control ${className}`}
    />
  );
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
        className="control pl-11"
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

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-xs font-black">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
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
