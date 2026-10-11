
import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Capacitor } from "@capacitor/core";
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

        // Create a fresh Android channel for audible order notifications.
if (Capacitor.getPlatform() === "android") {
  await PushNotifications.createChannel({
    id: "chef_order_alerts_v2",
    name: "New Order Alerts",
    description: "Sound alerts for new chef orders",
    importance: 5,
    visibility: 1,
  });
}
        // Register listeners before requesting the device token.
        registrationListener = await PushNotifications.addListener(
          "registration",
          (token) => {
            console.log("FCM device token:", token.value);
          }
        );

        registrationErrorListener = await PushNotifications.addListener(
          "registrationError",
          (error) => {
            console.error("Push registration error:", error);
          }
        );

        receivedListener = await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("Push notification received:", notification);
          }
        );

        actionListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            console.log("Notification opened:", action.notification);
          }
        );

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
        console.error("Push notification setup failed:", error);
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
