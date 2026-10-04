import { useEffect, useState } from "react";
import api from "../api/api";

interface Notification {
  id: string;
  type: "request" | "session" | "message" | "match";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/notifications");

      setNotifications(
        Array.isArray(response.data?.notifications)
          ? response.data.notifications
          : []
      );
    } catch (err: any) {
      console.error("Notifications loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/users/notifications/${id}/read`);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err: any) {
      console.error("Mark notification as read error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to mark notification as read."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/users/notifications/read-all");

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err: any) {
      console.error(
        "Mark all notifications as read error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to mark notifications as read."
      );
    }
  };

  const deleteNotification = (id: string) => {
    /*
     * No delete notification backend endpoint exists yet.
     * Remove from UI for now.
     */
    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== id
      )
    );
  };

  const getNotificationIcon = (
    type: Notification["type"]
  ) => {
    switch (type) {
      case "request":
        return "📩";

      case "session":
        return "📅";

      case "message":
        return "💬";

      case "match":
        return "🤝";

      default:
        return "🔔";
    }
  };

  const getRelativeTime = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = Date.now();

    const difference = Math.max(
      0,
      currentTime - createdTime
    );

    const seconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return new Date(createdAt).toLocaleDateString();
  };

  /*
   * ================================
   * LOADING STATE
   * ================================
   */

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Notifications</h1>
            <p>Loading your notifications...</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-notifications">
            <div className="empty-notification-icon">
              🔔
            </div>

            <h3>Loading notifications...</h3>

            <p>
              Fetching your latest skill exchange
              updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ================================
   * ERROR STATE
   * ================================
   */

  if (error && notifications.length === 0) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated with your skill exchange
              activity.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="error-message">
            {error}
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={loadNotifications}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-heading">
        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with your skill exchange
            activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="secondary-button"
            type="button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ======================================
          NOTIFICATION SUMMARY
      ====================================== */}

      <div className="notification-summary">
        <div className="summary-card">
          <span>Total Notifications</span>

          <strong>
            {notifications.length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Unread</span>

          <strong>{unreadCount}</strong>
        </div>

        <div className="summary-card">
          <span>Read</span>

          <strong>
            {notifications.length -
              unreadCount}
          </strong>
        </div>
      </div>

      {/* ======================================
          NOTIFICATIONS
      ====================================== */}

      <div className="dashboard-card notifications-card">
        <div className="card-header">
          <div>
            <h2>Recent Notifications</h2>

            <p>
              Your latest skill exchange updates.
            </p>
          </div>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-notification-icon">
                🔔
              </div>

              <h3>No notifications</h3>

              <p>
                You are all caught up! New
                notifications will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                className={`notification-item ${
                  !notification.read
                    ? "unread"
                    : ""
                }`}
                key={notification.id}
              >
                <div className="notification-icon">
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                <div className="notification-content">
                  <h3>
                    {notification.title}
                  </h3>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {getRelativeTime(
                      notification.createdAt
                    )}
                  </small>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="read-button"
                      type="button"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    className="notification-delete"
                    type="button"
                    onClick={() =>
                      deleteNotification(
                        notification.id
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;