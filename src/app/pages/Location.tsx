
import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { Loader } from "@googlemaps/js-api-loader";

declare const google: any;

type Props = {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  onClose: () => void;
};

type Position = {
  lat: number;
  lng: number;
};

const getSavedPosition = (): Position | null => {
  const savedLat = localStorage.getItem("lat");
  const savedLng = localStorage.getItem("lng");

  if (savedLat === null || savedLng === null) return null;

  const lat = Number(savedLat);
  const lng = Number(savedLng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }

  return { lat, lng };
};

const getBrowserPosition = (
  options: PositionOptions
): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported on this device"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

export default function Location({
  onLocationSelect,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loader, setLoader] = useState<Loader | null>(null);

  const loadingRef = useRef(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    const mapsLoader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    setLoader(mapsLoader);
  }, []);

  const handleAutoLocation = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const isNative = !!window.Capacitor?.isNativePlatform();
      const savedPosition = getSavedPosition();
      const savedName =
        localStorage.getItem("location_name") || "Current Location";

      // Start Google Maps loading while location is being fetched.
      const mapsPromise = loader
        ? loader.load()
        : Promise.reject(new Error("Google Maps loader not ready"));

      let position: Position;

      if (isNative) {
        let permission = await Geolocation.checkPermissions();

        if (
          permission.location !== "granted" &&
          permission.coarseLocation !== "granted"
        ) {
          permission = await Geolocation.requestPermissions();
        }

        if (
          permission.location !== "granted" &&
          permission.coarseLocation !== "granted"
        ) {
          throw new Error("Location permission denied");
        }

        try {
          // Fast path: use a recent cached position if available.
          const result = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000,
          });

          position = {
            lat: result.coords.latitude,
            lng: result.coords.longitude,
          };
        } catch {
          // Fallback: request fresh, more accurate GPS.
          const result = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });

          position = {
            lat: result.coords.latitude,
            lng: result.coords.longitude,
          };
        }
      } else {
        try {
          const result = await getBrowserPosition({
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000,
          });

          position = {
            lat: result.coords.latitude,
            lng: result.coords.longitude,
          };
        } catch {
          const result = await getBrowserPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });

          position = {
            lat: result.coords.latitude,
            lng: result.coords.longitude,
          };
        }
      }

      // Save coordinates immediately.
      localStorage.setItem("lat", String(position.lat));
      localStorage.setItem("lng", String(position.lng));

      // Use saved address as a temporary label until geocoding finishes.
      const temporaryName = savedPosition
        ? savedName
        : "Current Location";

      onLocationSelect(
        position.lat,
        position.lng,
        temporaryName
      );

      let locationName = temporaryName;

      try {
        await mapsPromise;

        const geocoder = new google.maps.Geocoder();

        locationName = await new Promise<string>((resolve) => {
          geocoder.geocode(
            { location: position },
            (results: any, status: any) => {
              resolve(
                status === "OK" && results?.[0]
                  ? results[0].formatted_address
                  : "Current Location"
              );
            }
          );
        });
      } catch {
        // GPS coordinates remain available if geocoding fails.
      }

      localStorage.setItem("location_name", locationName);

      onLocationSelect(
        position.lat,
        position.lng,
        locationName
      );

      onClose();
    } catch (err: any) {
      const savedPosition = getSavedPosition();

      if (savedPosition) {
        // Preserve the previously saved location if fresh GPS fails.
        setError(
          "Current location unavailable. Your saved location is still available."
        );
      } else {
        setError(
          err?.message || "Unable to fetch location. Please try again."
        );
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [loader, onLocationSelect, onClose]);

  const searchPlaces = useCallback(
    async (query: string) => {
      const requestId = ++searchRequestRef.current;

      if (!loader || query.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        await loader.load();

        if (requestId !== searchRequestRef.current) return;

        const service =
          new google.maps.places.AutocompleteService();

        service.getPlacePredictions(
          {
            input: query.trim(),
            componentRestrictions: { country: "in" },
          },
          (predictions: any, status: any) => {
            if (requestId !== searchRequestRef.current) return;

            setSuggestions(
              status === "OK" && predictions ? predictions : []
            );
          }
        );
      } catch {
        if (requestId === searchRequestRef.current) {
          setSuggestions([]);
          setError("Location search failed");
        }
      }
    },
    [loader]
  );

  const handlePlaceSelect = useCallback(
    async (placeId: string, description: string) => {
      if (!loader) return;

      setError("");

      try {
        await loader.load();

        const geocoder = new google.maps.Geocoder();

        const position = await new Promise<Position>(
          (resolve, reject) => {
            geocoder.geocode(
              { placeId },
              (results: any, status: any) => {
                const result = results?.[0];

                if (status !== "OK" || !result) {
                  reject(new Error("Unable to find this location"));
                  return;
                }

                const loc = result.geometry.location;

                resolve({
                  lat: loc.lat(),
                  lng: loc.lng(),
                });
              }
            );
          }
        );

        localStorage.setItem("lat", String(position.lat));
        localStorage.setItem("lng", String(position.lng));
        localStorage.setItem("location_name", description);

        setSuggestions([]);
        setManualLocation(description);

        onLocationSelect(
          position.lat,
          position.lng,
          description
        );

        onClose();
      } catch (err: any) {
        setError(
          err?.message || "Unable to select this location"
        );
      }
    },
    [loader, onLocationSelect, onClose]
  );

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 text-gray-500 hover:text-black"
        aria-label="Close location selector"
      >
        ✖
      </button>

      <h2 className="mb-5 text-center text-xl font-semibold">
        Choose your location
      </h2>

      <button
        type="button"
        onClick={handleAutoLocation}
        disabled={loading}
        className="mb-4 w-full rounded-xl bg-orange-500 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Detecting location..."
          : "📍 Use Current Location"}
      </button>

      <div className="mb-3 text-center text-gray-400">
        OR
      </div>

      <input
        type="text"
        placeholder="Search village, area, city..."
        value={manualLocation}
        onChange={(event) => {
          const value = event.target.value;

          setManualLocation(value);
          setError("");
          void searchPlaces(value);
        }}
        className="mb-3 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-orange-400"
      />

      {suggestions.length > 0 && (
        <div className="mb-3 max-h-52 overflow-auto rounded-xl border">
          {suggestions.map((item: any) => (
            <button
              type="button"
              key={item.place_id}
              className="block w-full border-b p-3 text-left hover:bg-gray-100"
              onClick={() =>
                void handlePlaceSelect(
                  item.place_id,
                  item.description
                )
              }
            >
              {item.description}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
