
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  Plus,
  RefreshCw,
  Package,
  Pencil,
  Trash2,
  Compass,
} from "lucide-react";

const API = "https://chef-backend-qh12.onrender.com";

const CATEGORIES = [
  "All",
  "Protein Rich",
  "Healthy",
  "Anytime",
  "Bulk Order",
];

interface ExploreProduct {
  id: string;
  chef_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ExploreProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<ExploreProduct[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await axios.get<ExploreProduct[]>(
        `${API}/explore/products/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Products load nahi ho paaye. Please retry."
        );
      } else {
        setError("Something went wrong while loading products.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const deactivateProduct = async (product: ExploreProduct) => {
    const confirmed = window.confirm(
      `"${product.name}" ko Explore se deactivate karna hai?`
    );

    if (!confirmed) return;

    setActionId(product.id);
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API}/explore/products/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Product deactivate nahi ho paaya."
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setActionId(null);
    }
  };

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-600">
              <Compass size={22} />
              <span className="text-sm font-semibold">CHEF EXPLORE</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Explore Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Apne special products manage karo.
            </p>
          </div>

          <button
            onClick={() => navigate("/app/explore/add")}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Active Products</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {products.filter((p) => p.is_active).length}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:col-span-1">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">4</p>
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-orange-500 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-orange-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => void fetchProducts()}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 text-gray-500">
            <RefreshCw className="animate-spin" size={20} />
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={42} />

            <h2 className="text-lg font-semibold text-gray-800">
              {category === "All"
                ? "Abhi koi Explore product nahi hai"
                : `${category} mein koi product nahi hai`}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Apna pehla Explore product add karo aur use manage karna shuru karo.
            </p>

            {category === "All" && (
              <button
                onClick={() => navigate("/app/explore/add")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
              >
                <Plus size={18} />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative h-48 bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package size={42} className="text-gray-300" />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      product.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="font-bold text-gray-900">
                      {product.name}
                    </h2>

                    <span className="shrink-0 font-bold text-orange-600">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                    {product.category}
                  </span>

                  <p className="mt-3 line-clamp-2 min-h-10 text-sm text-gray-500">
                    {product.description || "No description added."}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <span>Stock: {product.quantity}</span>
                    <span>
                      {product.quantity > 0 ? "In stock" : "Out of stock"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        navigate(`/app/explore/add?edit=${product.id}`)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      disabled={
                        !product.is_active || actionId === product.id
                      }
                      onClick={() => void deactivateProduct(product)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {actionId === product.id
                        ? "Please wait..."
                        : "Deactivate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
