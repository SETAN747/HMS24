import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <section
      id="speciality"
      className="relative py-20 bg-gradient-to-b from-white to-gray-50"
    >
      {/* Soft background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-customPrimary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">
            Find by <span className="text-customPrimary">Speciality</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto">
            Browse through our network of trusted specialists and book your
            appointment in seconds.
          </p>
        </div>

        {/* Speciality Cards */}
        <div className="flex gap-6 overflow-x-auto sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 scrollbar-hide">
          {specialityData.map((item, index) => (
            <Link
              key={index}
              to={`/doctors/${item.speciality}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group min-w-[150px] sm:min-w-0 bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
            >
              {/* Icon container */}
              <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-customPrimary/10 group-hover:bg-customPrimary/20 transition">
                <img
                  src={item.image}
                  alt={item.speciality}
                  className="w-12 h-12 object-contain group-hover:scale-110 transition"
                />
              </div>

              {/* Text */}
              <p className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-customPrimary transition">
                {item.speciality}
              </p>

              <span className="mt-1 text-xs text-gray-400">
                View doctors →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialityMenu;
