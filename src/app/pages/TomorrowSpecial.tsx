import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function TomorrowSpecial() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dishName: "",
    description: "",
    price: "",
    maxPlates: "",
    cutoffTime: "",
  });

  const [specials, setSpecials] = useState<any[]>([]);

  // 🔥 FETCH DATA
  useEffect(() => {
    fetchSpecials();
  }, []);

  const fetchSpecials = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-1.onrender.com/tomorrow-special/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSpecials(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 CREATE DIRECT
  const handleCreate = async (e: any) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://chef-backend-1.onrender.com/tomorrow-special/",
        {
          dish_name: formData.dishName,
          description: formData.description,
          price: Number(formData.price),
          max_plates: Number(formData.maxPlates),
          cutoff_time: formData.cutoffTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("CREATED:", res.data);

      toast.success("Created successfully");

      // 🔥 UI update instantly
      fetchSpecials();

      // reset form
      setFormData({
        dishName: "",
        description: "",
        price: "",
        maxPlates: "",
        cutoffTime: "",
      });

    } catch (err) {
      console.log("CREATE ERROR:", err);
      toast.error("Create failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* HEADER */}
      <div className="bg-purple-600 p-6 text-white">
        <button onClick={() => navigate(-1)} className="flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold mt-2">Tomorrow Special</h1>
      </div>

      {/* 🔥 SHOW DATA */}
      <div className="p-6">
        <h2 className="font-bold mb-3">Your Specials</h2>

        {specials.length === 0 ? (
          <p className="text-gray-500">No specials yet</p>
        ) : (
          specials.map((item) => (
            <div key={item.id} className="bg-white p-4 mb-2 rounded-xl shadow">
              <p className="font-bold">{item.dish_name}</p>
              <p className="text-sm">{item.description}</p>
              <p className="text-purple-600 font-bold">₹{item.price}</p>
              <p className="text-xs text-gray-500">
                {item.max_plates} plates | cutoff: {item.cutoff_time}
              </p>
            </div>
          ))
        )}
      </div>

      {/* FORM */}
      <form onSubmit={handleCreate} className="px-6 space-y-4">

        <div>
          <Label>Dish Name</Label>
          <Input
            value={formData.dishName}
            onChange={(e) =>
              setFormData({ ...formData, dishName: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Price</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Max Plates</Label>
          <Input
            type="number"
            value={formData.maxPlates}
            onChange={(e) =>
              setFormData({ ...formData, maxPlates: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Cutoff Time</Label>
          <Input
            type="time"
            value={formData.cutoffTime}
            onChange={(e) =>
              setFormData({ ...formData, cutoffTime: e.target.value })
            }
          />
        </div>

        {/* 🔥 DIRECT CREATE BUTTON */}
        <Button type="submit">Create Tomorrow Special</Button>
      </form>
    </div>
  );
}