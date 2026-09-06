import {
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router";

import {
  Home,
  ShoppingBag,
  Menu as MenuIcon,
  User,
} from "lucide-react";

import { useEffect, useRef } from "react";
import axios from "axios";

const API = "https://chef-backend-qh12.onrender.com";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const refreshPromiseRef =
    useRef<Promise<string | null> | null>(null);

  // =========================================================
  // REFRESH CHEF ACCESS TOKEN
  // =========================================================

  const refreshChefToken = async (): Promise<string | null> => {
    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(
        `${API}/auth/refresh`,
        {
          refresh_token: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken =
        response.data?.access_token;

      if (!newAccessToken) {
        return null;
      }

      // Save new access token
      localStorage.setItem(
        "token",
        newAccessToken
      );

      // Save rotated refresh token if backend sends one
      if (response.data?.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          response.data.refresh_token
        );
      }

      return newAccessToken;
    } catch (error) {
      console.error(
        "CHEF TOKEN REFRESH FAILED:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // SINGLE REFRESH REQUEST
  // Prevent multiple simultaneous refresh calls
  // =========================================================

  const getFreshToken = async (): Promise<string | null> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current =
        refreshChefToken().finally(() => {
          refreshPromiseRef.current = null;
        });
    }

    return refreshPromiseRef.current;
  };

  // =========================================================
  // SESSION EXPIRED
  // Only called when refresh token also fails
  // =========================================================

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");

    // No technical "Token expired" message
    navigate("/auth/login", {
      replace: true,
    });
  };

  // =========================================================
  // GLOBAL AXIOS INTERCEPTOR
  //
  // 401
  //   ↓
  // Refresh token
  //   ↓
  // New access token
  //   ↓
  // Retry original request
  // =========================================================

  useEffect(() => {
    const responseInterceptor =
      axios.interceptors.response.use(
        (response) => {
          return response;
        },

        async (error) => {
          const originalRequest =
            error.config;

          // No response from server
          if (!error.response) {
            return Promise.reject(error);
          }

          // Only handle 401
          if (error.response.status !== 401) {
            return Promise.reject(error);
          }

          // Never intercept refresh endpoint itself
          if (
            originalRequest?.url?.includes(
              "/auth/refresh"
            )
          ) {
            handleSessionExpired();

            return Promise.reject(error);
          }

          // Prevent infinite retry loop
          if (
            (originalRequest as any)?._retry
          ) {
            handleSessionExpired();

            return Promise.reject(error);
          }

          (originalRequest as any)._retry = true;

          try {
            const newToken =
              await getFreshToken();

            // Refresh token failed
            if (!newToken) {
              handleSessionExpired();

              return Promise.reject(
                new Error(
                  "Please login again."
                )
              );
            }

            // Update Authorization header
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };

            // Retry original request
            return axios(originalRequest);
          } catch (refreshError) {
            console.error(
              "CHEF AUTO REFRESH ERROR:",
              refreshError
            );

            handleSessionExpired();

            return Promise.reject(
              new Error(
                "Please login again."
              )
            );
          }
        }
      );

    return () => {
      axios.interceptors.response.eject(
        responseInterceptor
      );
    };
  }, []);

  // =========================================================
  // GLOBAL FETCH INTERCEPTOR
  //
  // For Chef pages/components using fetch()
  //
  // 401
  //   ↓
  // Refresh token
  //   ↓
  // Retry same request
  // =========================================================

  useEffect(() => {
    const originalFetch = window.fetch;

    const wrappedFetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      const isRefreshRequest =
        requestUrl.includes("/auth/refresh");

      const isLoginRequest =
        requestUrl.includes("/auth/login");

      // Never intercept login or refresh
      if (
        isRefreshRequest ||
        isLoginRequest
      ) {
        return originalFetch(
          input,
          init
        );
      }

      // First request
      const response =
        await originalFetch(
          input,
          init
        );

      // Everything except 401
      if (response.status !== 401) {
        return response;
      }

      // =====================================================
      // ACCESS TOKEN EXPIRED
      // =====================================================

      const newToken =
        await getFreshToken();

      // Refresh failed
      if (!newToken) {
        handleSessionExpired();

        return new Response(
          JSON.stringify({
            detail: "Please login again.",
          }),
          {
            status: 401,
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      // =====================================================
      // RETRY ORIGINAL FETCH REQUEST
      // =====================================================

      const retryHeaders =
        new Headers(
          init?.headers || {}
        );

      retryHeaders.set(
        "Authorization",
        `Bearer ${newToken}`
      );

      return originalFetch(
        input,
        {
          ...init,
          headers: retryHeaders,
        }
      );
    };

    window.fetch = wrappedFetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // =========================================================
  // NORMAL TOKEN CHECK
  //
  // No "Checking session..." screen
  // =========================================================

  const token =
    localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/auth/login"
        replace
      />
    );
  }

  // =========================================================
  // BOTTOM NAVIGATION
  // =========================================================

  const navItems = [
    {
      path: "/app",
      icon: Home,
      label: "Home",
    },
    {
      path: "/app/orders",
      icon: ShoppingBag,
      label: "Orders",
    },
    {
      path: "/app/menu",
      icon: MenuIcon,
      label: "Menu",
    },
    {
      path: "/app/profile",
      icon: User,
      label: "Profile",
    },
  ];

  // =========================================================
  // ACTIVE NAVIGATION
  // =========================================================

  const isActive = (path: string) => {
    if (path === "/app") {
      return (
        location.pathname === "/app"
      );
    }

    return location.pathname.includes(
      path
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />

      {/* Bottom Navigation */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() =>
                  navigate(item.path)
                }
                className="flex flex-col items-center gap-1"
              >
                <Icon
                  className={`w-6 h-6 ${
                    active
                      ? "text-orange-500"
                      : "text-gray-400"
                  }`}
                />

                <span
                  className={`text-xs ${
                    active
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}