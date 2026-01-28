import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import DoctorCall from "../../components/Doctor/DoctorCall"; 
import { FaCalendarCheck, FaUserCheck, FaStethoscope, FaTimesCircle } from "react-icons/fa";
import StatCard from "../../components/Dashboard/StatCard";
import QRScanner from "../../components/QRScanner/QRScanner";



const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    backendUrl,
    rescheduleAppointment,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  const [verifyingId, setVerifyingId] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false); 
  

  const [showScanner, setShowScanner] = useState(false);
const [scanLoading, setScanLoading] = useState(false);



  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [loadingReschedule, setLoadingReschedule] = useState(false); 

  const [callingPatient, setCallingPatient] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const verifyCode = async (appointmentId) => {
    if (!codeInput || codeInput.trim().length === 0) {
      toast.error("Please enter code");
      return;
    }
    setLoadingVerify(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/verify-appointment",
        { appointmentId, code: codeInput.trim() },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message || "Verified");
        setVerifyingId(null);
        setCodeInput("");
        await getAppointments(); // refresh list
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Error");
    } finally {
      setLoadingVerify(false);
    }
  };

  const doReschedule = async (appointmentId) => {
    if (!newDate || !newTime) {
      toast.error("Provide date and time");
      return;
    }
    setLoadingReschedule(true);
    try {
      const res = await rescheduleAppointment(appointmentId, newDate, newTime); // from DoctorContext
      if (res.success) {
        setRescheduleId(null);
        setNewDate("");
        setNewTime("");
      }
    } finally {
      setLoadingReschedule(false);
    }
  }; 

  const appointmentStats = [
  {
    icon: <FaCalendarCheck></FaCalendarCheck>,
    label: "Upcoming Appointments",
    value: 12,
    subtitle: "Today & Tomorrow",
    change: 8,
  },
  {
    icon: <FaUserCheck></FaUserCheck>,
    label: "Checked In",
    value: 5,
    subtitle: "Waiting patients",
    change: -3,
  },
  {
    icon: <FaStethoscope></FaStethoscope>,
    label: "In Consultation",
    value: 2,
    subtitle: "Ongoing",
    change: 0,
  },
  {
    icon: <FaTimesCircle></FaTimesCircle>,
    label: "Cancelled",
    value: 1,
    subtitle: "Last 24 hrs",
    change: -20,
  },
];  

  const handleQRScanSuccess = async (qrData) => {
  try {
    setScanLoading(true);

    const parsed = JSON.parse(qrData); 
    console.log("qr data : " , parsed)
    const { appointmentId, token , verificationCode } = parsed;
    
     
    const { data } = await axios.post(
      backendUrl + "/api/doctor/verify-appointment",
      { appointmentId, token , code: verificationCode },
      { headers: { dToken } }
    );

    if (data.success) {
      toast.success("Appointment checked-in ✅");
      setShowScanner(false);
      await getAppointments();
    } else {
      toast.error(data.message || "QR verification failed");
    }
  } catch (err) {
    toast.error("Invalid or corrupted QR");
  } finally {
    setScanLoading(false);
  }
};



  return (
    <>
      <div className="w-full max-w-6xl m-5"> 

        <div className="flex gap-4 overflow-x-auto px-5 mt-4">
  {appointmentStats.map((stat, index) => (
    <StatCard
      key={index}
      icon={stat.icon}
      label={stat.label}
      value={stat.value}
      subtitle={stat.subtitle}
      change={stat.change}
    />
  ))}
</div>

        <p className="mb-3 text-lg font-medium">All Appointments</p> 

        


        <div className="bg-white shadow-2xl rounded-2xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto">
          {/* Table Header */}
          <div className="max-sm:hidden sticky top-0 z-10 grid grid-cols-[0.9fr_1.5fr_0.6fr_1fr_0.6fr_1.4fr_1.4fr_1fr_1fr_1.2fr] gap-2 py-3 px-6 border-b bg-primary font-medium text-white ">
            <p>Appointment Token</p>

            <p>Patient</p>
            <p>Appointment Priority</p>
            <p>Payment Mode</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Verify Appointment</p>
            <p>Payment Status</p>
            <p>Fees</p>
            <p>Action</p>
          </div>

          {/* Table Rows */}
          {appointments
            .slice()
            .reverse()
            .map((item, index) => (
              <div
                key={item.appointmentToken}
                className="sm:grid grid-cols-[0.9fr_1.5fr_0.6fr_1fr_0.6fr_1.4fr_1.4fr_1fr_1fr_1.2fr] gap-3 items-center text-gray-600 py-3 px-8 border-b hover:bg-gray-50 max-sm:flex max-sm:flex-col max-sm:gap-4"
              >
                {/* Index */}
                <p className="max-sm:hidden">{item.appointmentToken}</p>

                {/* Patient */}
                <div className="flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={item.userData?.image}
                    alt="patient"
                  />
                  <p className="truncate">{item.patientDetails?.patientName}</p>
                </div>

                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize
    ${
      item.appointmentPriority === "normal"
        ? "bg-indigo-100 text-indigo-400"
        : item.appointmentPriority === "high"
        ? "bg-blue-100 text-blue-700"
        : item.appointmentPriority === "urgent"
        ? "bg-orange-100 text-orange-700"
        : item.appointmentPriority === "emergency"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700"
    }
  `}
                >
                  {item.appointmentPriority}
                </span>

                {/* Payment */}
                <div className="flex items-center px-3">
                  <p className="text-xs inline border border-primary px-2 rounded-full">
                    {item.payment ? "Online" : "CASH"}
                  </p>
                </div>

                {/* Age */}
                <p className="max-sm:hidden px-3">{item.patientDetails?.age}</p>

                {/* Date & Time */}
                <p>
                  {slotDateFormat(item.slotDate)}, {item.slotTime}
                </p>

                {/* Verify */}
                <div>
                  {item.isVerified ? (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Verified
                    </span>
                  ) : verifyingId === item._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        className="w-24 px-2 py-1 text-sm border rounded"
                        placeholder="6-digit"
                        maxLength={6}
                      />
                      <button
                        onClick={() => verifyCode(item._id)}
                        className="px-2 py-1 text-sm bg-indigo-600 text-white rounded"
                        disabled={loadingVerify}
                      >
                        {loadingVerify ? "..." : "Verify"}
                      </button>
                      <button
                        onClick={() => {
                          setVerifyingId(null);
                          setCodeInput("");
                        }}
                        className="px-2 py-1 text-sm border rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* <button
                        onClick={() => {
                          setVerifyingId(item._id);
                          setCodeInput("");
                        }}
                        className="px-3 py-1 text-sm border rounded hover:bg-indigo-50"
                      >
                        Verify
                      </button> */} 

                      <div className="flex gap-2">
  <button
    onClick={() => {
      setVerifyingId(item._id);
      setCodeInput("");
    }}
    className="px-3 py-1 text-sm border rounded hover:bg-indigo-50"
  >
    Code
  </button>

  <button
    onClick={() => setShowScanner(true)}
    className="px-3 py-1 text-sm bg-primary text-white rounded"
  >
    Scan QR
  </button>
</div>

                    </div>
                  )}

                  {/* {rescheduleId === item._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM - 10:30 AM"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="px-2 py-1 border rounded w-40"
                      />
                      <button
                        onClick={() => doReschedule(item._id)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded"
                      >
                        {loadingReschedule ? "..." : "Reschedule"}
                      </button>
                      <button
                        onClick={() => {
                          setRescheduleId(null);
                          setNewDate("");
                          setNewTime("");
                        }}
                        className="px-2 py-1 border rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setRescheduleId(item._id);
                        setNewDate(item.slotDate);
                        setNewTime(item.slotTime);
                      }}
                      className="px-2 py-1 border rounded"
                    >
                      Reschedule
                    </button>
                  )} */}
                </div>

                {/* Payment Status (NEW) */}
                <div>
                  {item.payment ? (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                {/* Fees */}
                <p>
                  {currency}
                  {item.amount}
                </p>

                {/* Action */}
                {item.cancelled ? (
                  <p className="inline-block text-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="inline-block text-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Completed
                  </p>
                ) : (
                  <div className="flex gap-2 items-center shrink-0">
                    <img
                      onClick={() => cancelAppointment(item._id)}
                      className="w-8 h-8 cursor-pointer"
                      src={assets.cancel_icon}
                      alt="cancel"
                    />
                    <img
                      onClick={() => completeAppointment(item._id)}
                      className="w-8 h-8 cursor-pointer"
                      src={assets.tick_icon}
                      alt="complete"
                    />
                    <button
                      onClick={() => setCallingPatient(item)} // 👈 naya state call ke liye
                      className="bg-primary text-white text-sm px-5 py-1 rounded-full"
                    >
                      Call
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      {callingPatient && (
        <DoctorCall
          patient={callingPatient.userData}
          doctor={callingPatient.docData}
          onClose={() => setCallingPatient(null)} 
        />
      )} 
       {showScanner && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30">
    <div className="relative w-[92%] max-w-md rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl p-6 animate-fadeIn">

      {/* Close button (top right) */}
      <button
        onClick={() => setShowScanner(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
      >
        ✕
      </button>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Scan Appointment QR
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Align QR inside the frame
        </p>
      </div>

      {/* Scanner Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
        <QRScanner onScanSuccess={handleQRScanSuccess} />

        {/* Scan overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-xl border-2 border-primary/70 animate-pulse" />
        </div>
      </div>

      {/* Status */}
      {scanLoading && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-primary font-medium">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Verifying appointment...
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5">
        <button
          onClick={() => setShowScanner(false)}
          className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel Scan
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
};

export default DoctorAppointments;
