import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

/**
 * Collapsible Sidebar
 * - Collapse to icons (w-20) or expand (w-64)
 * - Persist state in localStorage (key: "sidebar-collapsed")
 * - Tooltips via title attribute when collapsed
 */

const navItemClass = (isActive) =>
  `flex items-center gap-3 py-3.5 px-3 cursor-pointer rounded-r-md ${
    isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : "hover:bg-gray-50"
  }`;

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  // read persisted value or default false (expanded)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const val = localStorage.getItem("sidebar-collapsed");
      return val === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", collapsed ? "true" : "false");
    } catch {}
  }, [collapsed]);

  // keyboard-friendly toggle handler
  const toggle = () => setCollapsed((c) => !c);

  // shared NavLink props to DRY
  const renderLink = (to, iconSrc, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${navItemClass(isActive)} ${collapsed ? "justify-center" : ""}`
      }
      title={collapsed ? label : undefined} // tooltip when collapsed
    >
      <img src={iconSrc} alt={`${label} icon`} className="w-5 h-5" />
      {/* label hidden when collapsed */}
      <p className={`truncate transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"} hidden md:block`}>
        {label}
      </p>
    </NavLink>
  );

  return (
    <aside
      className={`min-h-screen bg-white border-r flex flex-col
        transition-[width] duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}`}
      aria-label="Sidebar"
    >
      {/* Top: toggle + optional brand */}
      <div className="flex items-center justify-between px-2 md:px-4 py-3 border-b">
        {/* <div className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
          <img
            src={assets.logo || assets.home_icon}
            alt="logo"
            className={`w-8 h-8 ${collapsed ? "" : "mr-2"}`}
          />
          {!collapsed && <span className="font-semibold">YourApp</span>}
        </div> */}

        {/* Toggle button */}
        <button
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {/* simple hamburger / chevron icon using svg */}
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-auto mt-2">
        {aToken && (
          <ul className="text-[#515151] space-y-1 px-1 md:px-3">
            <li>{renderLink("/admin-dashboard", assets.home_icon, "Dashboard")}</li>
            <li>{renderLink("/all-appointments", assets.appointment_icon, "Appointments")}</li>
            <li>{renderLink("/add-doctor", assets.add_icon, "Add Doctor")}</li>
            <li>{renderLink("/doctor-list", assets.people_icon, "Doctors List")}</li>
          </ul>
        )}

        {dToken && (
          <ul className="text-[#515151] space-y-1 px-1 md:px-3">
            <li>{renderLink("/doctor-dashboard", assets.home_icon, "Dashboard")}</li>
            <li>{renderLink("/doctor-appointments", assets.appointment_icon, "Appointments")}</li>
            <li>{renderLink("/doctor-profile", assets.people_icon, "Profile")}</li>
          </ul>
        )}
      </nav>

       
    </aside>
  );
};

export default Sidebar;
