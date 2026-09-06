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
  Truck,
  ChefHat,
  Utensils,
  Users,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
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
  // FETCH DASHBOARD
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

      // =====================================================
      // ORDERS API
      // =====================================================

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
  // LOCATION LOAD
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
        return "bg-emerald-50 text-emerald-700";

      case "preparing":
        return "bg-purple-50 text-purple-700";

      case "ready":
        return "bg-orange-50 text-orange-700";

      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const monthlyEarnings =
    Number(stats?.monthly_earnings || 0);

  const todayEarnings =
    Number(stats?.today_earnings || 0);

  const monthlyOrders =
    Number(stats?.monthly_orders || 0);

  const avgOrderValue =
    Math.round(Number(stats?.avg_order_value || 0));

  const avgRating =
    Number(stats?.avg_rating || 0);

  return (
    <div className="min-h-screen bg-[#F6F5F2] pb-28">

      {/* =====================================================
          PREMIUM HEADER / HERO
      ===================================================== */}

      <div className="relative overflow-hidden rounded-b-[2.8rem] bg-[#17131F] px-5 pb-32 pt-8 text-white sm:px-8">

        {/* Background glow */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF7A30]/20 blur-3xl" />

        <div className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-[#5F2EEA]/20 blur-3xl" />

        <div className="pointer-events-none absolute right-20 bottom-0 h-40 w-40 rounded-full bg-[#0FAD6E]/10 blur-3xl" />

        <div className="relative z-10">

          {/* TOP BAR */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md">

                <ChefHat className="h-5 w-5 text-orange-300" />

              </div>

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Eat Unity
                </p>

                <p className="mt-1 text-xs font-bold text-white">
                  Chef Command Center
                </p>

              </div>

            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                navigate("/notifications")
              }
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md"
            >

              <Bell className="h-5 w-5 text-white" />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-[#17131F]" />

            </motion.button>

          </div>


          {/* WELCOME */}

          <div className="mt-9">

            <div className="mb-2 flex items-center gap-2">

              <span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-orange-300">
                Kitchen Online
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            </div>

            <h1 className="text-[30px] font-bold leading-tight tracking-tight">
              Good day, Chef 👨‍🍳
            </h1>

            <p className="mt-2 max-w-xs text-[11px] leading-5 text-white/50">
              Your kitchen is ready. Let's make
              today delicious and profitable.
            </p>

          </div>


          {/* LOCATION */}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setShowLocation(true)
            }
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-left backdrop-blur-md"
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">

              <MapPin className="h-4 w-4 text-orange-300" />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-white/35">
                Kitchen Location
              </p>

              <p className="mt-1 truncate text-[10px] font-semibold text-white/80">
                {locationName}
              </p>

            </div>

            <ChevronRight className="h-4 w-4 text-white/30" />

          </motion.button>

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-20 -mt-24 px-5 sm:px-8">


        {/* ===================================================
            TODAY'S COMMAND CARD
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FF7A30] via-[#F5652C] to-[#D94C27] p-5 text-white shadow-[0_20px_45px_rgba(220,90,40,0.22)]"
        >

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Sparkles className="h-4 w-4 text-orange-100" />

                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">
                    Today's Performance
                  </p>

                </div>

                <p className="mt-3 text-[34px] font-bold tracking-tight">
                  ₹{todayEarnings.toLocaleString()}
                </p>

                <p className="mt-1 text-[9px] text-white/60">
                  Earnings generated today
                </p>

              </div>


              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">

                <IndianRupee className="h-5 w-5 text-white" />

              </div>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-3">

                <div className="flex items-center gap-2">

                  <Package className="h-3.5 w-3.5 text-white/60" />

                  <span className="text-[8px] text-white/50">
                    Total Orders
                  </span>

                </div>

                <p className="mt-1 text-lg font-bold">
                  {stats?.total_orders || 0}
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-3">

                <div className="flex items-center gap-2">

                  <Star className="h-3.5 w-3.5 text-yellow-200" />

                  <span className="text-[8px] text-white/50">
                    Rating
                  </span>

                </div>

                <p className="mt-1 text-lg font-bold">
                  {avgRating.toFixed(1)}
                </p>

              </div>

            </div>

          </div>

        </motion.div>


        {/* ===================================================
            KPI GRID
        =================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-3">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-[0_8px_25px_rgba(20,20,30,0.05)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">

                <TrendingUp className="h-4 w-4 text-purple-600" />

              </div>

              <ArrowUpRight className="h-4 w-4 text-emerald-500" />

            </div>

            <p className="mt-4 text-[8px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Revenue
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              ₹{monthlyEarnings.toLocaleString()}
            </p>

          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-[0_8px_25px_rgba(20,20,30,0.05)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">

                <Package className="h-4 w-4 text-orange-500" />

              </div>

              <span className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-bold text-orange-500">
                MONTH
              </span>

            </div>

            <p className="mt-4 text-[8px] font-bold uppercase tracking-wider text-slate-400">
              Orders
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {monthlyOrders}
            </p>

          </motion.div>

        </div>


        {/* ===================================================
            MONTHLY SNAPSHOT
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 overflow-hidden rounded-[1.8rem] bg-[#211C29] p-5 text-white"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">
                Business Snapshot
              </p>

              <h3 className="mt-2 text-lg font-bold">
                This Month
              </h3>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">

              <IndianRupee className="h-4 w-4 text-emerald-300" />

            </div>

          </div>


          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-white/[0.06] p-3">

              <p className="text-[8px] text-white/40">
                Revenue
              </p>

              <p className="mt-1 text-lg font-bold">
                ₹{monthlyEarnings.toLocaleString()}
              </p>

            </div>


            <div className="rounded-2xl bg-white/[0.06] p-3">

              <p className="text-[8px] text-white/40">
                Avg / Order
              </p>

              <p className="mt-1 text-lg font-bold">
                ₹{avgOrderValue}
              </p>

            </div>

          </div>

        </motion.div>


        {/* ===================================================
            WEEKLY ANALYTICS
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-[0_8px_25px_rgba(20,20,30,0.05)]"
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Analytics
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-900">
                Weekly Performance
              </h3>

            </div>

            <div className="rounded-xl bg-orange-50 px-3 py-2">

              <TrendingUp className="h-4 w-4 text-orange-500" />

            </div>

          </div>


          <div className="mt-5 h-[210px]">

            {weeklyData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart data={weeklyData}>

                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "none",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{
                      r: 4,
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

                  <TrendingUp className="mx-auto h-8 w-8 text-slate-200" />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Performance data will appear here
                  </p>

                </div>

              </div>

            )}

          </div>

        </motion.div>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <div className="mt-7">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Kitchen Tools
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Quick Actions
              </h3>

            </div>

            <Sparkles className="h-5 w-5 text-orange-400" />

          </div>


          <div className="grid grid-cols-2 gap-3">

            {/* ADD MENU */}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                navigate("/menu/add")
              }
              className="group relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#FF7A30] to-[#F05228] p-5 text-left text-white shadow-[0_12px_25px_rgba(255,122,48,0.18)]"
            >

              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">

                  <Plus className="h-5 w-5" />

                </div>

                <p className="mt-5 text-sm font-bold">
                  Add Menu Item
                </p>

                <p className="mt-1 text-[8px] text-white/60">
                  Create something delicious
                </p>

              </div>

            </motion.button>


            {/* TOMORROW */}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                navigate("/tomorrow-special")
              }
              className="group relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#5F2EEA] to-[#392080] p-5 text-left text-white shadow-[0_12px_25px_rgba(95,46,234,0.18)]"
            >

              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">

                  <Sparkles className="h-5 w-5" />

                </div>

                <p className="mt-5 text-sm font-bold">
                  Tomorrow Special
                </p>

                <p className="mt-1 text-[8px] text-white/60">
                  Plan tomorrow's highlight
                </p>

              </div>

            </motion.button>


            {/* SUBSCRIPTIONS */}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                navigate(
                  "/app/subscription-plans"
                )
              }
              className="group relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#E64980] to-[#8B2FC9] p-5 text-left text-white shadow-[0_12px_25px_rgba(200,60,150,0.15)]"
            >

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">

                  <Utensils className="h-5 w-5" />

                </div>

                <p className="mt-5 text-sm font-bold">
                  Subscription Plans
                </p>

                <p className="mt-1 text-[8px] text-white/60">
                  Manage diet plans
                </p>

              </div>

            </motion.button>


            {/* SUBSCRIBERS */}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                navigate("/app/subscribers")
              }
              className="group relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#0FAD6E] to-[#087F52] p-5 text-left text-white shadow-[0_12px_25px_rgba(15,173,110,0.15)]"
            >

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">

                  <Users className="h-5 w-5" />

                </div>

                <p className="mt-5 text-sm font-bold">
                  Subscribers
                </p>

                <p className="mt-1 text-[8px] text-white/60">
                  Active customers
                </p>

              </div>

            </motion.button>

          </div>

        </div>


        {/* ===================================================
            ACTIVE ORDERS
        =================================================== */}

        <div className="mt-8">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Kitchen Queue
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Active Orders
                <span className="ml-2 rounded-full bg-orange-50 px-2 py-1 text-[8px] text-orange-500">
                  {activeOrders.length}
                </span>
              </h3>

            </div>

            <button
              onClick={() =>
                navigate("/orders")
              }
              className="flex items-center gap-1 text-[9px] font-bold text-orange-500"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

          </div>


          {activeOrders.length === 0 ? (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[1.8rem] border border-dashed border-slate-200 bg-white p-8 text-center"
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">

                <CheckCircle className="h-6 w-6 text-emerald-500" />

              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-800">
                Kitchen is clear
              </h4>

              <p className="mt-1 text-[9px] text-slate-400">
                No active orders right now.
                Enjoy the calm before the next rush.
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
                          x: 20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.07,
                        }}
                        onClick={() =>
                          navigate(
                            `/orders/${order.id}`
                          )
                        }
                        className="w-full rounded-[1.7rem] border border-slate-100 bg-white p-4 text-left shadow-[0_7px_25px_rgba(20,20,30,0.04)]"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50">

                            <StatusIcon className="h-5 w-5 text-slate-700" />

                          </div>


                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <p className="truncate text-xs font-bold text-slate-900">
                                {order.customer}
                              </p>

                              <span className="shrink-0 text-sm font-bold text-orange-500">
                                ₹{order.amount}
                              </span>

                            </div>

                            <p className="mt-1 truncate text-[9px] text-slate-400">
                              {order.items ||
                                "Food order"}
                            </p>

                          </div>

                        </div>


                        <div className="mt-3 flex items-center justify-between">

                          <span
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-bold ${getStatusStyle(
                              order.status
                            )}`}
                          >

                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {getStatusLabel(
                              order.status
                            )}

                          </span>


                          <span className="flex items-center gap-1 text-[8px] text-slate-400">

                            Open order

                            <ChevronRight className="h-3 w-3" />

                          </span>

                        </div>

                      </motion.button>

                    );
                  }
                )}

            </div>

          )}

        </div>


        {/* ===================================================
            CHEF MOTIVATION CARD
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-[1.8rem] border border-orange-100 bg-orange-50 p-5"
        >

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

              <Utensils className="h-4 w-4 text-orange-500" />

            </div>

            <div>

              <p className="text-[10px] font-bold text-orange-800">
                Keep the kitchen moving 🔥
              </p>

              <p className="mt-1 text-[9px] leading-4 text-orange-700/60">
                Great food creates happy customers.
                Keep your menu fresh and your kitchen active.
              </p>

            </div>

          </div>

        </motion.div>

      </div>


      {/* =====================================================
          LOCATION MODAL
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

