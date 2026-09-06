import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Edit,
  Grid3X3,
  List,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Utensils,
  Zap,
} from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await API.get("/menu/my");

      const mapped = res.data.map((item: any) => ({
        ...item,
        prepTime: item.prep_time,
        inStock: item.is_available,
        quantity: item.quantity,
        isVeg: item.food_type === "vegetarian",
      }));

      setMenuItems(mapped);
    } catch (err: any) {
      console.log(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this menu item? This action cannot be undone.")) {
      return;
    }

    try {
      setBusyAction(`delete-${id}`);
      await API.delete(`/menu/${id}`);
      fetchMenus();
    } catch (err: any) {
      console.log("DELETE ERROR:", err);
      alert(
        err.response?.data?.detail ||
          err.message ||
          "Delete Failed"
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleToggleStock = async (item: any) => {
    try {
      const newStock = !item.inStock;

      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, inStock: newStock } : i
        )
      );

      await API.put(`/menu/${item.id}/availability`, null, {
        params: { is_available: newStock },
      });
    } catch (err) {
      console.log(err);
      fetchMenus();
    }
  };

  const handleMarkAllInStock = async () => {
    try {
      setBusyAction("all-stock");

      await Promise.all(
        menuItems.map((item) => {
          const form = new FormData();
          form.append("quantity", "10");

          return API.put(`/menu/${item.id}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        })
      );

      fetchMenus();
    } catch (err) {
      console.log(err);
    } finally {
      setBusyAction(null);
    }
  };

  const handleBulkEdit = async () => {
    try {
      setBusyAction("bulk-edit");

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
    } finally {
      setBusyAction(null);
    }
  };

  const categories = useMemo(() => {
    const values = menuItems
      .map((item) => item.category)
      .filter(Boolean);
    return ["All", ...Array.from(new Set(values))];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.description || "").toLowerCase().includes(query) ||
        String(item.category || "").toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, categoryFilter]);

  const totalItems = menuItems.length;
  const inStock = menuItems.filter((i) => i.inStock).length;
  const outOfStock = totalItems - inStock;
  const avgPrice =
    totalItems > 0
      ? Math.round(
          menuItems.reduce((sum, item) => sum + Number(item.price || 0), 0) /
            totalItems
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#07100d] text-white pb-24">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute -left-48 top-[40%] h-[460px] w-[460px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/10 bg-[#08130f]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
                <Sparkles className="h-3.5 w-3.5" />
                Chef Menu Studio
              </div>

              <div className="flex items-end gap-4">
                <div>
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                    Your menu.
                  </h1>
                  <p className="mt-1 text-3xl font-black tracking-tight text-emerald-300 sm:text-4xl">
                    Your signature.
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                Manage dishes, availability, pricing and your 30-day food
                cycle from one polished kitchen command center.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/menu/add")}
              className="group flex h-14 items-center justify-center gap-3 rounded-2xl bg-orange-300 px-5 font-black text-[#171006] shadow-xl shadow-orange-300/10 transition hover:bg-orange-200 active:scale-[0.98]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10">
                <Plus className="h-5 w-5" />
              </span>
              Add new dish
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-7">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <Input
              type="text"
              placeholder="Search dishes, categories or descriptions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-2xl border-white/10 bg-white/[0.06] pl-12 text-white placeholder:text-white/25 shadow-2xl backdrop-blur focus-visible:ring-orange-300/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/45 hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                  categoryFilter === category
                    ? "border-orange-300/40 bg-orange-300 text-[#171006]"
                    : "border-white/10 bg-white/[0.04] text-white/45 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Utensils className="h-5 w-5" />}
            label="Total dishes"
            value={totalItems}
            sub="on your menu"
          />
          <StatCard
            icon={<Check className="h-5 w-5" />}
            label="In stock"
            value={inStock}
            sub={`${totalItems ? Math.round((inStock / totalItems) * 100) : 0}% available`}
            positive
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Out of stock"
            value={outOfStock}
            sub="needs attention"
            warning
          />
          <StatCard
            icon={<Zap className="h-5 w-5" />}
            label="Avg. price"
            value={`₹${avgPrice}`}
            sub="across dishes"
          />
        </section>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              Live catalog
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-2xl font-black">Menu collection</h2>
              <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-xs font-bold text-white/40">
                {filteredItems.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMenus}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 ${
                  viewMode === "grid"
                    ? "bg-white/10 text-white"
                    : "text-white/30"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 ${
                  viewMode === "list"
                    ? "bg-white/10 text-white"
                    : "text-white/30"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-[380px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            hasSearch={!!searchQuery || categoryFilter !== "All"}
            onReset={() => {
              setSearchQuery("");
              setCategoryFilter("All");
            }}
            onAdd={() => navigate("/menu/add")}
          />
        ) : viewMode === "grid" ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onToggle={() => handleToggleStock(item)}
                onEdit={() => navigate(`/menu/edit/${item.id}`)}
                onDelete={() => handleDelete(item.id)}
                deleting={busyAction === `delete-${item.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filteredItems.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                onToggle={() => handleToggleStock(item)}
                onEdit={() => navigate(`/menu/edit/${item.id}`)}
                onDelete={() => handleDelete(item.id)}
                deleting={busyAction === `delete-${item.id}`}
              />
            ))}
          </div>
        )}

        {/* Quick actions */}
        <section className="mt-8 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-2xl">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-300/10">
                <Zap className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <h3 className="font-black">Quick kitchen actions</h3>
                <p className="text-xs text-white/35">
                  Fast controls for your entire catalog.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <button
              type="button"
              disabled={!!busyAction || !menuItems.length}
              onClick={handleBulkEdit}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 p-4 text-left transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div>
                <div className="font-bold">Bulk price update</div>
                <div className="mt-1 text-xs text-white/30">
                  Apply the existing bulk pricing action.
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/25" />
            </button>

            <button
              type="button"
              disabled={!!busyAction || !menuItems.length}
              onClick={handleMarkAllInStock}
              className="flex items-center justify-between rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4 text-left transition hover:bg-emerald-300/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div>
                <div className="font-bold text-emerald-100">
                  Mark all in stock
                </div>
                <div className="mt-1 text-xs text-white/30">
                  Restore availability across your dishes.
                </div>
              </div>
              <Check className="h-5 w-5 text-emerald-300" />
            </button>
          </div>
        </section>

        {/* 30-day cycle */}
        <section className="mt-5 overflow-hidden rounded-[30px] border border-orange-300/15 bg-gradient-to-br from-orange-300/[0.09] via-white/[0.04] to-emerald-300/[0.05] p-5 shadow-2xl sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-300/10">
                <Package className="h-6 w-6 text-orange-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
                  Planning
                </p>
                <h3 className="mt-1 text-xl font-black">30-Day Menu Cycle</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-white/35">
                  Decide which menu gets served on each day and keep your
                  kitchen schedule organized.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/menu/cycle")}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#07100d] transition hover:bg-white/90"
            >
              Manage cycle
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  positive,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            positive
              ? "bg-emerald-300/10 text-emerald-300"
              : warning
                ? "bg-red-300/10 text-red-300"
                : "bg-orange-300/10 text-orange-300"
          }`}
        >
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-white/15" />
      </div>
      <div className="mt-4 text-2xl font-black">{value}</div>
      <div className="mt-0.5 text-xs font-bold text-white/65">{label}</div>
      <div className="mt-1 text-[11px] text-white/30">{sub}</div>
    </div>
  );
}

function MenuCard({
  item,
  onToggle,
  onEdit,
  onDelete,
  deleting,
}: {
  item: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const image = item.image_urls?.[0];
  const quantity = Number(item.quantity || 0);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-white/15">
      <div className="relative aspect-[1.45/1] overflow-hidden bg-black/20">
        {image ? (
          <img
            src={image}
            onError={(e: any) => {
              e.currentTarget.style.display = "none";
            }}
            alt={item.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-300/10 to-emerald-300/10">
            <Utensils className="h-12 w-12 text-white/15" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur ${
              item.isVeg
                ? "bg-emerald-100/90 text-emerald-900"
                : "bg-red-100/90 text-red-900"
            }`}
          >
            ● {item.isVeg ? "VEG" : "NON-VEG"}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur hover:bg-black/80"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit dish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting…" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!item.inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-red-950/75 px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-red-100 backdrop-blur">
            Out of stock
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black">{item.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-white/35">
              {item.description || "No description added yet."}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-xl font-black text-orange-300">
              ₹{item.price}
            </div>
            <div className="text-[10px] text-white/25">
              {item.prepTime || "—"} min
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {item.category && (
            <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-white/45">
              {item.category}
            </span>
          )}
          <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-white/45">
            {quantity} qty
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/25">
              Availability
            </div>
            <div
              className={`mt-1 text-xs font-bold ${
                item.inStock ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {item.inStock ? "Live for orders" : "Not orderable"}
            </div>
          </div>
          <Switch checked={item.inStock} onCheckedChange={onToggle} />
        </div>
      </div>
    </article>
  );
}

function MenuRow({
  item,
  onToggle,
  onEdit,
  onDelete,
  deleting,
}: {
  item: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const image = item.image_urls?.[0];

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-xl sm:flex-row sm:items-center">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-black/20">
        {image ? (
          <img src={image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-7 w-7 text-white/15" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black">{item.name}</h3>
          <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[9px] font-black uppercase text-white/40">
            {item.isVeg ? "VEG" : "NON-VEG"}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-white/30">
          {item.description || "No description"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-white/35">
          <span>₹{item.price}</span>
          <span>•</span>
          <span>{item.prepTime || "—"} min</span>
          <span>•</span>
          <span>{item.quantity || 0} qty</span>
          {item.category && (
            <>
              <span>•</span>
              <span>{item.category}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${
              item.inStock ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {item.inStock ? "In stock" : "Out"}
          </span>
          <Switch checked={item.inStock} onCheckedChange={onToggle} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting…" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onReset,
  onAdd,
}: {
  hasSearch: boolean;
  onReset: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="mt-6 rounded-[30px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-300/10">
        <Utensils className="h-7 w-7 text-orange-300" />
      </div>
      <h3 className="mt-5 text-xl font-black">
        {hasSearch ? "No dishes found" : "Your menu is waiting"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        {hasSearch
          ? "Try a different search or category, or reset your filters."
          : "Add your first dish and start building a menu customers will remember."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasSearch && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white/60 hover:bg-white/[0.09] hover:text-white"
          >
            Reset filters
          </button>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-orange-300 px-4 py-2.5 text-sm font-black text-[#171006] hover:bg-orange-200"
        >
          <Plus className="mr-1.5 inline h-4 w-4" />
          Add dish
        </button>
      </div>
    </div>
  );
}
