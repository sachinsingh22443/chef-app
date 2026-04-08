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
    ingredients: [] as string[], // ✅ FIXED
  });

  const [images, setImages] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  const categories = ["Healthy", "Protein-Rich", "Tiffin", "Special Diet"];

  // ✅ FETCH DATA
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
        ingredients: (item.ingredients || []) as string[], // ✅ FIXED
      });

      setImages(item.image_urls || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ FIXED FUNCTION
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()],
      }));
      setNewIngredient("");
    }
  };

  // ✅ FIXED FUNCTION (NO ERROR)
  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // ✅ UPDATE API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.put(`/menu/${itemId}`, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        prep_time: Number(formData.prepTime),
        quantity: Number(formData.quantity),
        category: formData.category,
        food_type: formData.foodType,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fats: Number(formData.fats),
        ingredients: formData.ingredients,
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Menu Item</h1>
        <p className="text-white/90">Update your dish details</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        


        {/* Controls */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800">Item Controls</h3>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-800">In Stock</p>
              <p className="text-sm text-gray-500">Make item available for orders</p>
            </div>
            <Switch
              checked={formData.inStock}
              onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Public Visibility</p>
              <p className="text-sm text-gray-500">Show to customers</p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Discount Price</p>
              <p className="text-sm text-gray-500">Offer special pricing</p>
            </div>
            <Switch
              checked={formData.hasDiscount}
              onCheckedChange={(checked) => setFormData({ ...formData, hasDiscount: checked })}
            />
          </div>

          {formData.hasDiscount && (
            <div>
              <Label htmlFor="discountPrice" className="text-gray-800 font-medium">Discount Price (₹)</Label>
              <Input
                id="discountPrice"
                type="number"
                placeholder="199"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
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

        {/* Ingredients Section SAME */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <Label className="text-gray-800 font-medium mb-3 block">Ingredients</Label>

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

        {/* Auto-disable Warning */}
        {formData.quantity === "0" && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-5">
            <p className="text-yellow-800 font-medium">⚠️ Auto-disable Active</p>
            <p className="text-sm text-yellow-700 mt-1">
              This item will be automatically marked as "Out of Stock" when quantity reaches 0
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 z-50">
          <div className="max-w-md mx-auto">
          
          </div>
        </div>

        <Button
              type="submit"
              className="w-full py-6 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-lg font-medium"
            >
              Update Menu Item
            </Button>
      </form>
    </div>
  );
}