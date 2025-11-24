import React, { useState, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import "../index.css";
import { AppContext } from "../context/AppContext";
import { FaBell } from "react-icons/fa";
import { getSocket } from "../services/socket";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();

  const { token, setToken, userData, logout, backendUrl } =
    useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const socket = getSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/getUserNotifications`,
          {
            headers: { token },
          }
        );
        if (data.success) {
          setNotifications(data.notifications);
          console.log("Notifications : ",data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (token) fetchNotifications();
  }, [token, backendUrl]);

  useEffect(() => {
    console.log("new-notification is comming");
    socket.on("new-notification", (notif) => {
      console.log("📩 Real-time notification received:", notif);
      setNotifications((prev) => [notif, ...prev]);
    });

    // return () => socket.off("new-notification");
  }, [socket]);

  const handleNotificationClick = async () => {
    const newState = !showNotifications;
    setShowNotifications(newState);

    if (newState) {
      try {
        // 🔹 API call to mark all unread as read
        await axios.post(
          `${backendUrl}/api/user/markNotificationAsRead`,
          {},
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt=""
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to={"/"}>
          <li className="py-1">Home</li>
          <hr className="border-none outline-none h-0.5  bg-customPrimary  w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/doctors"}>
          <li className="py-1">All DOCTORS</li>
          <hr className="border-none outline-none h-0.5  bg-customPrimary  w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/about"}>
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5  bg-customPrimary  w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/contact"}>
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5  bg-customPrimary  w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/prescripto-ai"}>
          <li className="py-1">Prescripto AI</li>
          <hr className="border-none outline-none h-0.5  bg-customPrimary  w-3/5 m-auto hidden" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 cursor-pointer  relative">
            <div className="relative cursor-pointer gap-6 right-5">
              <FaBell
                className="text-gray-700 text-xl hover:text-customPrimary transition "
                onClick={handleNotificationClick}
              />
              {/* Optional red dot for unread notifications */}

              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-2xl border border-gray-200 z-50">
                  {/* Header */}
                  <div className="p-3 font-semibold border-b text-gray-700 flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-xs text-gray-500">
                      {notifications.filter((n) => !n.isRead).length} new
                    </span>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 border-b last:border-none cursor-pointer transition-all duration-150 hover:bg-gray-50 ${
                            n.isRead
                              ? "text-gray-500"
                              : "text-gray-800 font-medium bg-gray-50/40"
                          }`}
                        >
                          {/* Title */}
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-2 h-2 bg-customPrimary rounded-full ml-2"></span>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm text-gray-600 mt-1">
                            {n?.message?.patient}
                          </p>

                          {/* Time */}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-gray-500 text-center text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    onClick={() => navigate("/notifications")}
                    className="text-center py-2 text-customPrimary font-medium cursor-pointer hover:bg-gray-50 border-t"
                  >
                    View all
                  </div>
                </div>
              )}
            </div>
            <div className="relative group cursor-pointer flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={userData.image}
                alt="user"
              />
              <img className="w-2.5" src={assets.dropdown_icon} alt="" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48  bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={logout}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className=" bg-customPrimary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create Account
          </button>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/*....... Mobile Menu ....*/}
        <div
          className={` ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-30 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">Home</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block"> All Doctors</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block"> About</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block"> Contact</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/prescripto-ai">
              <p className="px-4 py-2 rounded inline-block">Prescripto AI</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
