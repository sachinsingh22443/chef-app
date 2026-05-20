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
  baseURL: "https://chef-backend-qh12.onrender.com",
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
        
        
        {/* बाकी पूरा UI SAME रहेगा (unchanged) */}

        <Button className="w-full py-6 bg-orange-500 text-white">
          Update Menu Item
        </Button>
      </form>
    </div>
  );
}