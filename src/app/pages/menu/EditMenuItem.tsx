import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

const API = axios.create({
  baseURL: "https://chef-backend-1.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function EditMenuItem() {
  const navigate = useNavigate();
  const { itemId } = useParams();

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

  // 🔥 FIXED: string + File support
  const [images, setImages] = useState<(string | File)[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  const categories = ["Healthy", "Protein-Rich", "Tiffin", "Special Diet"];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await API.get("/menu");
      const item = res.data.find((i: any) => i.id === itemId);
      if (!item) return;

      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: String(item.price || ""),
        prepTime: String(item.prep_time || ""),
        foodType: item.food_type || "vegetarian",
        category: item.category || "",
        calories: String(item.calories || ""),
        protein: String(item.protein || ""),
        carbs: String(item.carbs || ""),
        fats: String(item.fats || ""),
        quantity: String(item.quantity || ""),
        inStock: item.quantity > 0,
        isPublic: true,
        hasDiscount: false,
        discountPrice: "",
        ingredients: item.ingredients || [],
      });

      setImages(item.image_urls || []);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 IMAGE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (images.length + files.length > 5) {
        toast.error("Max 5 images allowed");
        return;
      }

      setImages([...images, ...files]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()],
      }));
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // 🔥 FINAL FIXED SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

      // 🔥 ONLY NEW FILES UPLOAD
      images.forEach((img) => {
        if (img instanceof File) {
          form.append("images", img);
        }
      });

      await API.put(`/menu/${itemId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Menu item updated successfully!");
      navigate("/menu");

    } catch (err: any) {
      console.log(err.response?.data);
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-b-[40px] p-6 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center text-white mb-4">
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white">Edit Menu Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

        {/* 🔥 IMAGE SECTION */}
        <div className="bg-white p-5 rounded-3xl shadow">
          <Label>Dish Photos</Label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
        </div>

        {/* बाकी पूरा UI SAME रहेगा (unchanged) */}

        <Button className="w-full py-6 bg-orange-500 text-white">
          Update Menu Item
        </Button>
      </form>
    </div>
  );
}