import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Location from "./Location";
import axios from "axios";

import {
  Package,
  Star,
  IndianRupee,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  ChefHat,
  Utensils,
  Users,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Flame,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "motion/react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [locationName, setLocationName] =
    useState("Set Kitchen Location");

  useEffect(() => {
    if (showLocation) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [showLocation]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =========================================================
  // DASHBOARD API — SAME
  // =========================================================

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://chef-backend-qh12.onrender.com/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(res.data || {});
      setWeeklyData(res.data?.weekly_data || []);
      setTopDishes(res.data?.top_dishes || []);

      const ordersRes = await axios.get(
        "https://chef-backend-qh12.onrender.com/orders/chef-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orders = ordersRes.data?.orders || [];

      const active = orders
        .filter((o: any) =>
          ["accepted", "preparing", "ready"].includes(o.status)
        )
        .map((order: any) => ({
          id: order.id,
          customer: order.customer_name || "Customer",
          items:
            order.items
              ?.map((i: any) => i.name)
              .join(", ") || "",
          amount: order.total_price || 0,
          status: order.status,
        }));

      setActiveOrders(active);
    } catch (err: any) {
      console.log("Dashboard Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/auth/login");
      }
    }
  };

  // =========================================================
  // LOCATION
  // =========================================================

  useEffect(() => {
    const saved = localStorage.getItem("location_name");

    if (saved) {
      setLocationName(saved);
    }
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";

      case "preparing":
        return "Preparing";

      case "ready":
        return "Ready";

      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return CheckCircle;

      case "preparing":
        return ChefHat;

      case "ready":
        return Package;

      default:
        return Clock;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";

      case "preparing":
        return "bg-violet-50 text-violet-600 border-violet-100";

      case "ready":
        return "bg-orange-50 text-orange-600 border-orange-100";

      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const todayEarnings = Number(
    stats?.today_earnings || 0
  );

  const monthlyEarnings = Number(
    stats?.monthly_earnings || 0
  );

  const monthlyOrders = Number(
    stats?.monthly_orders || 0
  );

  const avgOrderValue = Math.round(
    Number(stats?.avg_order_value || 0)
  );

  const avgRating = Number(
    stats?.avg_rating || 0
  );

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-28">

      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <section className="relative overflow-hidden bg-white">

        {/* Decorative blobs */}

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />

        <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="pointer-events-none absolute right-1/3 top-20 h-28 w-28 rounded-full bg-yellow-100/70 blur-2xl" />


        <div className="relative px-5 pb-28 pt-7 sm:px-8">

          {/* TOP */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 shadow-lg shadow-orange-200">

                  <ChefHat className="h-5.5 w-5.5 text-white" />

                </div>

                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">

                  <span className="h-1.5 w-1.5 rounded-full bg-white" />

                </span>

              </div>

              <div>

                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-orange-500">
                  EAT UNITY
                </p>

                <p className="mt-0.5 text-xs font-extrabold text-slate-900">
                  Chef Studio
                </p>

              </div>

            </div>


            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                navigate("/notifications")
              }
              className="relative flex h-12 w-12 items-center justify-center rounded-[17px] border border-slate-100 bg-white shadow-[0_8px_25px_rgba(15,23,42,0.07)]"
            >

              <Bell className="h-5 w-5 text-slate-700" />

              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />

            </motion.button>

          </div>


          {/* WELCOME */}

          <div className="mt-9">

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600">
                  Kitchen Live
                </span>

              </span>

              <span className="text-[9px] font-semibold text-slate-400">
                •
              </span>

              <span className="text-[9px] font-semibold text-slate-400">
                Today
              </span>

            </div>

            <h1 className="mt-3 text-[32px] font-black leading-[1.05] tracking-[-1.5px] text-slate-900">
              Good morning,
              <br />
              <span className="text-orange-500">
                Chef 👨‍🍳
              </span>
            </h1>

            <p className="mt-3 max-w-xs text-[11px] leading-5 text-slate-500">
              Everything you need to run your
              kitchen is right here.
            </p>

          </div>


          {/* LOCATION */}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setShowLocation(true)
            }
            className="mt-6 flex w-full items-center gap-3 rounded-[19px] border border-slate-100 bg-white px-4 py-3.5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">

              <MapPin className="h-4 w-4 text-orange-500" />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[7px] font-black uppercase tracking-[0.18em] text-slate-400">
                Serving From
              </p>

              <p className="mt-1 truncate text-[10px] font-extrabold text-slate-800">
                {locationName}
              </p>

            </div>

            <div className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1">

              <span className="text-[7px] font-black text-orange-500">
                CHANGE
              </span>

              <ChevronRight className="h-3 w-3 text-orange-400" />

            </div>

          </motion.button>

        </div>


        {/* WAVE */}

        <div className="absolute bottom-0 left-0 h-16 w-full overflow-hidden">

          <div className="absolute -bottom-12 left-[-5%] h-28 w-[110%] rounded-[50%] bg-[#F7F7F5]" />

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative z-10 -mt-10 px-5 sm:px-8">


        {/* ===================================================
            REVENUE HERO
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF7A18] via-[#FF641E] to-[#F0442C] p-5 text-white shadow-[0_20px_45px_rgba(249,115,22,0.25)]"
        >

          {/* decorative circles */}

          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-xl" />

          <div className="pointer-events-none absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-yellow-300/10 blur-2xl" />

          <div className="pointer-events-none absolute bottom-5 left-32 h-20 w-20 rounded-full bg-white/5 blur-xl" />


          <div className="relative">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">

                    <IndianRupee className="h-3.5 w-3.5" />

                  </div>

                  <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/70">
                    Today's Revenue
                  </span>

                </div>

                <p className="mt-3 text-[38px] font-black tracking-[-1px]">
                  ₹{todayEarnings.toLocaleString()}
                </p>

                <div className="mt-1 flex items-center gap-1.5">

                  <ArrowUpRight className="h-3.5 w-3.5" />

                  <span className="text-[9px] font-semibold text-white/65">
                    Keep the momentum going
                  </span>

                </div>

              </div>


              <div className="flex h-14 w-14 items-center justify-center rounded-[19px] bg-white/15 shadow-inner backdrop-blur-md">

                <Flame className="h-6 w-6 text-yellow-200" />

              </div>

            </div>


            {/* MINI STATS */}

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-[18px] border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">

                <div className="flex items-center gap-2">

                  <Package className="h-3.5 w-3.5 text-white/70" />

                  <span className="text-[8px] font-semibold text-white/60">
                    Total Orders
                  </span>

                </div>

                <p className="mt-1 text-xl font-black">
                  {stats?.total_orders || 0}
                </p>

              </div>


              <div className="rounded-[18px] border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">

                <div className="flex items-center gap-2">

                  <Star className="h-3.5 w-3.5 fill-yellow-200 text-yellow-200" />

                  <span className="text-[8px] font-semibold text-white/60">
                    Rating
                  </span>

                </div>

                <p className="mt-1 text-xl font-black">
                  {avgRating.toFixed(1)}
                </p>

              </div>

            </div>

          </div>

        </motion.div>


        {/* ===================================================
            KPI STRIP
        =================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-3">

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.055)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">

                <TrendingUp className="h-4 w-4 text-purple-600" />

              </div>

              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[7px] font-black text-emerald-600">
                REVENUE
              </span>

            </div>

            <p className="mt-4 text-[8px] font-bold uppercase tracking-wider text-slate-400">
              This Month
            </p>

            <p className="mt-1 text-[21px] font-black tracking-tight text-slate-900">
              ₹{monthlyEarnings.toLocaleString()}
            </p>

          </motion.div>


          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.14,
            }}
            className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.055)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                <ShoppingBag className="h-4 w-4 text-blue-600" />

              </div>

              <span className="rounded-full bg-blue-50 px-2 py-1 text-[7px] font-black text-blue-600">
                ORDERS
              </span>

            </div>

            <p className="mt-4 text-[8px] font-bold uppercase tracking-wider text-slate-400">
              This Month
            </p>

            <p className="mt-1 text-[21px] font-black tracking-tight text-slate-900">
              {monthlyOrders}
            </p>

          </motion.div>

        </div>


        {/* ===================================================
            PERFORMANCE
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mt-4 overflow-hidden rounded-[25px] border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.055)]"
        >

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />

                <p className="text-[8px] font-black uppercase tracking-[0.17em] text-slate-400">
                  Analytics
                </p>

              </div>

              <h3 className="mt-1 text-[17px] font-black text-slate-900">
                Weekly Performance
              </h3>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">

              <TrendingUp className="h-4 w-4 text-orange-500" />

            </div>

          </div>


          <div className="mt-5 h-[205px]">

            {weeklyData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart data={weeklyData}>

                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                    stroke="#F1F5F9"
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 9,
                      fill: "#94A3B8",
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 9,
                      fill: "#94A3B8",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #F1F5F9",
                      boxShadow:
                        "0 15px 35px rgba(15,23,42,0.12)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#F97316",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-full items-center justify-center">

                <div className="text-center">

                  <TrendingUp className="mx-auto h-9 w-9 text-slate-200" />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Your performance graph will appear here
                  </p>

                </div>

              </div>

            )}

          </div>

        </motion.div>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="mt-8">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                Manage Kitchen
              </p>

              <h3 className="mt-1 text-[19px] font-black text-slate-900">
                Quick Actions
              </h3>

            </div>

            <Sparkles className="h-5 w-5 text-orange-400" />

          </div>


          <div className="grid grid-cols-2 gap-3">


            {/* ADD MENU */}

            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                navigate("/menu/add")
              }
              className="relative min-h-[160px] overflow-hidden rounded-[24px] bg-gradient-to-br from-orange-500 to-red-500 p-5 text-left text-white shadow-[0_15px_30px_rgba(249,115,22,0.18)]"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/15">

                  <Plus className="h-5 w-5" />

                </div>

                <p className="mt-6 text-[14px] font-black">
                  Add Menu
                </p>

                <p className="mt-1 text-[8px] leading-4 text-white/65">
                  Create a new delicious item
                </p>

                <ArrowUpRight className="absolute right-0 top-1 h-4 w-4 text-white/50" />

              </div>

            </motion.button>


            {/* TOMORROW */}

            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                navigate("/tomorrow-special")
              }
              className="relative min-h-[160px] overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-500 to-purple-700 p-5 text-left text-white shadow-[0_15px_30px_rgba(139,92,246,0.18)]"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/15">

                  <Sparkles className="h-5 w-5" />

                </div>

                <p className="mt-6 text-[14px] font-black">
                  Tomorrow
                </p>

                <p className="mt-1 text-[8px] leading-4 text-white/65">
                  Plan your special menu
                </p>

                <ArrowUpRight className="absolute right-0 top-1 h-4 w-4 text-white/50" />

              </div>

            </motion.button>


            {/* SUBSCRIPTIONS */}

            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                navigate(
                  "/app/subscription-plans"
                )
              }
              className="relative min-h-[160px] overflow-hidden rounded-[24px] bg-gradient-to-br from-pink-500 to-fuchsia-600 p-5 text-left text-white shadow-[0_15px_30px_rgba(236,72,153,0.17)]"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/15">

                  <Utensils className="h-5 w-5" />

                </div>

                <p className="mt-6 text-[14px] font-black">
                  Subscriptions
                </p>

                <p className="mt-1 text-[8px] leading-4 text-white/65">
                  Manage your meal plans
                </p>

                <ArrowUpRight className="absolute right-0 top-1 h-4 w-4 text-white/50" />

              </div>

            </motion.button>


            {/* SUBSCRIBERS */}

            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                navigate("/app/subscribers")
              }
              className="relative min-h-[160px] overflow-hidden rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-left text-white shadow-[0_15px_30px_rgba(16,185,129,0.17)]"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/15">

                  <Users className="h-5 w-5" />

                </div>

                <p className="mt-6 text-[14px] font-black">
                  Subscribers
                </p>

                <p className="mt-1 text-[8px] leading-4 text-white/65">
                  View active customers
                </p>

                <ArrowUpRight className="absolute right-0 top-1 h-4 w-4 text-white/50" />

              </div>

            </motion.button>

          </div>

        </section>


        {/* ===================================================
            ACTIVE ORDERS
        =================================================== */}

        <section className="mt-9">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />

                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Live Kitchen
                </p>

              </div>

              <h3 className="mt-1 text-[19px] font-black text-slate-900">

                Active Orders

                <span className="ml-2 rounded-full bg-orange-100 px-2.5 py-1 text-[8px] font-black text-orange-600">
                  {activeOrders.length}
                </span>

              </h3>

            </div>

            <button
              onClick={() =>
                navigate("/orders")
              }
              className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[8px] font-black text-orange-500 shadow-sm"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </button>

          </div>


          {activeOrders.length === 0 ? (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="rounded-[25px] border border-dashed border-slate-200 bg-white p-9 text-center"
            >

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50">

                <CheckCircle className="h-7 w-7 text-emerald-500" />

              </div>

              <h4 className="mt-4 text-sm font-black text-slate-800">
                Kitchen is clear ✨
              </h4>

              <p className="mx-auto mt-1 max-w-xs text-[9px] leading-4 text-slate-400">
                No active orders right now.
                Your next order will appear here.
              </p>

            </motion.div>

          ) : (

            <div className="space-y-3">

              {activeOrders
                .slice(0, 3)
                .map(
                  (
                    order,
                    index
                  ) => {

                    const StatusIcon =
                      getStatusIcon(
                        order.status
                      );

                    return (

                      <motion.button
                        key={order.id}
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.08,
                        }}
                        whileTap={{
                          scale: 0.985,
                        }}
                        onClick={() =>
                          navigate(
                            `/orders/${order.id}`
                          )
                        }
                        className="w-full rounded-[24px] border border-slate-100 bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                      >

                        <div className="flex items-center gap-3">

                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-orange-50">

                            <StatusIcon className="h-5 w-5 text-orange-500" />

                            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

                          </div>


                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <p className="truncate text-xs font-black text-slate-900">
                                {order.customer}
                              </p>

                              <p className="shrink-0 text-sm font-black text-orange-500">
                                ₹{order.amount}
                              </p>

                            </div>

                            <p className="mt-1 truncate text-[9px] text-slate-400">
                              {order.items ||
                                "Food order"}
                            </p>

                          </div>

                        </div>


                        <div className="mt-3 flex items-center justify-between">

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[8px] font-black ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(
                              order.status
                            )}
                          </span>

                          <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                            Open
                            <ArrowUpRight className="h-3 w-3" />
                          </span>

                        </div>

                      </motion.button>

                    );
                  }
                )}

            </div>

          )}

        </section>


        {/* ===================================================
            TOP DISHES
        =================================================== */}

        {topDishes.length > 0 && (

          <section className="mt-9">

            <div className="mb-4">

              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                Customer Favorites
              </p>

              <h3 className="mt-1 text-[19px] font-black text-slate-900">
                Top Dishes
              </h3>

            </div>


            <div className="space-y-2.5">

              {topDishes
                .slice(0, 3)
                .map(
                  (
                    dish: any,
                    index: number
                  ) => (

                    <motion.div
                      key={
                        dish.id ||
                        dish.name ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: 15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.07,
                      }}
                      className="flex items-center gap-3 rounded-[20px] border border-slate-100 bg-white p-3.5 shadow-[0_7px_22px_rgba(15,23,42,0.04)]"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-orange-50 to-amber-50">

                        <Utensils className="h-4 w-4 text-orange-500" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs font-black text-slate-800">
                          {dish.name ||
                            dish.dish_name ||
                            "Popular Dish"}
                        </p>

                        <p className="mt-1 text-[8px] text-slate-400">
                          {dish.orders ||
                            dish.total_orders ||
                            0}{" "}
                          orders
                        </p>

                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">

                        <TrendingUp className="h-4 w-4 text-emerald-500" />

                      </div>

                    </motion.div>

                  )
                )}

            </div>

          </section>

        )}


        {/* ===================================================
            FOOTER CARD
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="mt-7 rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-5"
        >

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white shadow-sm">

              <ChefHat className="h-5 w-5 text-orange-500" />

            </div>

            <div>

              <p className="text-[11px] font-black text-orange-900">
                Cook. Serve. Grow. 🔥
              </p>

              <p className="mt-1 text-[9px] leading-4 text-orange-800/55">
                Every great dish is another reason
                for a customer to come back.
              </p>

            </div>

          </div>

        </motion.div>

      </main>


      {/* =====================================================
          LOCATION MODAL
          SAME API FLOW
      ===================================================== */}

      {showLocation && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-md"
          >

            <Location

              onLocationSelect={async (
                lat,
                lng,
                city
              ) => {

                try {

                  setLocationName(city);

                  const token =
                    localStorage.getItem(
                      "token"
                    );

                  if (!token) {

                    console.error(
                      "No token found"
                    );

                    return;
                  }

                  const res =
                    await fetch(
                      "https://chef-backend-qh12.onrender.com/menu/chef/set-location",
                      {
                        method: "POST",

                        headers: {
                          Authorization:
                            `Bearer ${token}`,

                          "Content-Type":
                            "application/x-www-form-urlencoded",
                        },

                        body:
                          new URLSearchParams(
                            {
                              latitude:
                                lat.toString(),

                              longitude:
                                lng.toString(),

                              location:
                                city,
                            }
                          ),
                      }
                    );

                  if (
                    res.status === 401
                  ) {

                    localStorage.removeItem(
                      "token"
                    );

                    navigate(
                      "/auth/login"
                    );

                    return;
                  }

                  if (!res.ok) {

                    throw new Error(
                      "Failed to save location"
                    );

                  }

                  const data =
                    await res.json();

                  console.log(
                    "Location saved:",
                    data
                  );

                  localStorage.setItem(
                    "lat",
                    lat.toString()
                  );

                  localStorage.setItem(
                    "lng",
                    lng.toString()
                  );

                  localStorage.setItem(
                    "location_name",
                    city
                  );

                  alert(
                    "Location saved successfully ✅"
                  );

                } catch (err) {

                  console.error(
                    "Location error:",
                    err
                  );

                } finally {

                  setShowLocation(
                    false
                  );

                }

              }}

              onClose={() =>
                setShowLocation(false)
              }

            />

          </motion.div>

        </div>

      )}

    </div>
  );
}