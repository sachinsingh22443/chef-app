
import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { Loader } from "@googlemaps/js-api-loader";

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
    };
  }
}

type Props = {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  onClose: () => void;
};

type Position = {
  lat: number;
  lng: number;
};

type PlaceSuggestion = {
  place_id: string;
  description: string;
};

const getSavedPosition = (): Position | null => {
  try {
    const savedLat = localStorage.getItem("lat");
    const savedLng = localStorage.getItem("lng");

    if (savedLat === null || savedLng === null) return null;

    const lat = Number(savedLat);
    const lng = Number(savedLng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      (lat === 0 && lng === 0)
    ) {
      return null;
    }

    return { lat, lng };
  } catch {
    return null;
  }
};

const getBrowserPosition = (
  options: PositionOptions
): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

export default function Location({ onLocationSelect, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loader, setLoader] = useState<Loader | null>(null);

  const loadingRef = useRef(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("VITE_GOOGLE_MAPS_API_KEY is missing.");
      return;
    }

    const mapsLoader = new Loader({
      apiKey,
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

    const savedPosition = getSavedPosition();
    const savedName =
      localStorage.getItem("location_name") || "Saved Location";

    // 1. Show the previously saved location immediately.
    // Do not make the user wait for fresh GPS to see it.
    if (savedPosition) {
      onLocationSelect(
        savedPosition.lat,
        savedPosition.lng,
        savedName
      );
    }

    try {
      const isNative = !!window.Capacitor?.isNativePlatform?.();

      // 2. Start loading Google Maps in parallel with GPS.
      const mapsPromise = loader ? loader.load() : null;

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
          throw new Error(
            "Location permission denied. Please allow location access in settings."
          );
        }

        try {
          // Fast path: allow a recent cached device location.
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
          // Fallback: request a fresh, more accurate location.
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

      // 3. Save and display coordinates immediately after GPS returns.
      localStorage.setItem("lat", String(position.lat));
      localStorage.setItem("lng", String(position.lng));

      const temporaryName = savedPosition
        ? savedName
        : "Current Location";

      onLocationSelect(
        position.lat,
        position.lng,
        temporaryName
      );

      // 4. Resolve the address separately; GPS coordinates are
      // already available even if address lookup is slow.
      let locationName = temporaryName;

      if (mapsPromise) {
        try {
          await mapsPromise;

          const geocoder = new google.maps.Geocoder();

          const address = await new Promise<string>((resolve) => {
            geocoder.geocode(
              { location: position },
              (results, status) => {
                resolve(
                  status === "OK" && results?.[0]
                    ? results[0].formatted_address
                    : temporaryName
                );
              }
            );
          });

          locationName = address || temporaryName;
        } catch (geocodingError) {
          console.warn(
            "Address lookup failed; keeping coordinates.",
            geocodingError
          );
        }
      }

      localStorage.setItem("location_name", locationName);

      onLocationSelect(
        position.lat,
        position.lng,
        locationName
      );

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to fetch location. Please try again.";

      if (savedPosition) {
        setError(
          "Current location unavailable. Your saved location is still available."
        );
      } else {
        setError(message);
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

        const service = new google.maps.places.AutocompleteService();

        service.getPlacePredictions(
          {
            input: query.trim(),
            componentRestrictions: { country: "in" },
          },
          (predictions, status) => {
            if (requestId !== searchRequestRef.current) return;

            setSuggestions(
              status === google.maps.places.PlacesServiceStatus.OK &&
                predictions
                ? predictions.map((item) => ({
                    place_id: item.place_id,
                    description: item.description,
                  }))
                : []
            );
          }
        );
      } catch (err) {
        console.error("Place search failed:", err);
        if (requestId === searchRequestRef.current) {
          setSuggestions([]);
          setError("Location search failed. Please try again.");
        }
      }
    },
    [loader]
  );

  const handlePlaceSelect = useCallback(
    async (placeId: string, description: string) => {
      if (!loader) {
        setError("Map service is still loading. Please try again.");
        return;
      }

      setError("");

      try {
        await loader.load();

        const geocoder = new google.maps.Geocoder();

        const position = await new Promise<Position>(
          (resolve, reject) => {
            geocoder.geocode({ placeId }, (results, status) => {
              const result = results?.[0];

              if (status !== "OK" || !result) {
                reject(new Error("Unable to find this location."));
                return;
              }

              const loc = result.geometry.location;

              resolve({
                lat: loc.lat(),
                lng: loc.lng(),
              });
            });
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
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to select this location."
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
        onClick={() => void handleAutoLocation()}
        disabled={loading}
        className="mb-4 w-full rounded-xl bg-orange-500 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Detecting location..." : "📍 Use Current Location"}
      </button>

      <div className="mb-3 text-center text-gray-400">OR</div>

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
          {suggestions.map((item) => (
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
