import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const StatCard = ({ icon, label, value, subtitle, change }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div
      className="
        group relative flex min-w-[220px] flex-1 items-center gap-4
        rounded-2xl border border-white/40
        bg-gradient-to-br from-white via-indigo-50 to-indigo-100
        p-5 shadow-sm backdrop-blur
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
      "
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100 bg-gradient-to-r from-blue-200/30 to-indigo-200/30" />

      {/* Icon */}
      <div
        className="
          relative flex h-12 w-12 items-center justify-center
          rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500
          text-white shadow-md
        "
      >
        {icon}
      </div>

      {/* Content */}
      <div className="relative flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-900">
            {value}
          </span>

          {change !== undefined && (
            <span
              className={`
                flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                ${
                  isPositive
                    ? "bg-green-100 text-green-700"
                    : isNegative
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-400"
                }
              `}
            >
              {isPositive && <FaArrowUp />}
              {isNegative && <FaArrowDown />}
              {Math.abs(change)}%
            </span>
          )}
        </div>

        <p className="mt-1 text-sm font-medium text-gray-600">
          {label}
        </p>

        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
