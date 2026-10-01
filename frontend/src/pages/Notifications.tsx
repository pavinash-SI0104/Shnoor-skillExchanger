import { useState } from "react";

interface Notification {
  id: number;
  type: "request" | "session" | "message" | "match";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "request",
      title: "New Exchange Request",
      description: "Avinash wants to exchange skills with you.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "session",
      title: "Upcoming Session",
      description: "Your React session with Avinash is tomorrow at 10:00 AM.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "message",
      title: "New Message",
      description: "Rahul sent you a new message.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "match",
      title: "New Skill Match",
      description: "You have a new skill match with Anjali.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
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

  return (
    <div>
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your skill exchange activity.</p>
        </div>

        {unreadCount > 0 && (
          <button
            className="secondary-button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification Summary */}
      <div className="notification-summary">
        <div className="summary-card">
          <span>Total Notifications</span>
          <strong>{notifications.length}</strong>
        </div>

        <div className="summary-card">
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </div>

        <div className="summary-card">
          <span>Read</span>
          <strong>{notifications.length - unreadCount}</strong>
        </div>
      </div>

      {/* Notifications */}
      <div className="dashboard-card notifications-card">
        <div className="card-header">
          <div>
            <h2>Recent Notifications</h2>
            <p>Your latest skill exchange updates.</p>
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
                You are all caught up! New notifications will
                appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                className={`notification-item ${
                  !notification.read ? "unread" : ""
                }`}
                key={notification.id}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <h3>{notification.title}</h3>

                  <p>{notification.description}</p>

                  <small>{notification.time}</small>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="read-button"
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    className="notification-delete"
                    onClick={() =>
                      deleteNotification(notification.id)
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