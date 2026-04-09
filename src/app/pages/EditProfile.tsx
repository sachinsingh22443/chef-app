import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload } from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

const BASE_URL = "https://chef-backend-1.onrender.com";

export default function EditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    specialties: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 🔥 FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          bio: res.data.bio || "",
          location: res.data.location || "",
          specialties: res.data.specialties || "",
        });

        if (res.data.profile_image) {
          setPreview(res.data.profile_image);
        }

      } catch (err: any) {
        console.error("FETCH ERROR:", err.response?.data);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  // 🔥 IMAGE CHANGE
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    // ✅ image validation
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("bio", formData.bio);
      data.append("location", formData.location);
      data.append("specialties", formData.specialties);

      if (image) {
        data.append("profile_image", image);
      }

      await axios.put(`${BASE_URL}/auth/users/update-profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully 🚀");
      navigate("/profile");

    } catch (err: any) {
      console.log("ERROR:", err.response?.data);
      toast.error(err.response?.data?.detail || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-b-[40px] p-6 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 pb-10">

        {/* IMAGE */}
        <div className="bg-white p-5 rounded-3xl shadow">
          <Label>Profile Photo</Label>

          <div className="flex items-center gap-4 mt-3">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-200 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = "https://via.placeholder.com/100";
                  }}
                />
              ) : (
                <span className="text-3xl">👨‍🍳</span>
              )}
            </div>

            <label className="flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-orange-400">
              <Upload className="mx-auto mb-1" />
              Change Photo
              <input type="file" hidden onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-5 rounded-3xl shadow space-y-4">

          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={formData.email} disabled />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
        </div>

        {/* BIO */}
        <div className="bg-white p-5 rounded-3xl shadow">
          <Label>Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
          />
        </div>

        {/* SPECIALTIES */}
        <div className="bg-white p-5 rounded-3xl shadow">
          <Label>Specialties</Label>
          <Input
            value={formData.specialties}
            onChange={(e) =>
              setFormData({ ...formData, specialties: e.target.value })
            }
          />
        </div>

        {/* BUTTON */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-6 text-lg bg-orange-500 text-white rounded-xl"
        >
          {loading ? "Updating..." : "Save Changes"}
        </Button>

      </form>
    </div>
  );
}