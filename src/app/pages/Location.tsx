import { useState } from "react";

type Props = {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  onClose: () => void;
};

export default function Location({ onLocationSelect, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [error, setError] = useState("");

  // 📍 Reverse Geocoding (lat/lng → city)
  const getCityName = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "my-chef-app",
        },
      }
    );

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();

    const address = data.address;
    console.log("Address Data:", address);

const city =
  address?.village ||
  address?.town ||
  address?.city ||
  address?.county ||
  address?.state_district ||
  address?.state ||
  "Unknown";

const fullLocation = `${city}, ${address?.state || ""}`;

    return fullLocation;

  } catch (err) {
    console.error("❌ Reverse geocoding error:", err);
    return "Unknown Location";
  }

};

  // 📍 AUTO LOCATION
  const handleAutoLocation = () => {
    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("Latitude:", lat);
        console.log("Longitude:", lng);
        console.log("Accuracy:", position.coords.accuracy);

        if (position.coords.accuracy > 100) {
                     setError(
                     "Location is not accurate. Please enable GPS and try again or search manually."
                     );
                     setLoading(false);
                     return;
          }

        const city = await getCityName(lat, lng);

        // 💾 Save
        localStorage.setItem("lat", lat.toString());
        localStorage.setItem("lng", lng.toString());
        localStorage.setItem("location_name", city);

        onLocationSelect(lat, lng, city);
        setLoading(false);
        onClose();
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      },
      {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}
    );
  };

  // 🔍 MANUAL LOCATION (Search)
  const handleManualLocation = async () => {
    if (!manualLocation) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(manualLocation)}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        const city = await getCityName(lat, lng);

        // 💾 Save
        localStorage.setItem("lat", lat.toString());
        localStorage.setItem("lng", lng.toString());
        localStorage.setItem("location_name", city);

        onLocationSelect(lat, lng, city);
        onClose();
      } else {
        setError("Location not found");
      }
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl relative">
      
      {/* ❌ Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500"
      >
        ✖
      </button>

      <h2 className="text-xl font-semibold text-center mb-5">
        Choose your location
      </h2>

      {/* 📍 AUTO BUTTON */}
      <button
        onClick={handleAutoLocation}
        className="w-full bg-orange-500 text-white py-3 rounded-xl mb-4 font-medium"
      >
        {loading ? "Detecting location..." : "📍 Use Current Location"}
      </button>

      {/* Divider */}
      <div className="text-center text-gray-400 mb-3">OR</div>

      {/* 🔍 INPUT */}
      <input
        type="text"
        placeholder="Search your area, city..."
        value={manualLocation}
        onChange={(e) => setManualLocation(e.target.value)}
        className="w-full border p-3 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-orange-400"
      />

      {/* 🔍 SEARCH BUTTON */}
      <button
        onClick={handleManualLocation}
        className="w-full bg-green-500 text-white py-3 rounded-xl font-medium"
      >
        Search Location
      </button>

      {/* ⚠️ ERROR */}
      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  );
}