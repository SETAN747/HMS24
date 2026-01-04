import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <section className="relative my-6 px-4 md:px-10">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-customPrimary/5 to-transparent blur-3xl" />

      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Top Doctors <span className="text-customPrimary">to Book</span>
        </h1>
        <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto">
          Hand-picked professionals trusted by thousands of patients.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="group bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-56 object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Availability badge */}
              <span
                className={`absolute top-3 left-3 px-3 py-1 text-xs rounded-full backdrop-blur-md ${
                  item.available
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {item.available ? "Available" : "Unavailable"}
              </span>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-customPrimary transition">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {item.speciality}
              </p>

              {/* CTA */}
              <button className="mt-4 w-full py-2 text-sm rounded-lg bg-customPrimary/10 text-customPrimary font-medium opacity-0 group-hover:opacity-100 transition">
                Book Appointment →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View More */}
      <div className="flex justify-center mt-14">
        <button
          onClick={() => {
            navigate("/doctors");
            window.scrollTo(0, 0);
          }}
          className="px-14 py-3 rounded-full bg-customPrimary text-white text-sm font-medium hover:scale-105 transition"
        >
          View All Doctors
        </button>
      </div>
    </section>
  );
};

export default TopDoctors;
