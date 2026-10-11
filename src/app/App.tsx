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

    let registrationListener: PluginListenerHandle | undefined;
    let registrationErrorListener: PluginListenerHandle | undefined;
    let receivedListener: PluginListenerHandle | undefined;
    let actionListener: PluginListenerHandle | undefined;
    let cancelled = false;

    const setupPushNotifications = async () => {
      try {
        // Android: channel for background Firebase push notifications.
        if (Capacitor.getPlatform() === "android") {
          await PushNotifications.createChannel({
            id: "chef_order_alerts_v2",
            name: "New Order Alerts",
            description: "Sound alerts for new chef orders",
            importance: 5,
            visibility: 1,
          });

          // Separate channel for notifications shown in foreground.
          await LocalNotifications.createChannel({
            id: "chef_foreground_alerts",
            name: "Foreground Order Alerts",
            description: "Sound alerts for notifications received while app is open",
            importance: 5,
            visibility: 1,
            vibration: true,
          });
        }

        // Request local notification permission.
        let localPermission =
          await LocalNotifications.checkPermissions();

        if (localPermission.display === "prompt") {
          localPermission =
            await LocalNotifications.requestPermissions();
        }

        console.log(
          "Local notification permission:",
          localPermission.display
        );

        // Register listeners before requesting the FCM token.
        registrationListener = await PushNotifications.addListener(
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

        // When a push arrives while the app is open,
        // display a native local notification.
        receivedListener = await PushNotifications.addListener(
          "pushNotificationReceived",
          async (notification) => {
            console.log("Push notification received:", notification);

            if (cancelled) return;

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
                  id: Math.floor(Date.now() % 2147483647),
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

        // Request FCM permission.
        const permission =
          await PushNotifications.checkPermissions();

        let receivePermission = permission.receive;

        if (receivePermission === "prompt") {
          const requested =
            await PushNotifications.requestPermissions();

          receivePermission = requested.receive;
        }

        if (cancelled || receivePermission !== "granted") {
          console.log("Push notification permission not granted.");
          return;
        }

        await PushNotifications.register();
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
