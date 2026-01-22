import React from "react";

const NotificationsTable = ({
  notifications = [],
  onViewAll,
  title = "Notifications",
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative flex max-h-[440px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-primary px-5 py-4">
        <h4 className="text-sm font-semibold tracking-wide text-white">
          {title}
        </h4>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            unreadCount > 0
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {unreadCount} new
        </span>
      </div>

      {/* Notification List */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`group relative rounded-xl border p-4 transition-all duration-200 hover:shadow-2xl ${
                n.isRead
                  ? "border-gray-100 bg-white"
                  : "border-indigo-100 bg-indigo-50/60"
              }`}
            >
              {/* Unread Indicator */}
              {!n.isRead && (
                <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-indigo-500" />
              )}

              <div className="flex items-start justify-between gap-2  ">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {n.title}
                </p>

                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {n.message.doctor}
              </p>

              <p className="mt-2 text-[11px] text-gray-400">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No new notifications
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        onClick={onViewAll}
        className="group flex items-center justify-center gap-2 border-t bg-primary py-3 text-sm font-medium text-white transition-all hover:bg-indigo-100"
      >
        View all
        <span className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
};

export default NotificationsTable;
