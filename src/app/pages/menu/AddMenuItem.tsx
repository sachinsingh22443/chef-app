import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  ImagePlus,
  Leaf,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const API = axios.create({
  baseURL: "https://chef-backend-qh12.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const categories = ["Healthy", "Protein-Rich", "Tiffin", "Special Diet"];

const categoryMeta: Record<string, { icon: string; tone: string }> = {
  Healthy: { icon: "🥗", tone: "emerald" },
  "Protein-Rich": { icon: "💪", tone: "slate" },
  Tiffin: { icon: "🍱", tone: "orange" },
  "Special Diet": { icon: "✨", tone: "violet" },
};

export default function AddMenuItem() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    prepTime: "",
    foodType: "vegetarian",
    category: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    quantity: "",
    ingredients: [] as string[],
  });

  const [images, setImages] = useState<File[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  const imagePreviews = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images]
  );

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const update = (key: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    const value = newIngredient.trim();

    if (!value) return;

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, value],
    }));
    setNewIngredient("");
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least 1 image");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();

      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", String(formData.price));
      form.append("prep_time", String(formData.prepTime));
      form.append("quantity", String(formData.quantity));
      form.append("category", formData.category);
      form.append("food_type", formData.foodType);

      form.append("calories", String(formData.calories));
      form.append("protein", String(formData.protein));
      form.append("carbs", String(formData.carbs));
      form.append("fats", String(formData.fats));

      if (formData.ingredients.length > 0) {
        form.append("ingredients", formData.ingredients.join(","));
      }

      images.forEach((img) => {
        form.append("images", img);
      });

      await API.post("/menu/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Menu item added successfully!");
      navigate("/menu");
    } catch (err: any) {
      console.log("ERROR FULL:", err);
      console.log("ERROR DATA:", err.response?.data);

      toast.error(err.response?.data?.detail || "Error adding menu");
    } finally {
      setLoading(false);
    }
  };

  const price = Number(formData.price) || 0;
  const quantity = Number(formData.quantity) || 0;
  const prep = Number(formData.prepTime) || 0;

  return (
    <>
      <style>{`
        .menu-control {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          border-radius: 1rem;
          padding: .9rem 1rem;
          font-size: .875rem;
          outline: none;
          transition: .2s ease;
        }
        .menu-control::placeholder { color: rgb(148 163 184); }
        .menu-control:focus {
          border-color: rgb(251 146 60);
          background: white;
          box-shadow: 0 0 0 4px rgb(249 115 22 / .10);
        }
      `}</style>

      <div className="min-h-screen bg-[#f7f8fc] pb-28 text-slate-900">
        {/* PREMIUM HERO */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_5%,rgba(251,146,60,.95),transparent_28%),linear-gradient(135deg,#111827,#3b1d12_58%,#7c2d12)]" />
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute right-16 top-12 h-36 w-36 rounded-full border border-white/10" />

          <div className="relative mx-auto max-w-7xl px-5 pb-9 pt-5 sm:px-8">
            <button
              type="button"
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
                  Menu Studio
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Turn your dish into
                  <span className="block text-white/55">
                    a menu customers remember.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  Add beautiful photos, strong pricing, nutrition and
                  ingredients — all from one clean chef workspace.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-2xl">
                  {formData.foodType === "vegetarian" ? "🥗" : "🍗"}
                </div>
                <div>
                  <p className="text-xs text-white/50">New menu item</p>
                  <p className="font-bold">
                    {formData.name || "Untitled dish"}
                  </p>
                </div>
                <BadgeCheck className="ml-2 h-5 w-5 text-emerald-300" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
              <section className="space-y-5">
                {/* PHOTOS */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle
                    number="01"
                    icon={<ImagePlus className="h-4 w-4" />}
                    title="Dish photography"
                    subtitle="Show your food at its best. Up to 5 images."
                  />

                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${preview}-${index}`}
                          className={`group relative overflow-hidden rounded-2xl bg-slate-100 ${
                            index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                          }`}
                        >
                          <img
                            src={preview}
                            alt={`Dish upload ${index + 1}`}
                            className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          {index === 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                              COVER PHOTO
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-rose-500"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {images.length < 5 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-orange-300 hover:bg-orange-50">
                          <Upload className="h-6 w-6 text-slate-400" />
                          <span className="mt-2 text-xs font-bold text-slate-500">
                            Add photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <label className="group flex h-64 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-orange-300 hover:bg-orange-50">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-orange-500 shadow-sm transition group-hover:scale-105">
                        <Upload className="h-7 w-7" />
                      </div>
                      <p className="mt-4 text-sm font-extrabold">
                        Upload your dish photos
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG or WEBP · Maximum 5 images
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                {/* BASIC INFO */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle
                    number="02"
                    icon={<Utensils className="h-4 w-4" />}
                    title="Dish details"
                    subtitle="Create a clear and appetizing menu listing."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Dish name" required className="sm:col-span-2">
                      <input
                        className="menu-control"
                        placeholder="e.g. Rajasthani Thali"
                        value={formData.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Description" required className="sm:col-span-2">
                      <textarea
                        className="menu-control resize-none"
                        rows={4}
                        placeholder="Describe taste, portions and what makes this dish special..."
                        value={formData.description}
                        onChange={(e) => update("description", e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Price" required>
                      <MoneyInput
                        value={formData.price}
                        placeholder="249"
                        onChange={(value) => update("price", value)}
                      />
                    </Field>

                    <Field label="Prep time" required>
                      <div className="relative">
                        <Clock3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                        <input
                          type="number"
                          min="0"
                          className="menu-control pl-11 pr-14"
                          placeholder="30"
                          value={formData.prepTime}
                          onChange={(e) => update("prepTime", e.target.value)}
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          min
                        </span>
                      </div>
                    </Field>

                    <Field label="Available quantity" required className="sm:col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          className="menu-control pr-24"
                          placeholder="50"
                          value={formData.quantity}
                          onChange={(e) => update("quantity", e.target.value)}
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          portions
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Set 0 to mark this item out of stock.
                      </p>
                    </Field>
                  </div>
                </div>

                {/* FOOD TYPE + CATEGORY */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <SectionTitle
                      number="03"
                      icon={<Leaf className="h-4 w-4" />}
                      title="Food type"
                      subtitle="Help customers identify the dish instantly."
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FoodTypeButton
                        active={formData.foodType === "vegetarian"}
                        icon="🌿"
                        title="Vegetarian"
                        onClick={() => update("foodType", "vegetarian")}
                      />
                      <FoodTypeButton
                        active={formData.foodType === "non-veg"}
                        icon="🍗"
                        title="Non-Veg"
                        onClick={() => update("foodType", "non-veg")}
                      />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <SectionTitle
                      number="04"
                      icon={<Sparkles className="h-4 w-4" />}
                      title="Category"
                      subtitle="Place this dish where customers can find it."
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => {
                        const active = formData.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => update("category", cat)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-500/10"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <span className="text-lg">
                              {categoryMeta[cat].icon}
                            </span>
                            <span className="mt-1 block text-xs font-extrabold">
                              {cat}
                            </span>
                            {active && (
                              <Check className="mt-1 h-3.5 w-3.5 text-orange-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* NUTRITION */}
                <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-lg sm:p-7">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                        <Flame className="h-3.5 w-3.5 text-orange-300" />
                        Nutrition
                      </div>
                      <h2 className="text-xl font-black">Nutritional information</h2>
                      <p className="mt-1 text-xs text-white/45">
                        Give health-conscious customers useful numbers.
                      </p>
                    </div>
                    <div className="hidden h-12 w-12 place-items-center rounded-2xl bg-white/10 sm:grid">
                      <Zap className="h-5 w-5 text-orange-300" />
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <NutritionInput
                      label="Calories"
                      unit="kcal"
                      placeholder="450"
                      value={formData.calories}
                      onChange={(v) => update("calories", v)}
                    />
                    <NutritionInput
                      label="Protein"
                      unit="g"
                      placeholder="25"
                      value={formData.protein}
                      onChange={(v) => update("protein", v)}
                    />
                    <NutritionInput
                      label="Carbs"
                      unit="g"
                      placeholder="60"
                      value={formData.carbs}
                      onChange={(v) => update("carbs", v)}
                    />
                    <NutritionInput
                      label="Fats"
                      unit="g"
                      placeholder="15"
                      value={formData.fats}
                      onChange={(v) => update("fats", v)}
                    />
                  </div>
                </div>

                {/* INGREDIENTS */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle
                    number="05"
                    icon={<Leaf className="h-4 w-4" />}
                    title="Ingredients"
                    subtitle="Build trust by showing what's inside your dish."
                  />

                  {formData.ingredients.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {formData.ingredients.map((ingredient, index) => (
                        <span
                          key={`${ingredient}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="grid h-5 w-5 place-items-center rounded-full hover:bg-orange-100"
                            aria-label={`Remove ${ingredient}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      className="menu-control"
                      placeholder="e.g. Paneer, Tomato, Onion..."
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddIngredient();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                      aria-label="Add ingredient"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
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
                        <p className="mt-1 text-sm font-extrabold">
                          Customer menu card
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                        LIVE
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm">
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        {imagePreviews[0] ? (
                          <img
                            src={imagePreviews[0]}
                            alt="Dish preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center">
                            <div className="text-center">
                              <ImagePlus className="mx-auto h-9 w-9 text-slate-300" />
                              <p className="mt-2 text-xs font-bold text-slate-400">
                                Your dish photo
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-slate-700 shadow-sm backdrop-blur">
                          {formData.foodType === "vegetarian"
                            ? "● VEG"
                            : "● NON-VEG"}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="truncate text-xl font-black">
                              {formData.name || "Your dish name"}
                            </h2>
                            <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-5 text-slate-500">
                              {formData.description ||
                                "A delicious description will appear here."}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xl font-black text-orange-600">
                              ₹{price || "0"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {formData.category && (
                            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                              {categoryMeta[formData.category]?.icon}{" "}
                              {formData.category}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                            <Clock3 className="h-3 w-3" />
                            {prep || "—"} min
                          </span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                            {quantity || "0"} portions
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-4 gap-2">
                          <PreviewStat
                            label="kcal"
                            value={formData.calories || "—"}
                          />
                          <PreviewStat
                            label="protein"
                            value={formData.protein ? `${formData.protein}g` : "—"}
                          />
                          <PreviewStat
                            label="carbs"
                            value={formData.carbs ? `${formData.carbs}g` : "—"}
                          />
                          <PreviewStat
                            label="fats"
                            value={formData.fats ? `${formData.fats}g` : "—"}
                          />
                        </div>

                        {formData.ingredients.length > 0 && (
                          <div className="mt-5 border-t border-slate-100 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Ingredients
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {formData.ingredients.slice(0, 6).map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black">Listing readiness</p>
                        <span className="text-xs font-black text-orange-600">
                          {[
                            images.length > 0,
                            !!formData.name,
                            !!formData.description,
                            !!formData.price,
                            !!formData.prepTime,
                            !!formData.quantity,
                            !!formData.category,
                          ].filter(Boolean).length}
                          /7
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-orange-500 transition-all"
                          style={{
                            width: `${
                              ([
                                images.length > 0,
                                !!formData.name,
                                !!formData.description,
                                !!formData.price,
                                !!formData.prepTime,
                                !!formData.quantity,
                                !!formData.category,
                              ].filter(Boolean).length /
                                7) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400">
                        Add the basics above for a stronger customer listing.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-5 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-left text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500">
                          {loading ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-black">
                            {loading ? "Adding menu item..." : "Publish menu item"}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-white/45">
                            {loading
                              ? "Uploading your dish"
                              : "Add this dish to your menu"}
                          </span>
                        </span>
                      </span>
                      {!loading && <ChevronRight className="h-5 w-5 text-white/50" />}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </form>
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
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.18em] text-orange-500">
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
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
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
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-orange-500">
        ₹
      </span>
      <input
        type="number"
        min="0"
        className="menu-control pl-9 pr-14"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
        INR
      </span>
    </div>
  );
}

function FoodTypeButton({
  active,
  icon,
  title,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/10"
          : "border-slate-200 bg-slate-50 hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {active && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-extrabold">{title}</p>
    </button>
  );
}

function NutritionInput({
  label,
  unit,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-white/50">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 pr-10 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/60 focus:bg-white/15"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/35">
          {unit}
        </span>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-black text-slate-700">{value}</p>
    </div>
  );
}
