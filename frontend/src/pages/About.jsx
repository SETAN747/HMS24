import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          About <span className="text-customPrimary">Us</span>
        </h1>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Your trusted partner in modern healthcare management
        </p>
      </div>

      {/* About Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Image */}
        <div className="flex justify-center">
          <img
            src={assets.about_image}
            alt="About Prescripto"
            className="rounded-2xl shadow-lg max-w-md w-full"
          />
        </div>

        {/* Text */}
        <div className="space-y-6 text-gray-600 leading-relaxed animate-[float_4s_ease-in-out_infinite]">
          <p>
            Welcome to <span className="font-medium text-gray-800">Prescripto</span>,
            your trusted partner in managing your healthcare needs conveniently
            and efficiently. We understand the challenges individuals face when
            it comes to scheduling doctor appointments and maintaining health
            records.
          </p>

          <p>
            Prescripto is committed to excellence in healthcare technology. We
            continuously improve our platform by integrating the latest
            advancements to deliver a smooth and reliable experience.
          </p>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800">
              Our Vision
            </h3>
            <p className="mt-2">
              Our vision is to create a seamless healthcare experience by
              bridging the gap between patients and healthcare providers —
              making quality care accessible anytime, anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mt-20">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Why <span className="text-customPrimary">Choose Us</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1 */}
          <div className="bg-white border rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-800 mb-3">
              Efficiency
            </h3>
            <p className="text-gray-600 text-sm">
              Streamlined appointment scheduling that fits perfectly into your
              busy lifestyle.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-800 mb-3">
              Convenience
            </h3>
            <p className="text-gray-600 text-sm">
              Easy access to a network of trusted healthcare professionals near
              you.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-800 mb-3">
              Personalization
            </h3>
            <p className="text-gray-600 text-sm">
              Smart reminders and tailored recommendations to keep your health
              on track.
            </p>
          </div>

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

export default About;
