
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  Package,
  IndianRupee,
  FileText,
  Tag,
  Upload,
  X,
} from "lucide-react";

const API = "https://chef-backend-qh12.onrender.com";

const CATEGORIES = [
  "Protein Rich",
  "Healthy",
  "Anytime",
  "Bulk Order",
] as const;

interface ExploreProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  quantity: number;
  is_active: boolean;
}

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  quantity: string;
}

const INITIAL_FORM: ProductForm = {
  name: "",
  description: "",
  category: "Anytime",
  price: "",
  image_url: "",
  quantity: "1",
};

export default function AddExploreProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState("");

  // Load the existing product when editing.
  useEffect(() => {
    if (!editId) return;

    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Session nahi mili. Dobara login karein.");
        }

        const response = await axios.get<ExploreProduct[]>(
          `${API}/explore/products/mine`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const product = response.data.find(
          (item) => item.id === editId
        );

        if (!product) {
          throw new Error(
            "Product nahi mila. Ho sakta hai product delete ho chuka ho."
          );
        }

        if (cancelled) return;

        setForm({
          name: product.name,
          description: product.description ?? "",
          category: product.category,
          price: String(product.price),
          image_url: product.image_url ?? "",
          quantity: String(product.quantity),
        });
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          setError(
            getErrorMessage(
              err.response?.data?.detail,
              "Product load nahi hua. API aur login check karein."
            )
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Product load nahi hua."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  // Create and clean up the selected image preview URL.
  useEffect(() => {
    if (!selectedImage) {
      setLocalPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setLocalPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

  const updateField = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (field === "image_url") {
      setImageError(false);
    }
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please JPG, PNG, WEBP ya koi valid image select karein.");
      event.target.value = "";
      return;
    }

    // Limit the upload size to 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      setError("Image ka size 5 MB se kam hona chahiye.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setImageError(false);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    const imageUrl = form.image_url.trim();

    if (name.length < 2) {
      setError(
        "Product name kam se kam 2 characters ka hona chahiye."
      );
      return;
    }

    if (
      !CATEGORIES.includes(
        form.category as (typeof CATEGORIES)[number]
      )
    ) {
      setError("Please valid category select karein.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price 0 se zyada hona chahiye.");
      return;
    }

    if (
      form.quantity.trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError(
        "Quantity 0 ya usse zyada poori sankhya honi chahiye."
      );
      return;
    }

    if (imageUrl && !selectedImage) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        setError(
          "Image ke liye valid HTTP/HTTPS URL enter karein."
        );
        return;
      }
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Session nahi mili. Dobara login karein.");
      return;
    }

    // Backend accepts multipart/form-data.
    const payload = new FormData();
    payload.append("name", name);
    payload.append("description", form.description.trim());
    payload.append("category", form.category);
    payload.append("price", String(price));
    payload.append("quantity", String(quantity));

    if (imageUrl) {
      payload.append("image_url", imageUrl);
    }

    // If a file is selected, backend uploads it to Cloudinary.
    if (selectedImage) {
      payload.append("image", selectedImage);
    }

    setSaving(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editId) {
        await axios.put(
          `${API}/explore/products/${editId}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${API}/explore/products`,
          payload,
          config
        );
      }

      navigate("/app/explore");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          getErrorMessage(
            err.response?.data?.detail,
            "Product save nahi hua. Backend logs aur API response check karein."
          )
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Product save nahi hua."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const previewImage = localPreview || form.image_url.trim();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-sm text-gray-600">
          Product load ho raha hai...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 sm:px-6">
      <button
        type="button"
        onClick={() => navigate("/app/explore")}
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <ArrowLeft size={18} />
        Back to Explore
      </button>

      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
          Explore Products
        </p>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Product ki details bharein aur apne Explore section
          mein list karein.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-7"
      >
        {/* Product name */}
        <div>
          <label
            htmlFor="product-name"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
          >
            <Package size={17} />
            Product Name *
          </label>

          <input
            id="product-name"
            type="text"
            required
            minLength={2}
            maxLength={150}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. Paneer Protein Bowl"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="product-category"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
          >
            <Tag size={17} />
            Category *
          </label>

          <select
            id="product-category"
            required
            value={form.category}
            onChange={(e) =>
              updateField("category", e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {form.category === "Protein Rich" && (
            <p className="mt-2 text-xs text-gray-500">
              Protein Rich category mein non-veg aur egg dishes
              ke liye apne category rules follow karein.
            </p>
          )}

          {form.category === "Healthy" && (
            <p className="mt-2 text-xs text-gray-500">
              Khichdi, daliya aur light healthy meals.
            </p>
          )}

          {form.category === "Anytime" && (
            <p className="mt-2 text-xs text-gray-500">
              Availability ke according kabhi bhi order kiye ja
              sakne wale dishes.
            </p>
          )}

          {form.category === "Bulk Order" && (
            <p className="mt-2 text-xs text-gray-500">
              Bulk orders ke liye minimum 5 plates ka rule
              checkout par bhi enforce karna hoga.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="product-description"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
          >
            <FileText size={17} />
            Description
          </label>

          <textarea
            id="product-description"
            rows={4}
            value={form.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
            placeholder="Ingredients, portion size, product details..."
            className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Price and quantity */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="product-price"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
            >
              <IndianRupee size={17} />
              Price (₹) *
            </label>

            <input
              id="product-price"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                updateField("price", e.target.value)
              }
              placeholder="150"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="product-quantity"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
            >
              <Package size={17} />
              Available Quantity *
            </label>

            <input
              id="product-quantity"
              type="number"
              required
              min="0"
              step="1"
              value={form.quantity}
              onChange={(e) =>
                updateField("quantity", e.target.value)
              }
              placeholder="10"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Available plates/units enter karein.
            </p>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label
            htmlFor="product-image-file"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
          >
            <ImageIcon size={17} />
            Product Image
          </label>

          <label
            htmlFor="product-image-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-orange-400 hover:bg-orange-50"
          >
            <Upload className="mb-3 h-8 w-8 text-orange-500" />

            <span className="text-sm font-semibold text-gray-800">
              {selectedImage
                ? "Choose another image"
                : "Click to upload product image"}
            </span>

            <span className="mt-1 text-xs text-gray-500">
              JPG, PNG, WEBP • Maximum 5 MB
            </span>

            {selectedImage && (
              <span className="mt-2 break-all text-xs text-orange-600">
                {selectedImage.name}
              </span>
            )}
          </label>

          <input
            id="product-image-file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {selectedImage && (
            <button
              type="button"
              onClick={removeSelectedImage}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <X size={16} />
              Remove selected image
            </button>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Nayi image select karne par backend use Cloudinary
            par upload karega. Edit karte waqt nayi image select
            nahi karenge to existing image bani rahegi.
          </p>

          {/* Optional URL fallback */}
          <details className="mt-4 rounded-xl border border-gray-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Ya image URL use karein
            </summary>

            <div className="mt-3">
              <input
                id="product-image-url"
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  updateField("image_url", e.target.value)
                }
                placeholder="https://example.com/product.jpg"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Agar file upload select ki hai, uploaded file
                URL field se priority legi.
              </p>
            </div>
          </details>

          {/* Image preview */}
          {previewImage && !imageError && (
            <div className="relative mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src={previewImage}
                alt="Product preview"
                className="h-56 w-full object-contain"
                onError={() => setImageError(true)}
              />

              <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                Image Preview
              </span>
            </div>
          )}

          {imageError && (
            <p className="mt-2 text-sm text-red-600">
              Image preview load nahi hui. Image file ya URL
              check karein.
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                {selectedImage
                  ? "Uploading image and saving..."
                  : "Saving..."}
              </>
            ) : (
              <>
                <Save size={19} />
                {isEditing ? "Update Product" : "Save Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function getErrorMessage(
  detail: unknown,
  fallback: string
): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;

        if (
          item &&
          typeof item === "object" &&
          "msg" in item &&
          typeof item.msg === "string"
        ) {
          return item.msg;
        }

        return "";
      })
      .filter(Boolean)
      .join(", ") || fallback;
  }

  return fallback;
}
