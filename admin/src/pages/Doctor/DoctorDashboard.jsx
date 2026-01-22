import React, { useContext, useEffect , useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext"; 
import StatCard from "../../components/Dashboard/StatCard";
import WeeklyBarChart from "../../components/Dashboard/Charts/WeeklyBarChart";
import StatusDoughnut from "../../components/Dashboard/Charts/StatusDoughnut";
import NotificationsTable from "../../components/Dashboard/NotificationsTable";
import RatingBadge from "../../components/Dashboard/RatingBadge"; 
import {getSocket} from "../../services/socket" 
import { FaMoneyBillWave, FaCalendarCheck, FaUsers } from "react-icons/fa";


const DoctorDashboard = () => {
  const {
    dToken,
    dashData,
    profileData,
    getProfileData,
    setDashData,
    getDashData,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { currency, slotDateFormat } = useContext(AppContext); 

  const [notifications, setNotifications] = useState(dashData.notifications); 
  const socket = getSocket();  

  useEffect(() => {
  if (socket && profileData?._id) {
    socket.emit("joinForNotification", profileData._id);
    console.log("👨‍⚕️ Doctor joined notification room:", profileData._id);
  }
}, [socket, profileData]);

   useEffect(() => {
    console.log("new-notification is comming");
    socket.on("new-notification", (notif) => {
      console.log("📩 Real-time notification received:", notif);
      setNotifications((prev) => [notif, ...prev]);
    });

    // return () => socket.off("new-notification");
  }, [socket]);

  useEffect(() => {
    if (dToken) {
      getProfileData();
      getDashData();
    }
  }, [dToken]);

  // // ✅ Dummy notification data
  // const notifications = [
  //   {
  //     _id: "1",
  //     title: "New Appointment Booked",
  //     message: "John Doe booked an appointment for 4:00 PM today.",
  //     createdAt: new Date().toISOString(),
  //     isRead: false,
  //   },
  //   {
  //     _id: "2",
  //     title: "Payment Received",
  //     message: "You have received ₹499 consultation fee from Jane Smith.",
  //     createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hr ago
  //     isRead: true,
  //   },
  //   {
  //     _id: "3",
  //     title: "Appointment Cancelled",
  //     message: "Patient Alex Johnson cancelled their appointment.",
  //     createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
  //     isRead: false,
  //   },
  //   {
  //     _id: "4",
  //     title: "Profile Viewed",
  //     message: "Your profile was viewed by 3 new patients this week.",
  //     createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  //     isRead: true,
  //   },
  // ];

  return (
    <>
      <div className="m-5 space-y-4">
        {/* greeting */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl"> 
           <div className="flex items-center gap-5">
          <img
            src={profileData?.image || assets.doctor_icon}
            className="w-32 h-32 rounded-full"
          />
          <div>
            <h1>
              Welcome back, {profileData?.name || "Doctor"} 👋
            </h1>
            <p>
              {profileData?.speciality} | {profileData?.experience} 
            </p>
          </div> 
          </div>
          <div className="hidden sm:block">
    <RatingBadge
      rating={profileData?.avgRating ?? profileData?.averageRating ?? 0}
      reviews={profileData?.totalReviews ?? profileData?.totalReviews ?? 0}
      size="md"
    />
  </div>
        </div>

        {/* top stats */}
        <div className="flex gap-4">
          <StatCard
            icon={<FaMoneyBillWave/>}
            label="Earnings"
            value={dashData?.today?.earnings || 0}
            subtitle="Today's revenue"
          />
          <StatCard
            icon={<FaCalendarCheck/>}
            label="Appointments"
            value={dashData?.today?.appointments || 0}
            subtitle="Today's bookings"
            change={dashData?.today?.compareToLastWeek || 1} 
          />
          <StatCard
            icon={<FaUsers/>}
            label="Patients"
            value={dashData?.today?.patients || 0}
            subtitle="Today's Unique patients"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <NotificationsTable
            notifications={notifications}
            onViewAll={() => navigate("/notifications")}
            title="Recent Notifications"
          />
          <div className="col-span-2 bg-white p-5 rounded-2xl"> 
            <h4>Weekly Appointments</h4>
            <WeeklyBarChart
              labels={dashData?.weekly?.labels}
              values={dashData?.weekly?.values}
            />
          </div>

          <div className="bg-white p-5 rounded-2xl">
            <h4>Appointment Status</h4>
            <StatusDoughnut counts={6} />
          </div>

          
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
