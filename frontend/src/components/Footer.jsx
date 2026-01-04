import React from "react";
import { assets } from "../assets/assets";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative mt-32 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">

      {/* Top glow */}
      <div className="absolute inset-x-0 -top-32 h-64 bg-customPrimary/10 blur-3xl rounded-full" />

      <div className="relative md:mx-10 px-6 sm:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[3fr_1fr_1fr] gap-12 text-sm text-gray-600">

        {/* LEFT — Brand */}
        <div className="flex flex-col gap-5">
          <img className="w-44" src={assets.logo} alt="Prescripto" />

          <p className="max-w-md leading-6">
            Prescripto is dedicated to delivering exceptional medical care with
            compassion, precision, and innovation. Our platform connects
            patients with trusted doctors for seamless, stress-free healthcare.
          </p>

          {/* Social icons */}
          <div className="flex gap-4 mt-2">
            <a className="p-2 rounded-full bg-gray-100 hover:bg-customPrimary hover:text-white transition">
              <FaLinkedin />
            </a>
            <a className="p-2 rounded-full bg-gray-100 hover:bg-customPrimary hover:text-white transition">
              <FaGithub />
            </a>
            <a className="p-2 rounded-full bg-gray-100 hover:bg-customPrimary hover:text-white transition">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* CENTER — Company */}
        <div>
          <p className="text-base font-semibold text-gray-900 mb-5">
            Company
          </p>
          <ul className="flex flex-col gap-3">
            {["Home", "About Us", "Contact Us", "Privacy Policy"].map(
              (item, idx) => (
                <li
                  key={idx}
                  className="cursor-pointer hover:text-customPrimary transition"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        {/* RIGHT — Contact */}
        <div>
          <p className="text-base font-semibold text-gray-900 mb-5">
            Get in Touch
          </p>
          <ul className="flex flex-col gap-3">
            <li className="hover:text-customPrimary transition cursor-pointer">
              📞 +0-000-000-000
            </li>
            <li className="hover:text-customPrimary transition cursor-pointer">
              ✉️ utkarshmehta777@gmail.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <p className="py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Prescripto. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
