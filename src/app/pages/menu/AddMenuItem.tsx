import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";

const API = axios.create({
  baseURL: "https://chef-backend-1.onrender.com",
});

// 🔥 TOKEN ATTACH
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

  const categories = ["Healthy", "Protein-Rich", "Tiffin", "Special Diet"];

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

  // 🔥 INGREDIENT ADD
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  // 🔥 SUBMIT
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

      // ✅ ingredients safe
      if (formData.ingredients.length > 0) {
        form.append("ingredients", formData.ingredients.join(","));
      }

      // 🔥 IMPORTANT FIX (IMAGE SEND)
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


  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-b-[40px] p-6 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Add Menu Item</h1>
        <p className="text-white/90">Share your delicious creation</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

        {/* ⚠️ UI SAME रखा गया है */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <Label className="text-gray-800 font-medium mb-3 block">Dish Photos</Label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-orange-400 transition-colors">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Upload dish photo</span>
            <span className="text-xs text-gray-400 mt-1">Max 5 images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

       


       {/* Basic Info */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-800 font-medium">Dish Name</Label>
            <Input
              id="name"
              placeholder="e.g., Rajasthani Thali"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-800 font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your dish..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-gray-800 font-medium">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="249"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="prepTime" className="text-gray-800 font-medium">Prep Time (min)</Label>
              <Input
                id="prepTime"
                type="number"
                placeholder="30"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity" className="text-gray-800 font-medium">Available Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="50"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Set 0 to mark as out of stock</p>
          </div>
        </div>



       
       {/* Food Type */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <Label className="text-gray-800 font-medium mb-3 block">Food Type</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, foodType: "vegetarian" })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.foodType === "vegetarian"
                  ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Vegetarian
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, foodType: "non-veg" })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.foodType === "non-veg"
                  ? "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>

        {/* Nutritional Information */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-5 shadow-lg text-white">
          <h3 className="font-bold mb-4">Nutritional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories" className="text-white/90 text-sm">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="450"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <Label htmlFor="protein" className="text-white/90 text-sm">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="25"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <Label htmlFor="carbs" className="text-white/90 text-sm">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                placeholder="60"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <Label htmlFor="fats" className="text-white/90 text-sm">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                placeholder="15"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>
          </div>
        </div>





        {/* Category */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <Label className="text-gray-800 font-medium mb-3 block">Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  formData.category === cat
                    ? cat === "Healthy"
                      ? "bg-orange-500 text-white"
                      : cat === "Protein-Rich"
                      ? "bg-gray-700 text-white"
                      : cat === "Tiffin"
                      ? "bg-purple-500 text-white"
                      : "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <Label className="text-gray-800 font-medium mb-3 block">Ingredients</Label>
          
          {/* Added Ingredients */}
          {formData.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg"
                >
                  <span className="text-sm">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Ingredient */}
          <div className="flex gap-2">
            <Input
              placeholder="Add ingredient"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIngredient();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* बाकी पूरा UI SAME रहेगा (unchanged) */}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 z-50">
          <div className="max-w-md mx-auto">
            
          </div>
        </div>


        {/* 🔥 बाकी पूरा तुम्हारा UI untouched है */}
        
        <Button
          type="submit"
          className="w-full py-6 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-lg font-medium"
        >
          Add Menu Item
        </Button>
      </form>
    </div>
  );
}