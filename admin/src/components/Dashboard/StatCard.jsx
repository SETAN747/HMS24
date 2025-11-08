import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const StatCard = ({ icon, label, value, subtitle, change }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 min-w-[200px] rounded-2xl shadow-sm flex-1">
      <div className="flex-none">
        <img src={icon} alt="" className="w-12 h-12" />
      </div>
      <div className="text-left">
        <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {value}
          {change !== undefined && (
            <span
              className={`flex items-center text-sm font-medium ${
                isPositive
                  ? "text-green-600"
                  : isNegative
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {isPositive ? <FaArrowUp /> : isNegative ? <FaArrowDown /> : null}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
        {subtitle && (
          <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
