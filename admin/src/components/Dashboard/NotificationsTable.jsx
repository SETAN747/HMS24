import React from "react";

const NotificationsTable = ({ notifications = [], onViewAll, title = "Notifications" }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md max-h-[420px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center  pb-2 mb-2">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-xs text-gray-500">
          {notifications.filter((n) => !n.isRead).length} new
        </span>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3  last:border-none cursor-pointer transition-all duration-150 hover:bg-gray-50 rounded-lg ${
                n.isRead
                  ? "text-gray-500"
                  : "text-gray-800 font-medium bg-gray-50/60"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {n.title}
                </p>
                {!n.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{n.message.doctor}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="p-6 text-gray-500 text-center text-sm">
            No new notifications
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        onClick={onViewAll}
        className="text-center py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50 border-t mt-2 rounded-b-lg"
      >
        View all
      </div>
    </div>
  );
};

export default NotificationsTable;
