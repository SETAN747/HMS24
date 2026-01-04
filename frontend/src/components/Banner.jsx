import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative my-24 md:mx-10 px-6 sm:px-10">
      {/* Glow background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-customPrimary/30 to-customPrimary/10 blur-3xl rounded-3xl" />

      <div className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-customPrimary to-customPrimary/90 rounded-3xl px-6 sm:px-10 md:px-14 py-12 md:py-16 overflow-hidden shadow-2xl">
        
        {/* Decorative blur circles */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-black/10 rounded-full blur-3xl" />

        {/* Left Content */}
        <div className="flex-1 z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Book Appointment
            <span className="block mt-3 text-white/90 text-2xl sm:text-3xl md:text-4xl font-medium">
              With 100+ Trusted Doctors
            </span>
          </h2>

          <p className="mt-6 text-sm sm:text-base text-white/80 max-w-lg">
            Instant booking, verified specialists, secure consultations —
            healthcare made simple and fast.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => {
                navigate("/login");
                window.scrollTo(0, 0);
              }}
              className="px-8 py-3 rounded-full bg-white text-gray-800 text-sm sm:text-base font-medium hover:scale-105 hover:shadow-xl transition"
            >
              Create Account
            </button>

            <button
              onClick={() => {
                navigate("/doctors");
                window.scrollTo(0, 0);
              }}
              className="px-8 py-3 rounded-full border border-white/50 text-white text-sm sm:text-base hover:bg-white/10 transition"
            >
              Browse Doctors
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden md:flex relative flex-1 justify-end z-10">
          <img
            src={assets.appointment_img}
            alt="Appointment"
            className="w-[320px] lg:w-[380px] drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
          />
        </div>
      </div>

      {/* Floating animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `}
      </style>
    </section>
  );
};

export default Banner;
