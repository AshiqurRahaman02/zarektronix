export const notificationRoutes = {
    getUserNotifications: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/notification/user-notifications`,
    markAsReadNotification:
      `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/notification/mark-as-read`,
    markAllAsReadNotifications: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/notification/mark-all-as-read`,
    deleteNotification: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/notification/delete-notifications`
  };
  