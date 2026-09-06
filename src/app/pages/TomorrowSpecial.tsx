import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Clock3,
  Flame,
  Leaf,
  Star,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function TomorrowSpecial(){
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>({
  dishName: "",
  description: "",
  specialDate: "",

  // Pricing
  price: "",
  originalPrice: "",

  // Quantity & timing
  maxPlates: "",
  cutoffTime: "",

  // Nutrition
  calories: "",
  protein: "",
  carbs: "",
  fats: "",

  // Preparation
  preparationTime: "",

  // Ingredients
  ingredients: "",

  foodType: "",
  image: null,
});

  const [specials, setSpecials] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());



  useEffect(() => {
    fetchSpecials();
  }, []);

  useEffect(() => {
  const timer = window.setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => window.clearInterval(timer);
}, []);

  // =========================
  // 🔥 FETCH SPECIALS
  // =========================
  const fetchSpecials = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login again");
      return;
    }

    const res = await axios.get(
      "https://chef-backend-qh12.onrender.com/tomorrow-special/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSpecials(res.data);

    // Fetch ratings only when chef_id is available
    res.data.forEach((item: any) => {
      if (item.chef_id) {
        fetchRating(item.chef_id);
      }
    });

  } catch (err: any) {
    console.error(
      "FETCH MY SPECIALS ERROR:",
      err.response?.data || err
    );

    toast.error(
      err.response?.data?.detail ||
      "Failed to load your Tomorrow Specials"
    );
  }
};
  // =========================
  // 🔥 FETCH RATING
  // =========================
  const fetchRating = async (chefId: string) => {
    try {
      const res = await axios.get(
        `https://chef-backend-qh12.onrender.com/reviews/chef/${chefId}`
      );

      setRatings((prev: any) => ({
        ...prev,
        [chefId]: res.data,
      }));

    } catch (err) {
      console.error("Rating error", err);
    }
  };


  const setField = (field: string, value: any) => {
  setFormData((prev: any) => ({
    ...prev,
    [field]: value,
  }));
};

const getDiscountPercent = (original: any, price: any) => {
  const oldPrice = Number(original);
  const newPrice = Number(price);

  if (!oldPrice || !newPrice || oldPrice <= newPrice) {
    return 0;
  }

  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

const getRemaining = (item: any) => {
  if (item.remaining != null) {
    return Math.max(0, Number(item.remaining));
  }

  return Math.max(
    0,
    Number(item.max_plates || 0) -
      Number(item.pre_orders || 0)
  );
};


const getCutoff = (item: any) => {
  if (!item.cutoff_time || !item.special_date) {
    return null;
  }

  try {
    const [hours, minutes] = String(item.cutoff_time)
      .split(":")
      .map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null;
    }

    // special_date = jis din customer order kar sakta hai
    const cutoff = new Date(
      `${item.special_date}T${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:00`
    );

    return cutoff;
  } catch {
    return null;
  }
};


const getCountdown = (item: any) => {
  const cutoff = getCutoff(item);

  if (!cutoff) {
    return {
      expired: false,
      text: "Order before cutoff",
    };
  }

  const diff = cutoff.getTime() - now;

  if (diff <= 0) {
    return {
      expired: true,
      text: "Cutoff closed",
    };
  }

  const totalSeconds = Math.floor(diff / 1000);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  return {
    expired: false,
    text:
      hours > 0
        ? `${hours}h ${String(minutes).padStart(2, "0")}m left`
        : `${minutes}m ${String(seconds).padStart(2, "0")}s left`,
  };
};



  // =========================
  // 🔥 CREATE
  // =========================

const handleCreate = async (e: any) => {
  e.preventDefault();

  if (creating) return;

  const token = localStorage.getItem("token");

  // Validation
  if (!formData.foodType) {
  toast.error("Please select food type");
  return;
}

if (!formData.dishName.trim()) {
  toast.error("Please enter dish name");
  return;
}

const price = Number(formData.price);
const originalPrice = formData.originalPrice
  ? Number(formData.originalPrice)
  : 0;

const maxPlates = Number(formData.maxPlates);

if (!price || price <= 0) {
  toast.error("Special price must be greater than ₹0");
  return;
}

if (originalPrice && originalPrice < price) {
  toast.error(
    "Original price should be greater than or equal to special price"
  );
  return;
}

if (!maxPlates || maxPlates <= 0) {
  toast.error("Maximum plates must be greater than 0");
  return;
}

if (!formData.specialDate) {
  toast.error("Please select special date");
  return;
}

const today = new Date();

const todayString =
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

if (formData.specialDate <= todayString) {
  toast.error("Special date must be tomorrow or a future date");
  return;
}

if (!formData.cutoffTime) {
  toast.error("Please select cutoff time");
  return;
}

  setCreating(true);

  try {
    toast.loading("Creating special...", {
      id: "create-special",
    });

    const form = new FormData();

    form.append("dish_name", formData.dishName);
form.append("description", formData.description);

form.append("price", formData.price);

if (formData.originalPrice) {
  form.append("original_price", formData.originalPrice);
}

form.append("max_plates", formData.maxPlates);
form.append("special_date", formData.specialDate);
form.append("cutoff_time", formData.cutoffTime);


if (formData.calories) {
  form.append("calories", formData.calories);
}

if (formData.protein) {
  form.append("protein", formData.protein);
}

if (formData.carbs) {
  form.append("carbs", formData.carbs);
}

if (formData.fats) {
  form.append("fats", formData.fats);
}

if (formData.preparationTime) {
  form.append("preparation_time", formData.preparationTime);
}

if (formData.ingredients) {
  form.append("ingredients", formData.ingredients);
}

form.append("food_type", formData.foodType);

    if (formData.image) {
      form.append("image", formData.image);
    }

    await axios.post(
      "https://chef-backend-qh12.onrender.com/tomorrow-special/",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Tomorrow Special created successfully ", {
      id: "create-special",
    });

    // Reset form
    setFormData({
  dishName: "",
  description: "",
  specialDate: "",
  price: "",
  originalPrice: "",
  maxPlates: "",
  cutoffTime: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  preparationTime: "",
  ingredients: "",
  foodType: "",
  image: null,
});

if (previewUrl) {
  URL.revokeObjectURL(previewUrl);
}

setPreviewUrl(null);

    fetchSpecials();

  } catch (err: any) {
    console.error("CREATE ERROR:", err);

    toast.error(
      err.response?.data?.detail || "Failed to create special",
      {
        id: "create-special",
      }
    );
  } finally {
    setCreating(false);
  }
};


const handleImageChange = (file: File | null) => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  if (!file) {
    setPreviewUrl(null);
    setField("image", null);
    return;
  }

  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be smaller than 5 MB");
    return;
  }

  setField("image", file);
  setPreviewUrl(URL.createObjectURL(file));
};

  // =========================
  // 🔥 PRE-ORDER
  // =========================
  

  

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-slate-900 pb-28">
      {/* PREMIUM HERO */}
      <section className="relative overflow-hidden bg-[#111114] text-white">
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/special-history")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/15"
            >
              📜 <span className="hidden sm:inline">Special History</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>

          <div className="mt-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
              <Flame size={14} /> Chef Special Studio
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Tomorrow, served <span className="text-orange-400">differently.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Create a limited-edition dish, set your availability, and make tomorrow&apos;s menu worth coming back for.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-400/15 text-orange-300">
                  <Clock3 size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">Live</p>
                  <p className="text-sm font-bold">Countdown enabled</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">Smart</p>
                  <p className="text-sm font-bold">Nutrition ready</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">
                  <Star size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">Premium</p>
                  <p className="text-sm font-bold">Chef-first presentation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        {/* EXISTING SPECIALS */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Your collection</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Tomorrow Specials</h2>
              <p className="mt-1 text-sm text-slate-500">Fresh drops, limited plates, chef-made.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm">
              <span className="text-orange-500">{specials.length}</span> active specials
            </div>
          </div>

          {specials.length === 0 ? (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="grid min-h-[330px] place-items-center px-6 py-12 text-center">
                <div>
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-orange-50 text-5xl shadow-inner">🍽️</div>
                  <h3 className="mt-5 text-xl font-black">Your special board is empty</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Create your first limited-edition dish below and give customers something special to pre-order.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {specials.map((item) => {
                const remaining = item.remaining ?? Math.max(0, Number(item.max_plates || 0) - Number(item.pre_orders || 0));
                const maxPlates = Number(item.max_plates || 0);
                const hasDiscount = Number(item.original_price || 0) > Number(item.price || 0);
                const discount = getDiscountPercent(item.original_price, item.price);
                const countdown = getCountdown(item);
                const soldPercent = maxPlates
                  ? Math.min(100, Math.max(0, ((maxPlates - remaining) / maxPlates) * 100))
                  : 0;

                return (
                  <article key={item.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-72 overflow-hidden bg-slate-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.dish_name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-violet-100 text-7xl">🍱</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-black shadow-lg ${item.food_type === "veg" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                          {item.food_type === "veg" ? "🌱 Veg" : "🍗 Non-Veg"}
                        </span>
                        {hasDiscount && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-emerald-600 shadow-lg">{discount}% OFF</span>}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Chef Special</p>
                          <h3 className="mt-1 text-2xl font-black leading-tight">{item.dish_name}</h3>
                        </div>
                        <div className="shrink-0 rounded-2xl bg-black/45 px-3 py-2 text-right backdrop-blur-md">
                          <p className="text-[10px] text-white/55">Rating</p>
                          <div className="mt-0.5 flex items-center gap-1 font-black"><Star size={13} className="fill-yellow-400 text-yellow-400" /> {ratings[item.chef_id]?.avg_rating || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap gap-2">
                        {item.special_date && <span className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">📅 {item.special_date}</span>}
                        {item.cutoff_time && <span className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">⏰ Till {item.cutoff_time}</span>}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-500">👨‍🍳 {item.chef_name || "Chef"}</p>
                        <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${countdown.expired ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-700"}`}>
                          <Clock3 size={14} /> {countdown.text}
                        </div>
                      </div>

                      {item.description && <p className="mt-4 text-sm leading-6 text-slate-500">{item.description}</p>}

                      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500">Plate availability</span>
                          <span className={remaining <= 5 ? "text-red-500" : "text-slate-800"}>{remaining} / {maxPlates} left</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all" style={{ width: `${soldPercent}%` }} />
                        </div>
                        {remaining > 0 && remaining <= 5 && <p className="mt-2 text-[11px] font-bold text-red-500">🔥 Only {remaining} plates remaining</p>}
                      </div>

                      {(item.calories != null || item.protein != null || item.carbs != null || item.fats != null) && (
                        <div className="mt-5">
                          <div className="mb-3 flex items-center gap-2 text-sm font-black"><Flame size={16} className="text-orange-500" /> Nutrition</div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {item.calories != null && <div className="rounded-2xl bg-orange-50 p-3 text-center"><p className="font-black text-orange-600">{item.calories}</p><p className="mt-1 text-[10px] text-slate-500">kcal</p></div>}
                            {item.protein != null && <div className="rounded-2xl bg-emerald-50 p-3 text-center"><p className="font-black text-emerald-600">{item.protein}g</p><p className="mt-1 text-[10px] text-slate-500">Protein</p></div>}
                            {item.carbs != null && <div className="rounded-2xl bg-sky-50 p-3 text-center"><p className="font-black text-sky-600">{item.carbs}g</p><p className="mt-1 text-[10px] text-slate-500">Carbs</p></div>}
                            {item.fats != null && <div className="rounded-2xl bg-violet-50 p-3 text-center"><p className="font-black text-violet-600">{item.fats}g</p><p className="mt-1 text-[10px] text-slate-500">Fats</p></div>}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
                        <div>
                          {hasDiscount && <p className="text-sm text-slate-400 line-through">₹{item.original_price}</p>}
                          <div className="flex items-center gap-2"><span className="text-3xl font-black text-slate-900">₹{item.price}</span>{hasDiscount && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">SAVE ₹{(Number(item.original_price) - Number(item.price)).toFixed(0)}</span>}</div>
                        </div>
                        <div className={`rounded-2xl px-4 py-3 text-center text-xs font-black ${countdown.expired || remaining <= 0 ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>
                          {countdown.expired ? "Ordering Closed" : remaining <= 0 ? "Sold Out" : "Accepting Orders"}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* CREATE STUDIO */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-500">Create something memorable</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Build tomorrow&apos;s signature dish</h2>
            <p className="mt-1 text-sm text-slate-500">Everything customers need to decide in one beautiful card.</p>
          </div>

          <form onSubmit={handleCreate} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            {/* LEFT */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-2xl">🍽️</div>
                  <div><h3 className="font-black">Dish identity</h3><p className="text-xs text-slate-500">Give your special a personality.</p></div>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Dish name — e.g. Royal Paneer Handi" value={formData.dishName} onChange={(e) => setField("dishName", e.target.value)} required className="h-12 rounded-2xl border-slate-200" />
                  <Textarea placeholder="Tell customers what makes this dish special..." value={formData.description} onChange={(e) => setField("description", e.target.value)} className="min-h-[125px] rounded-2xl border-slate-200" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100">📅</div><div><h3 className="font-black">Special date</h3><p className="text-[11px] text-slate-500">When customers order it</p></div></div>
                  <Input type="date" value={formData.specialDate} min={(() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); return tomorrow.toISOString().split("T")[0]; })()} onChange={(e) => setField("specialDate", e.target.value)} required className="h-12 rounded-2xl border-slate-200" />
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100">⏰</div><div><h3 className="font-black">Order cutoff</h3><p className="text-[11px] text-slate-500">Close pre-orders at</p></div></div>
                  <Input type="time" value={formData.cutoffTime} onChange={(e) => setField("cutoffTime", e.target.value)} required className="h-12 rounded-2xl border-slate-200" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-xl">💰</div><div><h3 className="font-black">Pricing strategy</h3><p className="text-xs text-slate-500">Make the value obvious.</p></div></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-xs font-bold text-slate-500">SPECIAL PRICE</label><Input type="number" min="1" step="0.01" placeholder="₹ Selling price" value={formData.price} onChange={(e) => setField("price", e.target.value)} required className="h-12 rounded-2xl border-slate-200" /></div>
                  <div><label className="mb-2 block text-xs font-bold text-slate-500">ORIGINAL PRICE</label><Input type="number" min="1" step="0.01" placeholder="₹ Original price" value={formData.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} className="h-12 rounded-2xl border-slate-200" /></div>
                </div>
                {formData.originalPrice && formData.price && Number(formData.originalPrice) > Number(formData.price) && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">🎉 Customer saves ₹{(Number(formData.originalPrice) - Number(formData.price)).toFixed(2)} · {getDiscountPercent(formData.originalPrice, formData.price)}% OFF</div>}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-xl">📦</div><div><h3 className="font-black">Availability</h3><p className="text-xs text-slate-500">Create healthy scarcity.</p></div></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-xs font-bold text-slate-500">MAXIMUM PLATES</label><Input type="number" min="1" placeholder="e.g. 30" value={formData.maxPlates} onChange={(e) => setField("maxPlates", e.target.value)} required className="h-12 rounded-2xl border-slate-200" /></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Clock3 size={15} className="text-orange-500" /> Order window</div><p className="mt-2 text-xs leading-5 text-slate-500">Customers can pre-order until your cutoff time.</p></div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-xl">🥗</div><div><h3 className="font-black">Nutrition snapshot</h3><p className="text-xs text-slate-500">Optional, but adds trust.</p></div></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Input type="number" min="0" placeholder="Calories" value={formData.calories} onChange={(e) => setField("calories", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                  <Input type="number" min="0" step="0.1" placeholder="Protein g" value={formData.protein} onChange={(e) => setField("protein", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                  <Input type="number" min="0" step="0.1" placeholder="Carbs g" value={formData.carbs} onChange={(e) => setField("carbs", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                  <Input type="number" min="0" step="0.1" placeholder="Fats g" value={formData.fats} onChange={(e) => setField("fats", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-xl">🍳</div><div><h3 className="font-black">Kitchen details</h3><p className="text-xs text-slate-500">Help customers understand the craft.</p></div></div>
                <div className="space-y-4">
                  <Input type="number" min="0" placeholder="Preparation time (minutes)" value={formData.preparationTime} onChange={(e) => setField("preparationTime", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                  <Textarea placeholder="Ingredients — Rice, Dal, Paneer, Tomato..." value={formData.ingredients} onChange={(e) => setField("ingredients", e.target.value)} className="min-h-[115px] rounded-2xl border-slate-200" />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6 lg:sticky lg:top-5 lg:self-start">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Visual identity</p><h3 className="mt-1 text-xl font-black">Make them hungry first.</h3></div>
                {!previewUrl ? (
                  <label className="m-5 flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-orange-300 hover:bg-orange-50/40 sm:m-6">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-orange-500"><Upload size={28} /></div>
                    <p className="mt-5 font-black">Upload dish hero image</p>
                    <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">Use a bright, appetizing photo. JPG, PNG or WEBP · Max 5 MB.</p>
                    <span className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Choose image</span>
                    <Input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e: any) => handleImageChange(e.target.files?.[0] || null)} />
                  </label>
                ) : (
                  <div className="relative m-5 overflow-hidden rounded-[1.5rem] sm:m-6">
                    <img src={previewUrl} alt="Dish preview" className="h-[330px] w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white"><p className="text-xs font-bold">✓ Image selected</p><p className="mt-1 text-lg font-black">Your dish is ready to shine.</p></div>
                    <button type="button" onClick={() => handleImageChange(null)} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"><X size={18} /></button>
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Food identity</p><h3 className="mt-1 font-black">Choose your style</h3></div><Leaf size={19} className="text-emerald-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setField("foodType", "veg")} className={`rounded-2xl border-2 p-4 text-left transition ${formData.foodType === "veg" ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-slate-50 hover:border-emerald-200"}`}><span className="text-xl">🌱</span><p className="mt-2 text-sm font-black">Vegetarian</p><p className="mt-1 text-[10px] text-slate-500">Fresh & green</p></button>
                  <button type="button" onClick={() => setField("foodType", "non-veg")} className={`rounded-2xl border-2 p-4 text-left transition ${formData.foodType === "non-veg" ? "border-red-500 bg-red-50" : "border-slate-100 bg-slate-50 hover:border-red-200"}`}><span className="text-xl">🍗</span><p className="mt-2 text-sm font-black">Non-Veg</p><p className="mt-1 text-[10px] text-slate-500">Rich & hearty</p></button>
                </div>
                {!formData.foodType && <p className="mt-3 text-[11px] font-semibold text-red-500">Select a food type before publishing.</p>}
              </div>

              <div className="overflow-hidden rounded-[2rem] bg-[#111114] p-6 text-white shadow-xl sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Ready to launch?</p>
                <h3 className="mt-2 text-2xl font-black">Publish your special.</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">Your dish will be sent with the same secure Tomorrow Special flow already connected to your backend.</p>
                <Button type="submit" disabled={creating} className="mt-6 h-14 w-full rounded-2xl bg-orange-500 text-base font-black text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600">
                  {creating ? "Creating Special..." : "✨ Create Tomorrow Special"}
                </Button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
