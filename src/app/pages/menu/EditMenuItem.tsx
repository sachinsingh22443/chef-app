import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ImagePlus,
  Leaf,
  Minus,
  Package,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";

const API = axios.create({
  baseURL: "https://chef-backend-qh12.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type ImageItem = string | File;

const categories = ["Healthy", "Protein-Rich", "Tiffin", "Special Diet"];

const categoryMeta: Record<string, { icon: string; description: string }> = {
  Healthy: { icon: "🥗", description: "Balanced & wholesome" },
  "Protein-Rich": { icon: "💪", description: "High protein meals" },
  Tiffin: { icon: "🍱", description: "Everyday comfort food" },
  "Special Diet": { icon: "✨", description: "Curated diet choices" },
};

export default function EditMenuItem() {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    inStock: true,
    isPublic: true,
    hasDiscount: false,
    discountPrice: "",
    ingredients: [] as string[],
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  useEffect(() => {
    fetchMenu();
  }, [itemId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await API.get("/menu");
      const item = res.data.find((i: any) => String(i.id) === String(itemId));

      if (!item) {
        toast.error("Menu item not found");
        navigate("/menu");
        return;
      }

      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price != null ? String(item.price) : "",
        prepTime: item.prep_time != null ? String(item.prep_time) : "",
        foodType: item.food_type || "vegetarian",
        category: item.category || "",
        calories: item.calories != null ? String(item.calories) : "",
        protein: item.protein != null ? String(item.protein) : "",
        carbs: item.carbs != null ? String(item.carbs) : "",
        fats: item.fats != null ? String(item.fats) : "",
        quantity: item.quantity != null ? String(item.quantity) : "",
        inStock: Number(item.quantity || 0) > 0,
        isPublic: true,
        hasDiscount: false,
        discountPrice: "",
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients
          : typeof item.ingredients === "string"
            ? item.ingredients.split(",").map((x: string) => x.trim()).filter(Boolean)
            : [],
      });

      setImages(item.image_urls || []);
    } catch (err) {
      console.log(err);
      toast.error("Unable to load menu item");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const valid = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (images.length + valid.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    setImages((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    const value = newIngredient.trim();
    if (!value) return;

    if (
      formData.ingredients.some(
        (ingredient) => ingredient.toLowerCase() === value.toLowerCase()
      )
    ) {
      toast.error("Ingredient already added");
      return;
    }

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

  const setQuantity = (value: number) => {
    const next = Math.max(0, value);
    setFormData((prev) => ({
      ...prev,
      quantity: String(next),
      inStock: next > 0,
    }));
  };

  const displayPrice = Number(formData.price || 0);
  const displayDiscount = Number(formData.discountPrice || 0);
  const hasDiscount =
    formData.hasDiscount &&
    displayDiscount > 0 &&
    displayDiscount < displayPrice;

  const finalPrice = hasDiscount ? displayDiscount : displayPrice;
  const discountPercent =
    hasDiscount && displayPrice > 0
      ? Math.round(((displayPrice - displayDiscount) / displayPrice) * 100)
      : 0;

  const completion = useMemo(() => {
    const checks = [
      !!formData.name.trim(),
      !!formData.description.trim(),
      Number(formData.price) > 0,
      Number(formData.prepTime) > 0,
      Number(formData.quantity) >= 0,
      !!formData.category,
      formData.ingredients.length > 0,
      images.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData, images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Dish name is required");
      return;
    }
    if (!Number(formData.price) || Number(formData.price) <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!Number(formData.prepTime) || Number(formData.prepTime) <= 0) {
      toast.error("Enter a valid preparation time");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (!images.length) {
      toast.error("Add at least one dish photo");
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("prep_time", formData.prepTime);
      form.append("quantity", formData.quantity);
      form.append("category", formData.category);
      form.append("food_type", formData.foodType);
      form.append("calories", formData.calories);
      form.append("protein", formData.protein);
      form.append("carbs", formData.carbs);
      form.append("fats", formData.fats);
      form.append("ingredients", formData.ingredients.join(","));

      images.forEach((img) => {
        if (img instanceof File) form.append("images", img);
      });

      await API.put(`/menu/${itemId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Menu item updated successfully!");
      navigate("/menu");
    } catch (err: any) {
      console.log(err?.response?.data || err);
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07100d] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15">
            <Sparkles className="h-7 w-7 text-emerald-300 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold">Loading your dish</h2>
          <p className="mt-2 text-sm text-white/45">
            Preparing the editing studio…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07100d] text-white pb-32">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-40 top-[45%] h-[360px] w-[360px] rounded-full bg-orange-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-[#08120f]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </button>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Menu Studio
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Refine your dish.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                Update photos, pricing, availability and nutrition — then
                publish the improved version to your customers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-white/35">
                  Listing readiness
                </div>
                <div className="mt-1 text-2xl font-black text-emerald-300">
                  {completion}%
                </div>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] sm:flex">
                <UtensilsCrossed className="h-6 w-6 text-orange-300" />
              </div>
            </div>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-300 to-orange-300 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="relative mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]"
      >
        <main className="space-y-6">
          {/* Photos */}
          <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-2xl">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    01 · Visuals
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Dish gallery</h2>
                  <p className="mt-1 text-sm text-white/40">
                    Keep up to 5 photos. Your first image acts as the hero.
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-white/55">
                  {images.length}/5 photos
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img, index) => (
                    <div
                      key={`${typeof img === "string" ? img : img.name}-${index}`}
                      className={`group relative overflow-hidden rounded-2xl border ${
                        index === 0
                          ? "border-emerald-300/50 ring-1 ring-emerald-300/20"
                          : "border-white/10"
                      } bg-black/30`}
                    >
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`Dish ${index + 1}`}
                        className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-emerald-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#06100c]">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-red-500"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.04]">
                      <ImagePlus className="h-7 w-7 text-emerald-300" />
                      <span className="mt-2 text-xs font-semibold text-white/65">
                        Add photo
                      </span>
                      <span className="mt-1 text-[10px] text-white/30">
                        JPG / PNG · max 5MB
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/15 px-6 text-center transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.03]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300/10">
                    <ImagePlus className="h-8 w-8 text-emerald-300" />
                  </div>
                  <h3 className="mt-4 font-bold">Bring the dish to life</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/35">
                    Add at least one appetizing photo. You can upload up to
                    five.
                  </p>
                  <span className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#07100d]">
                    Choose photos
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Basic info */}
          <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                02 · Identity
              </p>
              <h2 className="mt-1 text-xl font-bold">Dish details</h2>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-white/75">
                  Dish name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Rajasthani Thali"
                  required
                  className="mt-2 h-12 border-white/10 bg-black/20 text-white placeholder:text-white/25"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white/75">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Tell customers what makes this dish special…"
                  rows={4}
                  required
                  className="mt-2 border-white/10 bg-black/20 text-white placeholder:text-white/25"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price" className="text-white/75">
                    Price · ₹
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                      ₹
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      placeholder="249"
                      required
                      className="h-12 border-white/10 bg-black/20 pl-9 text-white placeholder:text-white/25"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prepTime" className="text-white/75">
                    Prep time · min
                  </Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min="1"
                    value={formData.prepTime}
                    onChange={(e) => updateField("prepTime", e.target.value)}
                    placeholder="30"
                    required
                    className="mt-2 h-12 border-white/10 bg-black/20 text-white placeholder:text-white/25"
                  />
                </div>
              </div>

              {/* Quantity control */}
              <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-white/75">Available quantity</Label>
                    <p className="mt-1 text-xs text-white/30">
                      Set 0 to mark this dish out of stock.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Number(formData.quantity || 0) - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-9 w-20 border-0 bg-transparent text-center text-lg font-bold text-white focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Number(formData.quantity || 0) + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300 text-[#06100c] hover:bg-emerald-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                    formData.inStock
                      ? "bg-emerald-300/10 text-emerald-200"
                      : "bg-red-400/10 text-red-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      formData.inStock ? "bg-emerald-300" : "bg-red-400"
                    }`}
                  />
                  {formData.inStock
                    ? "Currently available for ordering"
                    : "Currently out of stock"}
                </div>
              </div>
            </div>
          </section>

          {/* Food & category */}
          <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                03 · Classification
              </p>
              <h2 className="mt-1 text-xl font-bold">Food profile</h2>
            </div>

            <div>
              <Label className="text-white/75">Food type</Label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  {
                    value: "vegetarian",
                    label: "Vegetarian",
                    icon: "🌿",
                    active: "border-emerald-300/50 bg-emerald-300/10 text-emerald-200",
                  },
                  {
                    value: "non-veg",
                    label: "Non-Veg",
                    icon: "🍗",
                    active: "border-red-300/50 bg-red-300/10 text-red-200",
                  },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField("foodType", type.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      formData.foodType === type.value
                        ? type.active
                        : "border-white/10 bg-black/15 text-white/45 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold">{type.label}</span>
                      {formData.foodType === type.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-white/75">Category</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {categories.map((cat) => {
                  const selected = formData.category === cat;
                  const meta = categoryMeta[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateField("category", cat)}
                      className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-orange-300/50 bg-orange-300/10"
                          : "border-white/10 bg-black/15 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="text-2xl">{meta.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-bold ${
                            selected ? "text-orange-200" : "text-white/75"
                          }`}
                        >
                          {cat}
                        </span>
                        <span className="mt-0.5 block text-xs text-white/30">
                          {meta.description}
                        </span>
                      </span>
                      {selected && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-300 text-[#161006]">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Nutrition */}
          <section className="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-emerald-400/[0.12] via-white/[0.045] to-orange-300/[0.06] p-5 shadow-2xl sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
                  04 · Nutrition
                </p>
                <h2 className="mt-1 text-xl font-bold">Nutrition snapshot</h2>
                <p className="mt-1 text-sm text-white/35">
                  Help health-conscious customers make a quick choice.
                </p>
              </div>
              <Leaf className="hidden h-7 w-7 text-lime-300 sm:block" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "calories", label: "Calories", unit: "kcal", icon: "🔥" },
                { key: "protein", label: "Protein", unit: "g", icon: "💪" },
                { key: "carbs", label: "Carbs", unit: "g", icon: "⚡" },
                { key: "fats", label: "Fats", unit: "g", icon: "🥑" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/25">
                      {item.unit}
                    </span>
                  </div>
                  <Label className="mt-3 block text-xs text-white/45">
                    {item.label}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={(formData as any)[item.key]}
                    onChange={(e) => updateField(item.key, e.target.value)}
                    placeholder="0"
                    className="mt-1 h-10 border-0 bg-transparent px-0 text-xl font-black text-white shadow-none focus-visible:ring-0"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Ingredients */}
          <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                05 · Recipe
              </p>
              <h2 className="mt-1 text-xl font-bold">Ingredients</h2>
              <p className="mt-1 text-sm text-white/35">
                Keep the ingredient list clean and easy to scan.
              </p>
            </div>

            {formData.ingredients.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div
                    key={`${ingredient}-${index}`}
                    className="group flex items-center gap-2 rounded-full border border-orange-300/15 bg-orange-300/[0.08] py-2 pl-3 pr-2"
                  >
                    <span className="text-sm text-orange-100">{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-orange-200/60 hover:bg-red-400/20 hover:text-red-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
                placeholder="e.g. Paneer, tomato, coriander…"
                className="h-12 border-white/10 bg-black/20 text-white placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-300 text-[#161006] transition hover:bg-orange-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </section>
        </main>

        {/* Desktop preview / sticky editor */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-2xl">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                    Live preview
                  </p>
                  <h2 className="mt-1 font-bold">Customer card</h2>
                </div>
                <Zap className="h-5 w-5 text-orange-300" />
              </div>
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-3xl bg-[#f8f6f1] text-[#171714] shadow-xl">
                <div className="relative aspect-[1.15/1] overflow-hidden bg-[#e8e4db]">
                  {images[0] ? (
                    <img
                      src={
                        typeof images[0] === "string"
                          ? images[0]
                          : URL.createObjectURL(images[0])
                      }
                      alt={formData.name || "Dish"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-black/25">
                      <ImagePlus className="h-10 w-10" />
                      <span className="mt-2 text-xs">Add a dish photo</span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur ${
                        formData.foodType === "vegetarian"
                          ? "bg-emerald-100/90 text-emerald-800"
                          : "bg-red-100/90 text-red-800"
                      }`}
                    >
                      {formData.foodType === "vegetarian"
                        ? "● VEG"
                        : "● NON-VEG"}
                    </span>

                    {discountPercent > 0 && (
                      <span className="rounded-full bg-[#171714]/85 px-2.5 py-1 text-[10px] font-black text-white">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black">
                        {formData.name || "Your dish name"}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/50">
                        {formData.description ||
                          "A short, delicious description will appear here."}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-black">
                        ₹{finalPrice || 0}
                      </div>
                      {hasDiscount && (
                        <div className="text-[10px] text-black/35 line-through">
                          ₹{displayPrice}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-semibold text-black/50">
                    <div className="rounded-xl bg-black/[0.04] px-3 py-2">
                      ⏱ {formData.prepTime || "—"} min
                    </div>
                    <div className="rounded-xl bg-black/[0.04] px-3 py-2">
                      📦 {formData.quantity || 0} available
                    </div>
                  </div>

                  {formData.category && (
                    <div className="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-bold text-orange-800">
                      {categoryMeta[formData.category]?.icon}{" "}
                      {formData.category}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-black/5 pt-4 text-center">
                    <div>
                      <div className="text-xs font-black">
                        {formData.calories || "—"}
                      </div>
                      <div className="text-[8px] uppercase text-black/35">
                        kcal
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black">
                        {formData.protein || "—"}g
                      </div>
                      <div className="text-[8px] uppercase text-black/35">
                        protein
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black">
                        {formData.carbs || "—"}g
                      </div>
                      <div className="text-[8px] uppercase text-black/35">
                        carbs
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black">
                        {formData.fats || "—"}g
                      </div>
                      <div className="text-[8px] uppercase text-black/35">
                        fats
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                  <div className="flex items-center gap-2 text-white/35">
                    <Package className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider">
                      Stock
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-black">
                    {formData.quantity || 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                  <div className="flex items-center gap-2 text-white/35">
                    <Leaf className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider">
                      Type
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-black capitalize">
                    {formData.foodType}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#07100d]/90 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={`h-2 w-2 rounded-full ${
                  completion >= 80 ? "bg-emerald-300" : "bg-orange-300"
                }`}
              />
              {completion >= 80
                ? "Your listing is looking great"
                : "A few details still need attention"}
            </div>
            <p className="mt-0.5 truncate text-xs text-white/35">
              Changes are saved only when you update the menu item.
            </p>
          </div>

          <div className="ml-auto flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="hidden h-12 border-white/10 bg-white/[0.04] px-5 text-white hover:bg-white/[0.08] sm:flex"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form=""
              disabled={saving}
              onClick={() => {
                const form = document.querySelector(
                  "form"
                ) as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              className="h-12 flex-1 rounded-xl bg-emerald-300 px-6 font-black text-[#06100c] shadow-lg shadow-emerald-300/10 hover:bg-emerald-200 sm:min-w-[210px] sm:flex-none"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#06100c]/30 border-t-[#06100c]" />
                  Updating…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Menu Item
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
