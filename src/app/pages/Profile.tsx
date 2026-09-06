import { useNavigate } from "react-router";
import {
  Edit,
  MapPin,
  Star,
  Award,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  Clock3,
  ChefHat,
  Sparkles,
  CalendarDays,
  ChevronRight,
  Zap,
  CircleCheck,
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://chef-backend-qh12.onrender.com";

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

  const specialties =
    typeof chef?.specialties === "string"
      ? chef.specialties
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];

  const rating = Number(chef?.avg_rating || 0);
  const orderCount = Number(chef?.total_orders || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <ChefHat className="h-7 w-7 animate-pulse text-orange-400" />
          </div>
          <p className="text-sm font-medium text-white">Preparing your profile</p>
          <p className="mt-1 text-xs text-zinc-500">Loading chef workspace...</p>
        </div>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#111] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-white">Profile unavailable</h2>
          <p className="mt-2 text-sm text-zinc-500">
            We couldn't load your chef profile right now.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-amber-400/5 blur-[120px]" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {/* Top bar */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
                Chef workspace
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
          </div>

          <button
            onClick={() => navigate("/settings")}
            className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition hover:border-orange-400/30 hover:bg-orange-500/10"
            aria-label="Settings"
          >
            <SettingsIcon className="h-5 w-5 text-zinc-300 transition group-hover:rotate-45 group-hover:text-orange-300" />
          </button>
        </header>

        {/* Hero profile */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#17130f] via-[#101010] to-[#0b0b0b] shadow-2xl shadow-black/30">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-32 w-56 rounded-full bg-amber-300/5 blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div className="h-28 w-28 overflow-hidden rounded-[28px] border border-orange-300/20 bg-zinc-900 p-1 shadow-xl shadow-orange-950/20 sm:h-32 sm:w-32">
                    <img
                      src={
                        chef?.profile_image && chef.profile_image !== ""
                          ? chef.profile_image
                          : "https://via.placeholder.com/100"
                      }
                      onError={(e: any) => {
                        e.currentTarget.src = "https://via.placeholder.com/100";
                      }}
                      alt="profile"
                      className="h-full w-full rounded-[23px] object-cover"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl border-4 border-[#12100e] ${
                      isOnline ? "bg-emerald-400" : "bg-zinc-500"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-300">
                      Professional Chef
                    </span>
                    {chef?.verified && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                        <CircleCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <h2 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {chef?.name || "No Name"}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <strong className="text-zinc-200">{rating.toFixed(1)}</strong>
                      <span>rating</span>
                    </span>
                    <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                      <span className="max-w-[220px] truncate">
                        {chef?.location || "Location not added"}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-orange-50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[360px]">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Orders
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{orderCount}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">completed volume</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Rating
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{rating.toFixed(1)}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">customer score</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-orange-400/10 bg-orange-500/[0.06] p-4 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-300/70">
                    Since
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {chef?.join_date ? formatDate(chef.join_date) : "—"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">chef journey</p>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-white/8 pt-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                <p className="max-w-3xl text-sm leading-6 text-zinc-400">
                  {chef?.bio || "Add a short chef bio to tell customers what makes your kitchen special."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.length > 0 ? (
                  specialties.map((item: string, i: number) => (
                    <span
                      key={`${item}-${i}`}
                      className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-600">No specialties added</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Workspace grid */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Availability */}
          <section className="rounded-[28px] border border-white/10 bg-[#101010] p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                  <Zap className="h-4 w-4 text-orange-300" />
                </div>
                <h3 className="text-lg font-bold">Kitchen status</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Control how new orders reach your kitchen.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isOnline
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {isOnline ? "Live" : "Offline"}
              </span>
            </div>

            <div className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.025]">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                    <CircleCheck className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Online status</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {isOnline ? "Accepting new orders" : "Orders are paused"}
                    </p>
                  </div>
                </div>
                <Switch checked={isOnline} onCheckedChange={setIsOnline} />
              </div>

              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
                    <Clock3 className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Busy mode</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Add breathing room for incoming orders
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isBusyMode}
                  onCheckedChange={setIsBusyMode}
                  disabled={!isOnline}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/6 bg-black/20 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-zinc-500" />
              <p className="text-[11px] leading-5 text-zinc-500">
                Status changes here are currently kept in this profile session.
              </p>
            </div>
          </section>

          {/* Quick actions */}
          <section className="rounded-[28px] border border-white/10 bg-[#101010] p-5 sm:p-6">
            <div className="mb-5">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                <Sparkles className="h-4 w-4 text-zinc-300" />
              </div>
              <h3 className="text-lg font-bold">Quick actions</h3>
              <p className="mt-1 text-xs text-zinc-500">Jump straight to important areas.</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/profile/edit")}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left transition hover:border-orange-400/20 hover:bg-orange-500/[0.05]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                    <Edit className="h-4 w-4 text-orange-300" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Edit profile</span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">
                      Update your public chef details
                    </span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-orange-300" />
              </button>

              <button
                onClick={() => navigate("/settings")}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                    <SettingsIcon className="h-4 w-4 text-zinc-300" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Settings</span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">
                      Account and workspace preferences
                    </span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </button>
            </div>
          </section>
        </div>

        {/* Highlights */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-[#101010] p-4">
            <Award className="h-5 w-5 text-orange-300" />
            <p className="mt-4 text-xs font-bold text-zinc-300">Experience</p>
            <p className="mt-1 text-[11px] text-zinc-600">Built through orders</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#101010] p-4">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <p className="mt-4 text-xs font-bold text-zinc-300">Customer love</p>
            <p className="mt-1 text-[11px] text-zinc-600">{rating.toFixed(1)} average rating</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#101010] p-4">
            <CalendarDays className="h-5 w-5 text-sky-300" />
            <p className="mt-4 text-xs font-bold text-zinc-300">Joined</p>
            <p className="mt-1 text-[11px] text-zinc-600">
              {chef?.join_date ? formatDate(chef.join_date) : "Not available"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#101010] p-4">
            <MapPin className="h-5 w-5 text-emerald-300" />
            <p className="mt-4 text-xs font-bold text-zinc-300">Kitchen</p>
            <p className="mt-1 truncate text-[11px] text-zinc-600">
              {chef?.location || "Not added"}
            </p>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/auth/login");
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/15 bg-red-500/[0.04] py-4 text-sm font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout from chef account
        </button>

        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-700">
          Chef workspace • Profile
        </p>
      </main>
    </div>
  );
}
