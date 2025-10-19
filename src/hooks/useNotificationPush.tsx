import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

function showBrowserNotification(title, body) {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
}

export function useNotificationPush() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Ya tienes el usuario aquí

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const subscription = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `agency_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new;
          console.log(
            "¡Nueva notificación en tiempo real recibida!",
            newNotification
          );

          setNotifications((prev) => [newNotification, ...prev]);
          showBrowserNotification(newNotification.title, newNotification.body);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLoading(false);
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  return { notifications, loading };
}
