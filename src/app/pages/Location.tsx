import { useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect } from "react";
// import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

declare const google: any;

type Props = {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  onClose: () => void;
};

export default function Location({
  onLocationSelect,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [error, setError] = useState("");

  // Reverse Geocoding
  

  // Current Location
  const handleAutoLocation = async () => {
    try {
      setLoading(true);
      setError("");

      if (window.Capacitor?.isNativePlatform()) {
           const permission = await Geolocation.requestPermissions();

  if (
    permission.location !== "granted" &&
    permission.coarseLocation !== "granted"
  ) {
    setError("Location permission denied");
    setLoading(false);
    return;
  }
}

      

  let lat: number;
let lng: number;

if (window.Capacitor?.isNativePlatform()) {
    let bestPosition = null;

for (let i = 0; i < 3; i++) {
  const pos = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  });

  if (
    !bestPosition ||
    pos.coords.accuracy < bestPosition.coords.accuracy
  ) {
    bestPosition = pos;
  }
}

lat = bestPosition.coords.latitude;
lng = bestPosition.coords.longitude;

// console.log(
//   "Best Accuracy:",
//   bestPosition.coords.accuracy
// );

  

} else {
  const position = await new Promise<GeolocationPosition>(
    (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 60000,
        }
      );
    }
  );

  lat = position.coords.latitude;
  lng = position.coords.longitude;

}


      // console.log("✅ GPS Coordinates");
      // console.log("Latitude:", lat);
      // console.log("Longitude:", lng);

     await loader?.load();

const geocoder = new google.maps.Geocoder();

geocoder.geocode(
  {
    location: { lat, lng },
  },
  (results: any, status: any) => {
    const locationName =
      status === "OK" && results?.[0]
        ? results[0].formatted_address
        : "Current Location";

    localStorage.setItem("lat", lat.toString());
    localStorage.setItem("lng", lng.toString());
    localStorage.setItem("location_name", locationName);

    onLocationSelect(lat, lng, locationName);

    setLoading(false);
    onClose();
  }
);
    } catch (err: any) {
      // console.error("Location Error:", err);

      setError(err?.message || "Unable to fetch location");
      setLoading(false);
    }
  };


const [suggestions, setSuggestions] = useState<any[]>([]);
const [loader, setLoader] = useState<Loader | null>(null);

useEffect(() => {

  
  const mapsLoader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places"],
  });



  setLoader(mapsLoader);
}, []);


const searchPlaces = async (query: string) => {
  if (!loader || query.length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    await loader.load();

    // console.log("Google:", !!window.google);
    // console.log("Places:", !!window.google?.maps?.places);

    const service =
      new google.maps.places.AutocompleteService();

    service.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: "in" },
      },
      (predictions: any, status: any) => {
        // alert(
        //   `STATUS: ${status}\nCOUNT: ${
        //     predictions?.length || 0
        //   }`
        // );

        // console.log("STATUS:", status);
        // console.log("PREDICTIONS:", predictions);

        setSuggestions(predictions || []);
      }
    );
  } catch (err) {
    // alert("ERROR: " + JSON.stringify(err));
    setError("Location search failed");
  }
};


const handlePlaceSelect = async (
  placeId: string,
  description: string
) => {
  if (!loader) return;

  await loader.load();

  const geocoder = new google.maps.Geocoder();

  geocoder.geocode(
    { placeId },
    (results, status) => {
      if (
        status === "OK" &&
        results &&
        results[0]
      ) {
        const loc = results[0].geometry.location;

        const lat = loc.lat();
        const lng = loc.lng();

        localStorage.setItem("lat", lat.toString());
        localStorage.setItem("lng", lng.toString());
        localStorage.setItem(
          "location_name",
          description
        );
         
        setSuggestions([]);
        setManualLocation(description);

        onLocationSelect(
          lat,
          lng,
          description
        );

        onClose();
      }
    }
  );
};

  return (
    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        ✖
      </button>

      <h2 className="text-xl font-semibold text-center mb-5">
        Set kitchen location
      </h2>

      <button
        onClick={handleAutoLocation}
        disabled={loading}
        className="w-full bg-orange-500 text-white py-3 rounded-xl mb-4 font-medium disabled:opacity-50"
      >
        {loading ? "Detecting location..." : "📍 Use Current Location"}
      </button>

      <div className="text-center text-gray-400 mb-3">OR</div>

      <input
        type="text"
        placeholder="Search village, area, city..."
        value={manualLocation}
        onChange={(e) => {
     setManualLocation(e.target.value);
     searchPlaces(e.target.value);
     }}
        className="w-full border p-3 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-orange-400"
      />

      {suggestions.length > 0 && (
  <div className="border rounded-xl max-h-52 overflow-auto mb-3">
    {suggestions.map((item: any) => (
      <div
        key={item.place_id}
        className="p-3 cursor-pointer hover:bg-gray-100 border-b"
        onClick={() =>
          handlePlaceSelect(
            item.place_id,
            item.description
          )
        }
      >
        {item.description}
      </div>
    ))}
  </div>
)}

      

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">
          {error}
        </p>
      )}
    </div>
  );
}