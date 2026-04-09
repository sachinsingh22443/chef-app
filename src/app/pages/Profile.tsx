import { useNavigate } from "react-router";
import {
  Edit,
  MapPin,
  Star,
  Award,
  Settings as SettingsIcon,
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://chef-backend-1.onrender.com";

export default function Profile() {
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(true);
  const [isBusyMode, setIsBusyMode] = useState(false);
  const [chef, setChef] = useState<any>(null);
  const [loading, setLoading] = useState(true);



   const formatDate = (date: string) => {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
  };
  // 🔥 FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChef(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 rounded-b-[40px] p-6 pb-32">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <button
            onClick={() => navigate("/settings")}
            className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"
          >
            <SettingsIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-24 pb-8 space-y-5">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-start gap-4 mb-5">

            {/* 🔥 PROFILE IMAGE FIX */}
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-200">
              <img
                src={
                  chef?.profile_image && chef.profile_image !== ""
                    ? chef.profile_image
                    : "https://via.placeholder.com/100"
                }
                onError={(e: any) => {
                  e.target.src = "https://via.placeholder.com/100";
                }}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {chef?.name || "No Name"}
              </h2>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">

                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-medium">
                    {chef?.avg_rating || 0}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{chef?.location || "No location"}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/profile/edit")}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {chef?.bio || "No bio added"}
          </p>

          <div className="flex flex-wrap gap-2">
            {chef?.specialties ? (
              chef.specialties.split(",").map((item: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">
                No specialties added
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-3xl p-5 shadow-lg space-y-4">
          <h3 className="font-bold text-gray-800">Availability Status</h3>

          <div className="flex justify-between py-3 border-b">
            <div>
              <p className="font-medium">Online Status</p>
              <p className="text-sm text-gray-500">
                {isOnline ? "Accepting orders" : "Offline"}
              </p>
            </div>
            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
          </div>

          <div className="flex justify-between py-3">
            <div>
              <p className="font-medium">Busy Mode</p>
              <p className="text-sm text-gray-500">
                Delay new orders
              </p>
            </div>
            <Switch
              checked={isBusyMode}
              onCheckedChange={setIsBusyMode}
              disabled={!isOnline}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white p-5 rounded-3xl text-center shadow">
            <Award className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">
              {chef?.total_orders || 0}
            </p>
            <p className="text-xs text-gray-500">Orders</p>
          </div>

          <div className="bg-white p-5 rounded-3xl text-center shadow">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">
              {chef?.avg_rating || 0}
            </p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>

          <div className="bg-white p-5 rounded-3xl text-center shadow">
            📅
            <p className="text-sm font-bold">
              {chef?.join_date
                ? formatDate(chef.join_date)
                : "-"}
            </p>
            <p className="text-xs text-gray-500">Joined</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/auth/login");
          }}
          className="w-full py-4 bg-white border-2 border-red-200 text-red-600 rounded-2xl"
        >
          Logout
        </button>
      </div>
    </div>
  );
}