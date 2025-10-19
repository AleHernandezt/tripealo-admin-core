import { useNotificationPush } from "@/hooks/useNotificationPush";

export function NotificationBell() {
  const { notifications, loading } = useNotificationPush();

  // Muestra el icono de campana y el contador
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="notification-bell">
      <span role="img" aria-label="campana">
        🔔
      </span>
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

      {!loading && notifications.length > 0 && (
        <p>Último mensaje: {notifications[0].title}</p>
      )}
    </div>
  );
}
