import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingBadge = ({
  title = "Overall Rating",
  rating = 0,
  reviews = 0,
  size = "md",
  onViewReviews,
}) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(r);
  const hasHalf = r % 1 >= 0.5;

  const stars = [];
  for (let i = 0; i < fullStars; i++)
    stars.push(<FaStar key={i} className="text-yellow-400" />);
  if (hasHalf)
    stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
  while (stars.length < 5)
    stars.push(
      <FaRegStar key={`empty-${stars.length}`} className="text-gray-300" />
    );

  const sizeClasses = {
    sm: { text: "text-sm", star: "text-base" },
    md: { text: "text-base", star: "text-lg" },
    lg: { text: "text-lg", star: "text-xl" },
  };

  return (
    <div className="flex flex-col items-start gap-3 bg-white/50 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/70 shadow-sm">
      {/* Heading */}
      <h4 className="text-sm font-medium text-gray-600">{title}</h4>

      {/* Rating Row */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${sizeClasses[size].text} text-gray-800`}
          >
            {r.toFixed(1)}
          </span>
          <div className={`flex items-center ${sizeClasses[size].star}`}>
            {stars}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewReviews) onViewReviews();
          }}
          className="text-xs text-blue-600 font-medium px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-blue-100 shadow-sm transition-all duration-200"
        >
          View
        </button>
      </div>

      {/* Review count */}
      <p className="text-xs text-gray-500 mt-1">
        {reviews} {reviews === 1 ? "review" : "reviews"}
      </p>
    </div>
  );
};

export default RatingBadge;
