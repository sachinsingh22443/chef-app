
import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  PushNotifications,
  type PluginListenerHandle,
} from "@capacitor/push-notifications";

import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    let registrationListener: PluginListenerHandle | undefined;
    let registrationErrorListener: PluginListenerHandle | undefined;
    let receivedListener: PluginListenerHandle | undefined;
    let actionListener: PluginListenerHandle | undefined;

    const setupPushNotifications = async () => {
      // 1. Create Android notification channels.
      if (Capacitor.getPlatform() === "android") {
        try {
          await PushNotifications.createChannel({
            id: "chef_order_alerts_v2",
            name: "New Order Alerts",
            description: "Sound alerts for new chef orders",
            importance: 5,
            visibility: 1,
          });
        } catch (error) {
          console.error("Push notification channel error:", error);
        }

        try {
          await LocalNotifications.createChannel({
            id: "chef_foreground_alerts",
            name: "Foreground Order Alerts",
            description:
              "Sound alerts for notifications received while app is open",
            importance: 5,
            visibility: 1,
            vibration: true,
          });
        } catch (error) {
          console.error("Local notification channel error:", error);
        }
      }

      if (cancelled) return;

      // 2. Request local notification permission separately.
      try {
        let localPermission =
          await LocalNotifications.checkPermissions();

        console.log(
          "Local notification permission before request:",
          localPermission.display
        );

        if (localPermission.display !== "granted") {
          localPermission =
            await LocalNotifications.requestPermissions();
        }

        console.log(
          "Local notification permission after request:",
          localPermission.display
        );
      } catch (error) {
        console.error(
          "Local notification permission error:",
          error
        );
      }

      if (cancelled) return;

      // 3. Register listeners before requesting FCM registration.
      try {
        registrationListener =
          await PushNotifications.addListener(
            "registration",
            (token) => {
              console.log("FCM device token:", token.value);
            }
          );

        registrationErrorListener =
          await PushNotifications.addListener(
            "registrationError",
            (error) => {
              console.error("Push registration error:", error);
            }
          );

        receivedListener =
          await PushNotifications.addListener(
            "pushNotificationReceived",
            async (notification) => {
              console.log(
                "Push notification received:",
                notification
              );

              if (cancelled) return;

              // Show a local notification while the app is open.
              try {
                const permission =
                  await LocalNotifications.checkPermissions();

                if (permission.display !== "granted") {
                  console.warn(
                    "Local notification permission is not granted."
                  );
                  return;
                }

                await LocalNotifications.schedule({
                  notifications: [
                    {
                      id: Math.floor(
                        Date.now() % 2147483647
                      ),
                      title: notification.title || "New Order",
                      body:
                        notification.body ||
                        "You have a new notification.",
                      channelId: "chef_foreground_alerts",
                      schedule: {
                        at: new Date(Date.now() + 1000),
                      },
                    },
                  ],
                });
              } catch (error) {
                console.error(
                  "Foreground local notification error:",
                  error
                );
              }
            }
          );

        actionListener =
          await PushNotifications.addListener(
            "pushNotificationActionPerformed",
            (action) => {
              console.log(
                "Notification opened:",
                action.notification
              );
            }
          );
      } catch (error) {
        console.error("Notification listener setup error:", error);
      }

      if (cancelled) return;

      // 4. Request Firebase push permission independently.
      try {
        let permission =
          await PushNotifications.checkPermissions();

        console.log(
          "Push permission before request:",
          permission.receive
        );

        if (permission.receive !== "granted") {
          permission =
            await PushNotifications.requestPermissions();
        }

        console.log(
          "Push permission after request:",
          permission.receive
        );

        if (cancelled) return;

        if (permission.receive !== "granted") {
          console.warn(
            "Push notification permission was not granted."
          );
          return;
        }

        // Register with Firebase Cloud Messaging.
        await PushNotifications.register();

        console.log("Push notification registration requested.");
      } catch (error) {
        console.error(
          "Push notification setup failed:",
          error
        );
      }
    };

    void setupPushNotifications();

    return () => {
      cancelled = true;

      void registrationListener?.remove();
      void registrationErrorListener?.remove();
      void receivedListener?.remove();
      void actionListener?.remove();
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
