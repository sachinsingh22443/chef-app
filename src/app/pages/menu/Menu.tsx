import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const API = axios.create({
  baseURL: "https://chef-backend-qh12.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Menu() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await API.get("/menu");

      const mapped = res.data.map((item: any) => ({
      ...item,
      prepTime: item.prep_time,
     inStock: item.quantity > 0,
     quantity: item.quantity, // 🔥 ADD THIS
    isVeg: item.food_type === "vegetarian",
    }));

      setMenuItems(mapped);
    } catch (err: any) {
      console.log(err.response?.data);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/menu/${id}`);
      fetchMenus();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 FIX: FormData use for PUT
  const handleToggleStock = async (item: any) => {
  try {
    const newStock = !item.inStock;

    // 🔥 UI instantly update
    setMenuItems(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, inStock: newStock } : i
      )
    );

    const form = new FormData();
    form.append("quantity", newStock ? "10" : "0");

    await API.put(`/menu/${item.id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

  } catch (err) {
    console.log(err);

    // ❌ rollback if error
    fetchMenus();
  }
};
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAllInStock = async () => {
  try {
    await Promise.all(
      menuItems.map((item) => {
        const form = new FormData();

        form.append("quantity", "10"); // 🔥 FORCE IN STOCK

        return API.put(`/menu/${item.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      })
    );

    fetchMenus();
  } catch (err) {
    console.log(err);
  }
};



  const handleBulkEdit = async () => {
    try {
      await Promise.all(
        menuItems.map((item) => {
          const form = new FormData();
          form.append("price", String(Math.round(item.price * 1.1)));

          return API.put(`/menu/${item.id}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        })
      );
      fetchMenus();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Menu</h1>
          <button
            onClick={() => navigate("/menu/add")}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <Plus className="w-6 h-6 text-orange-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 bg-white rounded-2xl border-none"
          />
        </div>
      </div>

      <div className="px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-2xl font-bold">{menuItems.length}</p>
            <p className="text-xs text-gray-500">Total Items</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-2xl font-bold text-green-600">
              {menuItems.filter(i => i.inStock).length}
            </p>
            <p className="text-xs text-gray-500">In Stock</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-2xl font-bold text-red-600">
              {menuItems.filter(i => !i.inStock).length}
            </p>
            <p className="text-xs text-gray-500">Out of Stock</p>
          </div>
        </div>

        {/* Menu List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-5 shadow-lg border">
              <div className="flex gap-4">

                {/* 🔥 IMAGE FIX (CLOUDINARY) */}
                <div className="flex gap-2 flex-shrink-0">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    item.image_urls.slice(0, 3).map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img} // ✅ DIRECT URL
                        onError={(e: any) => {
                          e.target.src = "https://via.placeholder.com/100";
                        }}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    ))
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center text-3xl">
                      🍛
                    </div>
                  )}
                </div>

                {/* बाकी UI SAME */}
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>

                  <div className="flex justify-between mt-3">
                    <p className="text-lg font-bold text-orange-500">₹{item.price}</p>

                    <Switch
                      checked={item.inStock}
                      onCheckedChange={() => handleToggleStock(item)}
                    />
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button>
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate(`/menu/edit/${item.id}`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-white rounded-3xl p-5 shadow-lg">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleBulkEdit} className="py-3 bg-gray-100 rounded-xl">
              Bulk Edit
            </button>
            <button onClick={handleMarkAllInStock} className="py-3 bg-green-100 rounded-xl">
              Mark All In Stock
            </button>
          </div>
        </div>
        {/* Bulk Actions SAME */}
      </div>
    </div>
  );
}