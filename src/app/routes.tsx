import { createBrowserRouter, Navigate } from "react-router";

import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import OTPVerification from "./pages/auth/OTPVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ApplicationStatus from "./pages/auth/ApplicationStatus";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/orders/Orders";
import OrderDetail from "./pages/orders/OrderDetail";
import Menu from "./pages/menu/Menu";
import AddMenuItem from "./pages/menu/AddMenuItem";
import EditMenuItem from "./pages/menu/EditMenuItem";
import TomorrowSpecial from "./pages/TomorrowSpecial";
import SubscriptionOrders from "./pages/SubscriptionOrders";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import ChangePassword from "./pages/ChangePassword";
import Terms from "./pages/terms_andconditions/terms";
import Privacy from "./pages/terms_andconditions/privacy";
import Support from "./pages/terms_andconditions/support";

import CreateSubscriptionPlan from "./pages/CreateSubscriptionPlan";
import EditSubscriptionPlan from "./pages/EditSubscriptionPlan";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Subscribers from "./pages/Subscribers";

import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
  path: "/",
  element: (
    localStorage.getItem("token")
      ? <Navigate to="/app" />
      : <Navigate to="/auth/login" />
  ),
},

  // 🔐 AUTH
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "otp", element: <OTPVerification /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "status", element: <ApplicationStatus /> },
      { path: "reset-password/:token", element: <ResetPassword /> },
    ],
  },

  // 🔐 MAIN (/app)
  {
    path: "/app",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },

      { path: "orders", element: <Orders /> },
      { path: "orders/:orderId", element: <OrderDetail /> },

      { path: "menu", element: <Menu /> },
      { path: "menu/add", element: <AddMenuItem /> },
      { path: "menu/edit/:itemId", element: <EditMenuItem /> },

      { path: "tomorrow-special", element: <TomorrowSpecial /> },

      { path: "subscriptions", element: <SubscriptionOrders /> },

      { path: "profile", element: <Profile /> },
      { path: "profile/edit", element: <EditProfile /> },

      { path: "settings", element: <Settings /> },
      { path: "notifications", element: <Notifications /> },
      { path: "change-password", element: <ChangePassword /> },

      { path: "terms", element: <Terms /> },
      { path: "privacy", element: <Privacy /> },
      { path: "support", element: <Support /> },

      { path: "subscription-plans", element: <SubscriptionPlans /> },
      { path: "subscription-plans/create", element: <CreateSubscriptionPlan /> },
      { path: "subscription-plans/edit/:id", element: <EditSubscriptionPlan /> },
      { path: "subscribers", element: <Subscribers /> },
    ],
  },

  // 🔥 DUPLICATE ROUTES (NO NOTFOUND ANYWHERE)

  { path: "/menu", element: <MainLayout />, children: [{ index: true, element: <Menu /> }] },
  { path: "/menu/add", element: <MainLayout />, children: [{ index: true, element: <AddMenuItem /> }] },
  { path: "/menu/edit/:itemId", element: <MainLayout />, children: [{ index: true, element: <EditMenuItem /> }] },

  { path: "/orders", element: <MainLayout />, children: [{ index: true, element: <Orders /> }] },
  { path: "/profile", element: <MainLayout />, children: [{ index: true, element: <Profile /> }] },
  { path: "/profile/edit", element: <MainLayout />, children: [{ index: true, element: <EditProfile /> }] },

  { path: "/settings", element: <MainLayout />, children: [{ index: true, element: <Settings /> }] },
  { path: "/notifications", element: <MainLayout />, children: [{ index: true, element: <Notifications /> }] },
  { path: "/change-password", element: <MainLayout />, children: [{ index: true, element: <ChangePassword /> }] },

  { path: "/tomorrow-special", element: <MainLayout />, children: [{ index: true, element: <TomorrowSpecial /> }] },

  { path: "/terms", element: <MainLayout />, children: [{ index: true, element: <Terms /> }] },
  { path: "/privacy", element: <MainLayout />, children: [{ index: true, element: <Privacy /> }] },
  { path: "/support", element: <MainLayout />, children: [{ index: true, element: <Support /> }] },


  { 
  path: "/subscription-plans",
  element: <MainLayout />,
  children: [
    { index: true, element: <SubscriptionPlans /> }
  ]
},

{
  path: "/subscription-plans/create",
  element: <MainLayout />,
  children: [
    { index: true, element: <CreateSubscriptionPlan /> }
  ]
},

{
  path: "/subscription-plans/edit/:id",
  element: <MainLayout />,
  children: [
    { index: true, element: <EditSubscriptionPlan /> }
  ]
},

{
  path: "/subscribers",
  element: <MainLayout />,
  children: [
    { index: true, element: <Subscribers /> }
  ]
},

  { path: "*", element: <NotFound /> },
]);