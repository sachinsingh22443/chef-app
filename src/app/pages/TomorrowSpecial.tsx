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

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [historyDate, setHistoryDate] = useState("");
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");


  const fetchHistory = async () => {
  try {
    setHistoryLoading(true);

    const token = localStorage.getItem("token");

    let url =
      "https://chef-backend-qh12.onrender.com/tomorrow-special/history";

    const params = new URLSearchParams();

    if (historyDate) {
      params.append("date_filter", historyDate);
    } else {
      if (historyFromDate) {
        params.append("from_date", historyFromDate);
      }

      if (historyToDate) {
        params.append("to_date", historyToDate);
      }
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setHistory(res.data.specials || []);
  } catch (err: any) {
    console.error("HISTORY ERROR:", err);

    toast.error(
      err.response?.data?.detail ||
      "Failed to load special history"
    );
  } finally {
    setHistoryLoading(false);
  }
};

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
  <div className="min-h-screen bg-[#FFF8F0] pb-24">

    {/* ===================================================== */}
    {/* HEADER */}
    {/* ===================================================== */}

    <div className="bg-gradient-to-br from-[#FF7A30] via-[#5F2EEA] to-[#0FAD6E] p-6 text-white">

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-medium"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      <div className="mt-5">
        <p className="text-white/80 text-sm">
          Exclusive Chef Collection
        </p>

        <h1 className="text-3xl font-bold mt-1">
          Tomorrow Specials
        </h1>

        <p className="text-white/80 text-sm mt-2">
          Limited dishes prepared specially for tomorrow
        </p>
      </div>

    </div>


    {/* ===================================================== */}
    {/* SPECIALS LIST */}
    {/* ===================================================== */}

    <div className="p-6">

      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="font-bold text-xl text-gray-900">
            ⭐ Tomorrow Specials
          </h2>


  

  <div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() => {
      setShowHistory(true);
      fetchHistory();
    }}
    className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-2 rounded-xl hover:bg-purple-200 transition"
  >
    📜 History
  </button>

  <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full">
    {specials.length} Specials
  </span>

</div>




          <p className="text-xs text-gray-500 mt-1">
            Fresh • Limited • Chef Special
          </p>
        </div>

       

      </div>


      {/* EMPTY STATE */}

      {specials.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">

          <div className="text-6xl mb-4">
            🍽️
          </div>

          <h3 className="font-bold text-gray-900">
            No Tomorrow Specials
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Create your first special dish for tomorrow.
          </p>

        </div>
      )}


      {/* ===================================================== */}
      {/* SPECIAL CARDS */}
      {/* ===================================================== */}

      <div className="space-y-6">

        {specials.map((item) => {

          const remaining =
            item.remaining ??
            Math.max(
              0,
              Number(item.max_plates || 0) -
                Number(item.pre_orders || 0)
            );

          const maxPlates =
            Number(item.max_plates || 0);

          const hasDiscount =
            Number(item.original_price || 0) >
            Number(item.price || 0);

          const discount =
            getDiscountPercent(
              item.original_price,
              item.price
            );

          const countdown =
            getCountdown(item);

          const soldPercent =
            maxPlates
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((maxPlates - remaining) /
                      maxPlates) *
                      100
                  )
                )
              : 0;


          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100"
            >

              {/* ================================================= */}
              {/* IMAGE */}
              {/* ================================================= */}

              <div className="relative">

                {item.image_url ? (

                  <img
                    src={item.image_url}
                    alt={item.dish_name}
                    className="w-full h-60 object-cover"
                  />

                ) : (

                  <div className="w-full h-60 bg-gradient-to-br from-orange-100 via-purple-100 to-green-100 flex items-center justify-center">
                    <span className="text-7xl">
                      🍱
                    </span>
                  </div>

                )}


                {/* FOOD TYPE */}

                <div className="absolute top-4 left-4">

                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                      item.food_type === "veg"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.food_type === "veg"
                      ? "🌱 Veg"
                      : "🍗 Non-Veg"}
                  </span>

                </div>


                {/* PREMIUM BADGE */}

                <div className="absolute top-4 left-1/2 -translate-x-1/2">

                  <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow">
                    ✨ CHEF SPECIAL
                  </span>

                </div>


                {/* DISCOUNT */}

                {hasDiscount && (
                  <div className="absolute top-4 right-4">

                    <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow">
                      {discount}% OFF
                    </span>

                  </div>
                )}


                {/* LIMITED STOCK */}

                {remaining > 0 && remaining <= 5 && (

                  <div className="absolute bottom-4 left-4">

                    <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow">
                      🔥 Only {remaining} left
                    </span>

                  </div>

                )}

              </div>


              {/* ================================================= */}
              {/* CONTENT */}
              {/* ================================================= */}

              <div className="p-5">

                {/* DISH NAME */}

                <h3 className="text-2xl font-bold text-gray-900">
  {item.dish_name}
</h3>

{item.special_date && (
  <div className="flex flex-wrap items-center gap-3 mt-2">
    <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
      📅 Special Date: {item.special_date}
    </span>

    {item.cutoff_time && (
      <span className="text-xs font-semibold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
        ⏰ Order till {item.cutoff_time}
      </span>
    )}
  </div>
)}

                {/* CHEF + RATING */}

                <div className="flex items-center gap-2 mt-2">

                  <p className="text-sm text-gray-500">
                    👨‍🍳 {item.chef_name || "Chef"}
                  </p>

                  <span className="text-gray-300">
                    •
                  </span>

                  <div className="flex items-center gap-1 text-sm">

                    <Star
                      size={15}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold text-gray-700">
                      {ratings[item.chef_id]?.avg_rating || 0}
                    </span>

                  </div>

                </div>


                {/* DESCRIPTION */}

                {item.description && (

                  <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                    {item.description}
                  </p>

                )}


                {/* ================================================= */}
                {/* COUNTDOWN */}
                {/* ================================================= */}

                <div
                  className={`mt-4 rounded-2xl p-3 flex items-center justify-between ${
                    countdown.expired
                      ? "bg-gray-100 text-gray-500"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <Clock3 size={17} />

                    <span className="text-xs font-semibold">
                      {countdown.expired
                        ? "Ordering closed"
                        : "Order window"}
                    </span>

                  </div>

                  <span className="text-xs font-bold">
                    {countdown.text}
                  </span>

                </div>


                {/* ================================================= */}
                {/* NUTRITION */}
                {/* ================================================= */}

                {(item.calories != null ||
                  item.protein != null ||
                  item.carbs != null ||
                  item.fats != null) && (

                  <div className="mt-5">

                    <div className="flex items-center gap-2 mb-3">

                      <Flame
                        size={17}
                        className="text-orange-500"
                      />

                      <h4 className="font-bold text-sm text-gray-800">
                        Nutrition
                      </h4>

                    </div>


                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                      {/* CALORIES */}

                      {item.calories != null && (

                        <div className="bg-orange-50 rounded-2xl p-3 text-center">

                          <p className="text-sm font-bold text-orange-600">
                            {item.calories}
                          </p>

                          <p className="text-[10px] text-gray-500 mt-1">
                            kcal
                          </p>

                        </div>

                      )}


                      {/* PROTEIN */}

                      {item.protein != null && (

                        <div className="bg-green-50 rounded-2xl p-3 text-center">

                          <p className="text-sm font-bold text-green-600">
                            {item.protein}g
                          </p>

                          <p className="text-[10px] text-gray-500 mt-1">
                            Protein
                          </p>

                        </div>

                      )}


                      {/* CARBS */}

                      {item.carbs != null && (

                        <div className="bg-blue-50 rounded-2xl p-3 text-center">

                          <p className="text-sm font-bold text-blue-600">
                            {item.carbs}g
                          </p>

                          <p className="text-[10px] text-gray-500 mt-1">
                            Carbs
                          </p>

                        </div>

                      )}


                      {/* FATS */}

                      {item.fats != null && (

                        <div className="bg-purple-50 rounded-2xl p-3 text-center">

                          <p className="text-sm font-bold text-purple-600">
                            {item.fats}g
                          </p>

                          <p className="text-[10px] text-gray-500 mt-1">
                            Fats
                          </p>

                        </div>

                      )}

                    </div>

                  </div>

                )}


                {/* ================================================= */}
                {/* PREPARATION */}
                {/* ================================================= */}

                {item.preparation_time != null && (

                  <div className="flex items-center gap-2 mt-5 bg-gray-50 rounded-2xl p-3">

                    <Timer
                      size={18}
                      className="text-orange-500"
                    />

                    <span className="text-sm text-gray-600">
                      Preparation:
                    </span>

                    <strong className="text-sm text-gray-900">
                      {item.preparation_time} min
                    </strong>

                  </div>

                )}


                {/* ================================================= */}
                {/* INGREDIENTS */}
                {/* ================================================= */}

                {item.ingredients && (

                  <div className="mt-5">

                    <div className="flex items-center gap-2">

                      <Leaf
                        size={17}
                        className="text-green-600"
                      />

                      <p className="text-sm font-bold text-gray-800">
                        Ingredients
                      </p>

                    </div>

                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {item.ingredients}
                    </p>

                  </div>

                )}


                {/* ================================================= */}
                {/* PRICE + ORDER */}
                {/* ================================================= */}

                <div className="flex items-end justify-between gap-4 mt-6">

                  {/* PRICE */}

                  <div>

                    {hasDiscount && (

                      <p className="text-sm text-gray-400 line-through">
                        ₹{item.original_price}
                      </p>

                    )}

                    <div className="flex items-center gap-2 flex-wrap">

                      <span className="text-3xl font-bold text-orange-500">
                        ₹{item.price}
                      </span>

                      {hasDiscount && (

                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
                          Special Price
                        </span>

                      )}

                    </div>

                  </div>


                  {/* PRE ORDER */}

                  
                <div
  className={`px-5 py-3 rounded-2xl font-bold text-sm ${
    remaining <= 0 || countdown.expired
      ? "bg-gray-100 text-gray-500"
      : "bg-green-50 text-green-700"
  }`}
>
  {countdown.expired
    ? "Ordering Closed"
    : remaining <= 0
    ? "Sold Out"
    : "Accepting Orders"}
</div>

                </div>


                {/* ================================================= */}
                {/* INVENTORY */}
                {/* ================================================= */}

                <div className="mt-5">

                  <div className="flex justify-between text-xs text-gray-500 mb-2">

                    <span>
                      Plates available
                    </span>

                    <span className="font-semibold">
                      {remaining}/{maxPlates}
                    </span>

                  </div>


                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-[#FF7A30] to-[#0FAD6E] rounded-full transition-all duration-500"
                      style={{
                        width: `${soldPercent}%`,
                      }}
                    />

                  </div>


                  <p className="text-[10px] text-gray-400 mt-2">
                    {remaining > 0
                      ? `${remaining} plates still available`
                      : "All plates sold"}
                  </p>

                </div>

              </div>

            </div>
          );

        })}

      </div>

    </div>

   {/* ===================================================== */}
{/* 📜 MY SPECIAL HISTORY */}
{/* ===================================================== */}

{showHistory && (
  <div className="mt-8 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">

    {/* HEADER */}
    <div className="flex items-center justify-between gap-3 mb-5">

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          📜 My Special History
        </h2>

        <p className="text-xs text-gray-500 mt-1">
          View your previous Tomorrow Specials
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowHistory(false)}
        className="text-sm font-semibold text-gray-500 hover:text-gray-900"
      >
        ✕ Close
      </button>

    </div>


    {/* FILTER */}
    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">

      {/* SPECIFIC DATE */}
      <div>
        <label className="text-xs font-semibold text-gray-600">
          Specific Date
        </label>

        <input
          type="date"
          value={historyDate}
          onChange={(e) => {
            setHistoryDate(e.target.value);

            if (e.target.value) {
              setHistoryFromDate("");
              setHistoryToDate("");
            }
          }}
          className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white"
        />
      </div>


      {/* DATE RANGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <div>
          <label className="text-xs font-semibold text-gray-600">
            From Date
          </label>

          <input
            type="date"
            value={historyFromDate}
            onChange={(e) => {
              setHistoryFromDate(e.target.value);
              setHistoryDate("");
            }}
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white"
          />
        </div>


        <div>
          <label className="text-xs font-semibold text-gray-600">
            To Date
          </label>

          <input
            type="date"
            value={historyToDate}
            onChange={(e) => {
              setHistoryToDate(e.target.value);
              setHistoryDate("");
            }}
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white"
          />
        </div>

      </div>


      {/* BUTTONS */}
      <div className="flex gap-2">

        <button
          type="button"
          onClick={fetchHistory}
          disabled={historyLoading}
          className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm"
        >
          {historyLoading ? "Loading..." : "Apply Filter"}
        </button>

        <button
          type="button"
          onClick={() => {
            setHistoryDate("");
            setHistoryFromDate("");
            setHistoryToDate("");
            setTimeout(fetchHistory, 0);
          }}
          className="px-4 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm"
        >
          Reset
        </button>

      </div>

    </div>


    {/* HISTORY LIST */}
    <div className="mt-5 space-y-4">

      {historyLoading ? (

        <div className="text-center py-8 text-sm text-gray-500">
          Loading history...
        </div>

      ) : history.length === 0 ? (

        <div className="text-center py-8">

          <div className="text-5xl mb-3">
            📭
          </div>

          <p className="font-semibold text-gray-700">
            No special history found
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Try another date or date range.
          </p>

        </div>

      ) : (

        history.map((item: any) => {

          const totalPlates =
            Number(item.max_plates || 0);

          const orderedPlates =
            Number(item.pre_orders || 0);

          const remainingPlates =
            Math.max(
              0,
              totalPlates - orderedPlates
            );

          return (
            <div
              key={item.id}
              className="border border-gray-100 rounded-2xl p-4"
            >

              <div className="flex gap-4">

                {/* IMAGE */}
                {item.image_url ? (

                  <img
                    src={item.image_url}
                    alt={item.dish_name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />

                ) : (

                  <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                    🍱
                  </div>

                )}


                {/* INFO */}
                <div className="flex-1 min-w-0">

                  <div className="flex items-start justify-between gap-2">

                    <h3 className="font-bold text-gray-900">
                      {item.dish_name}
                    </h3>

                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        remainingPlates <= 0
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {remainingPlates <= 0
                        ? "SOLD OUT"
                        : "AVAILABLE"}
                    </span>

                  </div>


                  <p className="text-xs text-gray-500 mt-1">
                    📅 {item.special_date}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    ⏰ Order till {item.cutoff_time}
                  </p>

                  <p className="text-sm font-bold text-orange-600 mt-2">
                    ₹{item.price}
                  </p>

                </div>

              </div>


              {/* PLATES */}
              <div className="mt-4 bg-gray-50 rounded-xl p-3">

                <div className="flex justify-between text-xs">

                  <span className="text-gray-500">
                    Plates
                  </span>

                  <span className="font-bold text-gray-800">
                    {orderedPlates} ordered / {totalPlates}
                  </span>

                </div>

                <div className="flex justify-between text-xs mt-1">

                  <span className="text-gray-500">
                    Remaining
                  </span>

                  <span className="font-bold text-gray-800">
                    {remainingPlates}
                  </span>

                </div>

              </div>

            </div>
          );

        })

      )}

    </div>

  </div>
)}
    {/* ===================================================== */}
    {/* ADD SPECIAL FORM */}
    {/* ===================================================== */}

    <form
      onSubmit={handleCreate}
      className="px-6 space-y-4"
    >

      {/* FORM HEADER */}

      <div className="bg-gradient-to-br from-[#FF7A30] to-[#5F2EEA] text-white rounded-3xl p-6 shadow">

        <p className="text-white/80 text-xs font-semibold">
          CHEF DASHBOARD
        </p>

        <h2 className="text-2xl font-bold mt-1">
          ➕ Create Tomorrow Special
        </h2>

        <p className="text-white/80 text-sm mt-2">
          Add an exclusive premium dish for tomorrow
        </p>

      </div>


      {/* ================================================= */}
      {/* DISH DETAILS */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

        <h3 className="font-bold text-gray-900">
          🍽️ Dish Details
        </h3>

        <Input
          placeholder="Dish Name"
          value={formData.dishName}
          onChange={(e) =>
            setField(
              "dishName",
              e.target.value
            )
          }
          required
        />

        <Textarea
          placeholder="Describe your special dish..."
          value={formData.description}
          onChange={(e) =>
            setField(
              "description",
              e.target.value
            )
          }
          className="min-h-[100px]"
        />

      </div>


      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

  <div>
    <h3 className="font-bold text-gray-900">
      📅 Special Date
    </h3>

    <p className="text-xs text-gray-500 mt-1">
      Select the date for which customers can order this special.
    </p>
  </div>

  <Input
    type="date"
    value={formData.specialDate}
    min={(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
})()}
    onChange={(e) =>
      setField("specialDate", e.target.value)
    }
    required
  />

</div>


      {/* ================================================= */}
      {/* PRICING */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

        <div>

          <h3 className="font-bold text-gray-900">
            💰 Pricing
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Set your special selling price and original price.
          </p>

        </div>


        <Input
          type="number"
          min="1"
          step="0.01"
          placeholder="Special Price (₹)"
          value={formData.price}
          onChange={(e) =>
            setField(
              "price",
              e.target.value
            )
          }
          required
        />


        <Input
          type="number"
          min="1"
          step="0.01"
          placeholder="Original Price (₹)"
          value={formData.originalPrice}
          onChange={(e) =>
            setField(
              "originalPrice",
              e.target.value
            )
          }
        />


        {formData.originalPrice &&
          formData.price &&
          Number(formData.originalPrice) >
            Number(formData.price) && (

          <div className="bg-green-50 text-green-700 rounded-xl p-3 text-xs font-semibold">

            🎉 Customer saves ₹
            {(
              Number(formData.originalPrice) -
              Number(formData.price)
            ).toFixed(2)}

            {" "}(
            {getDiscountPercent(
              formData.originalPrice,
              formData.price
            )}
            % OFF)

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* QUANTITY & TIMING */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

        <div>

          <h3 className="font-bold text-gray-900">
            📦 Availability & Timing
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Control the number of plates and ordering cutoff.
          </p>

        </div>


        <Input
          type="number"
          min="1"
          placeholder="Maximum Plates"
          value={formData.maxPlates}
          onChange={(e) =>
            setField(
              "maxPlates",
              e.target.value
            )
          }
          required
        />


        <Input
          type="time"
          value={formData.cutoffTime}
          onChange={(e) =>
            setField(
              "cutoffTime",
              e.target.value
            )
          }
          required
        />


        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-2 text-xs text-orange-700">

          <Clock3 size={16} />

          <span>
            Customers can pre-order until this cutoff time.
          </span>

        </div>

      </div>


      {/* ================================================= */}
      {/* NUTRITION */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

        <div>

          <h3 className="font-bold text-gray-900">
            🥗 Nutrition Information
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Add nutritional information to make your special more premium.
          </p>

        </div>


        <div className="grid grid-cols-2 gap-3">

          <Input
            type="number"
            min="0"
            placeholder="Calories (kcal)"
            value={formData.calories}
            onChange={(e) =>
              setField(
                "calories",
                e.target.value
              )
            }
          />


          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="Protein (g)"
            value={formData.protein}
            onChange={(e) =>
              setField(
                "protein",
                e.target.value
              )
            }
          />


          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="Carbs (g)"
            value={formData.carbs}
            onChange={(e) =>
              setField(
                "carbs",
                e.target.value
              )
            }
          />


          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="Fats (g)"
            value={formData.fats}
            onChange={(e) =>
              setField(
                "fats",
                e.target.value
              )
            }
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* PREPARATION & INGREDIENTS */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

        <h3 className="font-bold text-gray-900">
          🍳 Preparation & Ingredients
        </h3>


        <Input
          type="number"
          min="0"
          placeholder="Preparation Time (minutes)"
          value={formData.preparationTime}
          onChange={(e) =>
            setField(
              "preparationTime",
              e.target.value
            )
          }
        />


        <Textarea
          placeholder="Ingredients (e.g. Rice, Dal, Paneer, Tomato...)"
          value={formData.ingredients}
          onChange={(e) =>
            setField(
              "ingredients",
              e.target.value
            )
          }
          className="min-h-[110px]"
        />

      </div>


      {/* ================================================= */}
      {/* FOOD TYPE */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">

        <h3 className="font-bold text-gray-900">
          🌱 Food Type
        </h3>


        <select
          value={formData.foodType}
          onChange={(e) =>
            setField(
              "foodType",
              e.target.value
            )
          }
          className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        >

          <option value="">
            Select Food Type
          </option>

          <option value="veg">
            🌱 Veg
          </option>

          <option value="non-veg">
            🍗 Non-Veg
          </option>

        </select>

      </div>


      {/* ================================================= */}
      {/* IMAGE */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">

        <div>

          <h3 className="font-bold text-gray-900">
            📸 Dish Image
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Upload a clear image of your special dish.
          </p>

        </div>


        {!previewUrl ? (

          <label className="border-2 border-dashed border-gray-200 rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 transition">

            <Upload
              className="text-orange-500 mb-3"
              size={30}
            />

            <span className="text-sm font-semibold text-gray-700">
              Choose dish image
            </span>

            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG, WEBP • Max 5 MB
            </span>


            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e: any) =>
                handleImageChange(
                  e.target.files?.[0] || null
                )
              }
            />

          </label>

        ) : (

          <div className="relative overflow-hidden rounded-2xl">

            <img
              src={previewUrl}
              alt="Dish preview"
              className="w-full h-60 object-cover"
            />


            <button
              type="button"
              onClick={() =>
                handleImageChange(null)
              }
              className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
            >
              <X size={17} />
            </button>


            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs">
              ✓ Image selected
            </div>

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* CREATE BUTTON */}
      {/* ================================================= */}

      <Button
        type="submit"
        disabled={creating}
        className="w-full h-14 rounded-2xl text-base font-bold shadow-lg"
      >
        {creating
          ? "Creating Special..."
          : "✨ Create Tomorrow Special"}
      </Button>


      {/* BOTTOM SPACE */}

      <div className="h-8" />

    </form>

    </div>
);
}