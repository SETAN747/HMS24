import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* Header */}
      <div className="text-center pt-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Contact <span className="text-customPrimary">Us</span>
        </h1>
        <p className="text-gray-500 mt-2">
          We’re here to help and answer any questions you may have
        </p>
      </div>

      {/* Content */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Image */}
        <div className="flex justify-center animate-[float_6s_ease-in-out_infinite]">
          <img
            src={assets.contact_image}
            alt="Contact"
            className="rounded-2xl shadow-lg max-w-md w-full"
          />
        </div>

        {/* Info Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100 animate-[float_6s_ease-in-out_infinite]">

          {/* Office */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Our Office
            </h3>
            <p className="text-gray-500 mt-2 leading-relaxed">
              00000 Willms Station <br />
              Suite 000, Washington, USA
            </p>
          </div>

          {/* Contact */}
          <div >
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Phone:</span>{" "}
              (000) 000-0000
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Email:</span>{" "}
              utkarshmehta777@gmail.com
            </p>
          </div>

          {/* Careers */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800">
              Careers at Prescripto
            </h3>
            <p className="text-gray-500 mt-2">
              Join our growing team and help us build better healthcare
              experiences.
            </p>
          </div>

          {/* CTA */}
          <button className="mt-4 bg-customPrimary text-white px-8 py-3 rounded-full hover:opacity-90 transition">
            Explore Jobs
          </button>
        </div>
      </div> 
       {/* Floating animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-14px); }
          }
        `}
      </style>
    </div>
  );
};

export default Contact;
