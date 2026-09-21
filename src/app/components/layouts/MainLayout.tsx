import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";

import {
  Home,
  ShoppingBag,
  Menu as MenuIcon,
  User,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "https://chef-backend-qh12.onrender.com";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sessionChecking, setSessionChecking] = useState(true);

  // =========================================================
  // SINGLE REFRESH PROMISE
  // =========================================================
  // This prevents multiple API calls from refreshing the
  // same refresh token at the same time.
  //
  // Very important because backend rotates refresh tokens.
  // =========================================================

  const refreshPromiseRef =
    useRef<Promise<string | null> | null>(null);

  // =========================================================
  // SESSION EXPIRED
  // =========================================================

  const handleSessionExpired = () => {
    console.log("❌ SESSION EXPIRED - LOGIN REQUIRED");

    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");

    navigate("/auth/login", {
      replace: true,
    });
  };

  // =========================================================
  // REFRESH CHEF ACCESS TOKEN
  // =========================================================

  const refreshChefToken = async (): Promise<string | null> => {
    // -------------------------------------------------------
    // IMPORTANT:
    // If another refresh request is already running,
    // DO NOT create another refresh request.
    // -------------------------------------------------------

    if (refreshPromiseRef.current) {
      console.log(
        "⏳ Refresh already running. Waiting for existing refresh..."
      );

      return refreshPromiseRef.current;
    }

    const refreshToken =
      localStorage.getItem("refresh_token");

    // No refresh token
    if (!refreshToken) {
      console.log(
        "❌ No refresh token found"
      );

      return null;
    }

    // -------------------------------------------------------
    // Create ONE refresh promise
    // -------------------------------------------------------

    refreshPromiseRef.current = (async () => {
      try {
        console.log(
          "🔄 Refreshing chef access token..."
        );

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

        const newRefreshToken =
          response.data?.refresh_token;

        // ---------------------------------------------------
        // Backend must return new access token
        // ---------------------------------------------------

        if (!newAccessToken) {
          throw new Error(
            "No access token received from refresh endpoint"
          );
        }

        // ---------------------------------------------------
        // SAVE NEW ACCESS TOKEN
        // ---------------------------------------------------

        localStorage.setItem(
          "token",
          newAccessToken
        );

        // ---------------------------------------------------
        // SAVE ROTATED REFRESH TOKEN
        // ---------------------------------------------------

        if (newRefreshToken) {
          localStorage.setItem(
            "refresh_token",
            newRefreshToken
          );
        }

        console.log(
          "✅ ACCESS TOKEN REFRESHED SUCCESSFULLY"
        );

        return newAccessToken;
      } catch (error: any) {
        console.error(
          "❌ CHEF TOKEN REFRESH FAILED:",
          error?.response?.data || error
        );

        return null;
      } finally {
        // ---------------------------------------------------
        // IMPORTANT:
        // Allow another refresh after this one finishes.
        // ---------------------------------------------------

        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  };

  // =========================================================
  // GET FRESH TOKEN
  // =========================================================

  const getFreshToken = async (): Promise<string | null> => {
    return refreshChefToken();
  };

  // =========================================================
  // CHECK AND RESTORE SESSION
  // =========================================================

  const checkAndRestoreSession = async () => {
    const token =
      localStorage.getItem("token");

    // -------------------------------------------------------
    // No access token
    // -------------------------------------------------------

    if (!token) {
      console.log(
        "❌ No access token found"
      );

      setSessionChecking(false);

      navigate("/auth/login", {
        replace: true,
      });

      return;
    }

    // -------------------------------------------------------
    // First check current access token
    // -------------------------------------------------------

    try {
      console.log(
        "🔍 Checking current chef session..."
      );

      const response = await axios.get(
        `${API}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // -----------------------------------------------------
      // Access token is valid
      // -----------------------------------------------------

      if (response.status === 200) {
        console.log(
          "✅ Existing access token is valid"
        );

        setSessionChecking(false);

        return;
      }
    } catch (error: any) {
      // -----------------------------------------------------
      // Only 401 means token is invalid/expired.
      // Other errors should NOT immediately logout.
      // -----------------------------------------------------

      if (
        error?.response?.status !== 401
      ) {
        console.error(
          "SESSION CHECK ERROR:",
          error?.response?.data || error
        );

        setSessionChecking(false);

        return;
      }

      console.log(
        "⚠️ Access token expired/invalid. Trying refresh..."
      );
    }

    // =======================================================
    // ACCESS TOKEN FAILED
    // TRY REFRESH TOKEN
    // =======================================================

    try {
      const newToken =
        await getFreshToken();

      // -----------------------------------------------------
      // Refresh token failed
      // -----------------------------------------------------

      if (!newToken) {
        console.log(
          "❌ Refresh token failed"
        );

        handleSessionExpired();

        return;
      }

      // -----------------------------------------------------
      // Verify newly refreshed access token
      // -----------------------------------------------------

      console.log(
        "🔍 Verifying new access token..."
      );

      const verifyResponse =
        await axios.get(
          `${API}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        );

      // -----------------------------------------------------
      // New token works
      // -----------------------------------------------------

      if (
        verifyResponse.status === 200
      ) {
        console.log(
          "✅ Session successfully restored"
        );

        setSessionChecking(false);

        return;
      }

      throw new Error(
        "New access token invalid"
      );
    } catch (error: any) {
      console.error(
        "❌ SESSION RESTORE FAILED:",
        error?.response?.data || error
      );

      handleSessionExpired();
    }
  };

  // =========================================================
  // INITIAL SESSION CHECK
  // =========================================================

  useEffect(() => {
    checkAndRestoreSession();
  }, []);

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
        // ---------------------------------------------------
        // Successful response
        // ---------------------------------------------------

        (response) => {
          return response;
        },

        // ---------------------------------------------------
        // Error response
        // ---------------------------------------------------

        async (error) => {
          const originalRequest =
            error.config;

          // -------------------------------------------------
          // No server response
          // -------------------------------------------------

          if (!error.response) {
            return Promise.reject(error);
          }

          // -------------------------------------------------
          // Only handle 401
          // -------------------------------------------------

          if (
            error.response.status !== 401
          ) {
            return Promise.reject(error);
          }

          // -------------------------------------------------
          // NEVER intercept refresh endpoint itself
          // -------------------------------------------------

          if (
            originalRequest?.url?.includes(
              "/auth/refresh"
            )
          ) {
            return Promise.reject(error);
          }

          // -------------------------------------------------
          // Prevent infinite retry loop
          // -------------------------------------------------

          if (
            (originalRequest as any)?._retry
          ) {
            console.log(
              "❌ Request already retried and still returned 401"
            );

            handleSessionExpired();

            return Promise.reject(error);
          }

          // -------------------------------------------------
          // Mark request as retried
          // -------------------------------------------------

          (originalRequest as any)._retry =
            true;

          try {
            console.log(
              "⚠️ Axios 401 → refreshing token..."
            );

            const newToken =
              await getFreshToken();

            // ------------------------------------------------
            // Refresh failed
            // ------------------------------------------------

            if (!newToken) {
              console.log(
                "❌ Axios refresh failed"
              );

              handleSessionExpired();

              return Promise.reject(
                new Error(
                  "Please login again."
                )
              );
            }

            // ------------------------------------------------
            // Update Authorization header
            // ------------------------------------------------

            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };

            console.log(
              "🔁 Retrying original Axios request..."
            );

            // ------------------------------------------------
            // Retry original request
            // ------------------------------------------------

            return axios(
              originalRequest
            );
          } catch (refreshError) {
            console.error(
              "❌ CHEF AUTO REFRESH ERROR:",
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

    // -------------------------------------------------------
    // Cleanup interceptor
    // -------------------------------------------------------

    return () => {
      axios.interceptors.response.eject(
        responseInterceptor
      );
    };
  }, []);

  // =========================================================
  // GLOBAL FETCH INTERCEPTOR
  //
  // For pages/components using fetch()
  //
  // 401
  //   ↓
  // Refresh token
  //   ↓
  // Retry same request
  // =========================================================

  useEffect(() => {
    const originalFetch =
      window.fetch;

    const wrappedFetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      // -----------------------------------------------------
      // Get request URL
      // -----------------------------------------------------

      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      // -----------------------------------------------------
      // Identify auth endpoints
      // -----------------------------------------------------

      const isRefreshRequest =
        requestUrl.includes(
          "/auth/refresh"
        );

      const isLoginRequest =
        requestUrl.includes(
          "/auth/login"
        );

      // -----------------------------------------------------
      // NEVER intercept login or refresh requests
      // -----------------------------------------------------

      if (
        isRefreshRequest ||
        isLoginRequest
      ) {
        return originalFetch(
          input,
          init
        );
      }

      // -----------------------------------------------------
      // First request
      // -----------------------------------------------------

      const response =
        await originalFetch(
          input,
          init
        );

      // -----------------------------------------------------
      // Everything except 401
      // -----------------------------------------------------

      if (
        response.status !== 401
      ) {
        return response;
      }

      // =====================================================
      // ACCESS TOKEN EXPIRED
      // =====================================================

      console.log(
        "⚠️ Fetch 401 → refreshing token..."
      );

      const newToken =
        await getFreshToken();

      // -----------------------------------------------------
      // Refresh failed
      // -----------------------------------------------------

      if (!newToken) {
        console.log(
          "❌ Fetch refresh failed"
        );

        handleSessionExpired();

        return new Response(
          JSON.stringify({
            detail:
              "Please login again.",
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

      console.log(
        "🔁 Retrying original fetch request..."
      );

      return originalFetch(
        input,
        {
          ...init,
          headers: retryHeaders,
        }
      );
    };

    // -------------------------------------------------------
    // Replace global fetch
    // -------------------------------------------------------

    window.fetch =
      wrappedFetch;

    // -------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------

    return () => {
      window.fetch =
        originalFetch;
    };
  }, []);

  // =========================================================
  // SESSION CHECKING SCREEN
  // =========================================================

  if (sessionChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

          <p className="mt-4 text-sm text-gray-500">
            Restoring your session...
          </p>
        </div>
      </div>
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

  const isActive = (
    path: string
  ) => {
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

      {/* ===================================================
          BOTTOM NAVIGATION
          =================================================== */}

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