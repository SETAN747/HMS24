import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import AppointmentFormModal from "../components/Forms/AppointmentFormModal";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
    console.log(docInfo);
  };

  const bookAppointment = async (formData) => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }
    console.log("🧾 Patient Details:", formData);
    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime, patientDetails: formData },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const getAvailableSlots = async () => {
    setDocSlots([]); // Clear previous slots

    // Get the current date and time
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      // Create a new date for each day
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Set the end time for each day (9:00 PM)
      let endTime = new Date(today);
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0); // 9:00 PM

      // If it's today, handle time based on the current time
      if (today.getDate() === currentDate.getDate()) {
        // If it's after 8:00 PM, skip today's slots
        if (currentDate.getHours() >= 20) {
          continue;
        }

        // Start from the next hour, but at least 10:00 AM
        currentDate.setHours(Math.max(currentDate.getHours() + 1, 10));
        // Set minutes to 00 or 30, rounding based on the current minute
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        // For future days, start from 10:00 AM
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      // Generate time slots for the day, every 30 minutes
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          // Add the slot to the array
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        // Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      // Update the state with the new time slots for the day
      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  useEffect(() => {
    if (
      docSlots.length &&
      docSlots[slotIndex] &&
      docSlots[slotIndex].length > 0
    ) {
      // Automatically set first available time for selected date
      setSlotTime(docSlots[slotIndex][0].time);
    } else {
      setSlotTime(""); // reset if no slots
    }
  }, [slotIndex, docSlots]);

  

  return (
    docInfo && (
      <div>
        {/* ...... Doctor Details ...... */}
         <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        
        {/* Doctor Image */}
        <div className="relative">
          <img
            src={docInfo.image}
            alt=""
            className="rounded-3xl w-full h-[360px] object-cover shadow-xl bg-customPrimary/10"
          />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow">
            <p className="text-sm font-semibold text-gray-800">
              {currencySymbol}{docInfo.fees}
            </p>
            <p className="text-xs text-gray-500">Consultation Fee</p>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white rounded-3xl shadow-xl border p-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {docInfo.name}
            </h1>
            <img src={assets.verified_icon} className="w-5" alt="" />
          </div>

          <p className="text-indigo-600 mt-1">
            {docInfo.degree} · {docInfo.speciality}
          </p>

          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full border bg-indigo-50 text-indigo-700">
            {docInfo.experience}
          </span>

          {/* About */}
          <div className="mt-6">
            <p className="flex items-center gap-2 font-medium text-gray-900">
              About
              <img src={assets.info_icon} className="w-4" alt="" />
            </p>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {docInfo.about}
            </p>
          </div>
        </div>
      </div>

               {/* Booking Slots */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Select Appointment Slot
        </h2>

        {/* Days */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {docSlots.length &&
            docSlots.map((item, index) => (
              <div
                key={index}
                onClick={() => setSlotIndex(index)}
                className={`min-w-[90px] p-4 rounded-2xl text-center cursor-pointer transition-all ${
                  slotIndex === index
                    ? "bg-customPrimary text-white shadow-lg scale-105"
                    : "bg-white border hover:border-indigo-400"
                }`}
              >
                <p className="text-xs">
                  {item[0] && daysOfWeek[item[0].datetime.getDay()]}
                </p>
                <p className="text-lg font-semibold">
                  {item[0] && item[0].datetime.getDate()}
                </p>
              </div>
            ))}
        </div>

        {/* Time Slots */}
        <div className="flex gap-3 overflow-x-auto mt-6 pb-2">
          {/* {docSlots.length &&
            docSlots[slotIndex]?.map((item, index) => (
              <button
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`px-6 py-2 rounded-full text-sm transition-all ${
                  slotTime === item.time
                    ? "bg-customPrimary text-white shadow-md"
                    : "border text-gray-500 hover:border-indigo-500 hover:text-indigo-600"
                }`}
              >
                {item.time.toLowerCase()}
              </button>
            ))} */}
        </div>

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-customPrimary hover:bg-indigo-700 text-white px-10 py-4 rounded-full shadow-xl transition-all"
          >
            Book Appointment
          </button>
        </div>

        <AppointmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={bookAppointment}
        />
      </div>


        {/* Listing Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
