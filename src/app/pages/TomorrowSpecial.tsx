import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function TomorrowSpecial() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>({
    dishName: "",
    description: "",
    price: "",
    maxPlates: "",
    cutoffTime: "",
    foodType: "",   // ✅ NO DEFAULT
    image: null,
  });

  const [specials, setSpecials] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any>({});

  useEffect(() => {
    fetchSpecials();
  }, []);

  // =========================
  // 🔥 FETCH SPECIALS
  // =========================
  const fetchSpecials = async () => {
    try {
      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/tomorrow-special/all"
      );

      setSpecials(res.data);

      res.data.forEach((item: any) => {
        fetchRating(item.chef_id);
      });

    } catch (err) {
      console.error("Fetch error", err);
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

  // =========================
  // 🔥 CREATE
  // =========================
  const handleCreate = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    // 🔥 VALIDATION
    if (!formData.foodType) {
      toast.error("Please select food type");
      return;
    }

    try {
      const form = new FormData();

      form.append("dish_name", formData.dishName);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("max_plates", formData.maxPlates);
      form.append("cutoff_time", formData.cutoffTime);
      form.append("food_type", formData.foodType); // ✅ FIX

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

      toast.success("Created successfully");

      // 🔥 RESET FORM
      setFormData({
        dishName: "",
        description: "",
        price: "",
        maxPlates: "",
        cutoffTime: "",
        foodType: "",
        image: null,
      });

      fetchSpecials();

    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error creating special");
    }
  };

  // =========================
  // 🔥 PRE-ORDER
  // =========================
  const handlePreOrder = async (id: string) => {
    try {
      await axios.post(
        "https://chef-backend-qh12.onrender.com/tomorrow-special/pre-order",
        {
          special_id: id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Pre-order success");
      fetchSpecials();

    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error");
    }
  };

  const isValidTime = (item: any) => {
    try {
      const now = new Date();
      const createdDate = new Date(item.created_at || Date.now());

      const [hours, minutes] = item.cutoff_time.split(":");

      const cutoff = new Date(createdDate);
      cutoff.setHours(Number(hours));
      cutoff.setMinutes(Number(minutes));
      cutoff.setSeconds(0);

      return now <= cutoff;
    } catch {
      return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-24">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#FF7A30] via-[#5F2EEA] to-[#0FAD6E] p-6 text-white">
        <button onClick={() => navigate(-1)} className="flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold mt-2">Tomorrow Specials</h1>
      </div>

      {/* LIST */}
      <div className="p-6">
        <h2 className="font-bold mb-4">⭐ Tomorrow Specials</h2>

        {specials.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow mb-4">
            <img src={item.image_url} className="w-full h-52 object-cover" />

            <div className="p-4">
              <h3 className="font-bold">{item.dish_name}</h3>

              <p className="text-sm text-gray-500">
                👨‍🍳 {item.chef_name} ⭐ {ratings[item.chef_id]?.avg_rating || 0}
              </p>

              <p className="text-sm mt-2">{item.description}</p>

              {/* 🔥 FOOD TYPE BADGE */}
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {item.food_type}
              </span>

              <div className="flex justify-between mt-3">
                <span>₹{item.price}</span>

                <button
                  onClick={() => handlePreOrder(item.id)}
                  className="bg-orange-500 text-white px-4 py-1 rounded"
                >
                  Pre-Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={handleCreate} className="px-6 space-y-3">

        <h2 className="font-bold">➕ Add Special</h2>

        <Input
          placeholder="Dish"
          value={formData.dishName}
          onChange={(e) =>
            setFormData({ ...formData, dishName: e.target.value })
          }
        />

        <Textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <Input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
        />

        <Input
          type="number"
          placeholder="Max Plates"
          value={formData.maxPlates}
          onChange={(e) =>
            setFormData({ ...formData, maxPlates: e.target.value })
          }
        />

        <Input
          type="time"
          value={formData.cutoffTime}
          onChange={(e) =>
            setFormData({ ...formData, cutoffTime: e.target.value })
          }
        />

        {/* 🔥 FOOD TYPE SELECT */}
        <select
          value={formData.foodType}
          onChange={(e) =>
            setFormData({ ...formData, foodType: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Food Type</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
        </select>

        <Input
          type="file"
          onChange={(e: any) =>
            setFormData({ ...formData, image: e.target.files[0] })
          }
        />

        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}