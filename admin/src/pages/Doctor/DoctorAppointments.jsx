import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    backendUrl
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } =
    useContext(AppContext);

  const [verifyingId, setVerifyingId] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);

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
        backendUrl +"/api/doctor/verify-appointment",
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

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto">
        {/* Table Header */}
        <div className="max-sm:hidden grid grid-cols-[0.4fr_1.8fr_1fr_0.6fr_1.6fr_1.6fr_1fr_1.2fr] gap-1 py-3 px-6 border-b bg-gray-50 font-medium text-gray-600">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Verify</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Table Rows */}
        {appointments
          .slice()
          .reverse()
          .map((item, index) => (
            <div
              key={item._id}
              className="sm:grid grid-cols-[0.4fr_1.8fr_1fr_0.6fr_1.6fr_1.6fr_1fr_1.2fr] gap-1 items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 max-sm:flex max-sm:flex-col max-sm:gap-4"
            >
              {/* Index */}
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Patient */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={item.userData.image}
                  alt="patient"
                />
                <p className="truncate">{item.userData.name}</p>
              </div>

              {/* Payment */}
              <div>
                <p className="text-xs inline border border-primary px-2 rounded-full">
                  {item.payment ? "Online" : "CASH"}
                </p>
              </div>

              {/* Age */}
              <p className="max-sm:hidden">
                {calculateAge(item.userData.dob)}
              </p>

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
                    <button
                      onClick={() => {
                        setVerifyingId(item._id);
                        setCodeInput("");
                      }}
                      className="px-3 py-1 text-sm border rounded hover:bg-indigo-50"
                    >
                      Verify
                    </button>
                    
                  </div>
                )}
              </div>

              {/* Fees */}
              <p>
                {currency}
                {item.amount}
              </p>

              {/* Action */}
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
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
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
