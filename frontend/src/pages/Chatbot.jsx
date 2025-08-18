import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const PrescriptoAIChat = () => {
  const { doctors, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [picks, setPicks] = useState({}); // { [docId]: { dayIndex: 0, dateKey: "", time: "" } }
  const [booking, setBooking] = useState(false); // book API loading state

 useEffect(() => {
  const saved = localStorage.getItem("chatMessages"); 
  console.log(saved)

  if (saved && JSON.parse(saved).length > 0) {
    // Agar purani chat hai to wahi load karo
    setMessages(JSON.parse(saved));
  } else {
    // Agar kuch bhi nahi hai to greeting dikhado
    setMessages([
      {
        type: "ai",
        subtype: "greeting",
        text: "Hi! 👋 I’m Prescripto AI — describe your symptoms or ask a medical question.",
      },
    ]);
  }
}, []);   

useEffect(() => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}, [messages]);


const clearChat = () => {
  const greeting = [
    {
      type: "ai",
      subtype: "greeting",
      text: "Hi! 👋 I’m Prescripto AI — describe your symptoms or ask a medical question.",
    },
  ];
  setMessages(greeting);
  localStorage.setItem("chatMessages", JSON.stringify(greeting));
};

  const handleSend = async () => {
    if (!input.trim()) return;

    // push user message
    setMessages((prev) => [...prev, { type: "user", text: input }]);
    const userText = input;
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-doctor-suggestions`,
        { symptoms: userText },
        {
          headers: { token },
        }
      );

      // normalize backend type (fallbacks if backend didn't send `type`)
      const resType = data.type
        ? data.type.toString().toLowerCase()
        : data.message
        ? "advice"
        : data.doctors && data.doctors.length
        ? "doctors"
        : "advice";

      // 1) Greeting -> show greeting message
      if (resType === "greeting") {
        setMessages((prev) => [
          ...prev,
          { type: "ai", subtype: "greeting", text: data.message || "Hello!" },
        ]);
        setLoading(false);
        return;
      }

      // 2) Advice / general message -> show AI advice text
      if (resType === "advice" || resType === "message") {
        const msgText =
          data.message ||
          "Sorry, I couldn't understand. Please give more details.";
        setMessages((prev) => [
          ...prev,
          { type: "ai", subtype: "advice", text: msgText },
        ]);
        setLoading(false);
        return;
      }

      // 3) Doctors -> build slots + show doctor card + slot UI
      if (resType === "doctors") {
        if (data.doctors && data.doctors.length > 0) {
          const firstDoc = data.doctors[0];

          // build availableSlots from slots_booked (we already have buildAvailableSlots in this component)
          const slotsBooked = firstDoc.slots_booked || data.slots_booked || {};
          const availableSlots = buildAvailableSlots(slotsBooked);

          // ensure picks state exists for this doc
          setPicks((prev) =>
            prev[firstDoc._id]
              ? prev
              : {
                  ...prev,
                  [firstDoc._id]: { dayIndex: 0, dateKey: "", time: "" },
                }
          );

          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              subtype: "doctors",
              text: `I found ${data.speciality}. Select a date & time to book:`,
              doctor: firstDoc,
              availableSlots,
              docId: firstDoc._id,
            },
          ]);
        } else {
          // no doctors found fallback
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              subtype: "advice",
              text: "Sorry, we do not have doctors for this.",
            },
          ]);
        }
        setLoading(false);
        return;
      }

      // default fallback
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          subtype: "advice",
          text: data.message || "Sorry, I couldn't process that.",
        },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Error getting doctor suggestions.");
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          subtype: "advice",
          text: "⚠️ Something went wrong. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (docId) => {
    const pick = picks[docId];
    if (!pick || !pick.dateKey || !pick.time) {
      toast.warn("Please select a date and time.");
      return;
    }
    if (!token) {
      toast.warn("Please log in to book.");
      return;
    }
    try {
      setBooking(true);
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate: pick.dateKey, slotTime: pick.time },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || "Appointment booked!");
        getDoctorsData();
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            text: `✅ Appointment booked for ${pick.time} on ${pick.dateKey}.`,
          },
        ]);
        // optionally: clear pick for this doctor
        setPicks((p) => ({
          ...p,
          [docId]: { dayIndex: 0, dateKey: "", time: "" },
        }));
      } else {
        toast.error(data.message || "Booking failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Booking error.");
    } finally {
      setBooking(false);
    }
  };

  const buildAvailableSlots = (slotsBooked = {}) => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const base = new Date(today);
      base.setDate(today.getDate() + i);

      const current = new Date(base);
      const end = new Date(base);
      end.setHours(21, 0, 0, 0); // 9 PM

      if (i === 0) {
        // aaj ke liye
        const now = new Date();
        if (now.getHours() >= 20) {
          days.push([]);
          continue;
        } // 8 PM ke baad aaj skip
        const startHour = Math.max(now.getHours() + 1, 10);
        current.setHours(startHour, now.getMinutes() > 30 ? 30 : 0, 0, 0);
      } else {
        // future days
        current.setHours(10, 0, 0, 0); // 10 AM
      }

      const daySlots = [];
      while (current < end) {
        const d = current.getDate();
        const m = current.getMonth() + 1;
        const y = current.getFullYear();
        const dateKey = `${d}_${m}_${y}`;

        const time = current.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const booked = slotsBooked?.[dateKey] || [];
        const isBooked = booked.includes(time);

        if (!isBooked) {
          daySlots.push({
            dateKey, // backend ko chahiye aisa
            time, // "hh:mm AM/PM"
            weekday: current.toLocaleDateString([], { weekday: "short" }), // "Mon"
            dayNum: d, // 1..31
          });
        }
        current.setMinutes(current.getMinutes() + 30);
      }

      days.push(daySlots);
    }
    return days;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.type === "user" ? "text-right" : "text-left"}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>

            {/* Doctor Card (agar AI ne doctor suggest kiya ho) */}
            {msg.doctor && (
              <div className="mt-3 p-4 bg-white rounded-xl shadow border inline-flex gap-4 items-start">
                <img
                  src={msg.doctor.image}
                  alt={msg.doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    Dr. {msg.doctor.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {msg.doctor.degree} • {msg.doctor.speciality}
                  </p>
                  <p className="text-sm text-gray-600">
                    {msg.doctor.experience}
                  </p>
                  <p className="text-sm text-gray-800 font-semibold mt-1">
                    Fees: ₹{msg.doctor.fees}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {msg.doctor?.address?.line1}, {msg.doctor?.address?.line2}
                  </p>
                </div>
              </div>
            )}

            {/* Slots from AI */}
            {msg.availableSlots && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  Booking slots
                </p>

                {/* Date strip */}
                <div className="flex gap-2 overflow-x-auto mt-2">
                  {msg.availableSlots
                    .map((daySlots, dayIdx) => ({ daySlots, dayIdx }))
                    .filter(({ daySlots }) => daySlots.length > 0) // empty days skip
                    .map(({ daySlots, dayIdx }) => {
                      const active =
                        (picks[msg.docId]?.dayIndex ?? 0) === dayIdx;
                      return (
                        <button
                          key={dayIdx}
                          onClick={() =>
                            setPicks((prev) => ({
                              ...prev,
                              [msg.docId]: {
                                dayIndex: dayIdx,
                                dateKey: "",
                                time: "",
                              },
                            }))
                          }
                          className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                            active
                              ? "bg-blue-500 text-white"
                              : "border border-gray-300 text-gray-700"
                          }`}
                        >
                          {daySlots[0].weekday} {daySlots[0].dayNum}
                        </button>
                      );
                    })}
                </div>

                {/* Time chips */}
                <div className="flex gap-2 overflow-x-auto mt-3 sm:grid sm:grid-cols-6 sm:gap-3">
                  {(() => {
                    const selDayIndex = picks[msg.docId]?.dayIndex ?? 0;
                    const daySlots = msg.availableSlots[selDayIndex] || [];
                    return daySlots.map((slot, i) => {
                      const active =
                        picks[msg.docId]?.time === slot.time &&
                        picks[msg.docId]?.dateKey === slot.dateKey;
                      return (
                        <button
                          key={i}
                          onClick={() =>
                            setPicks((prev) => ({
                              ...prev,
                              [msg.docId]: {
                                dayIndex: selDayIndex,
                                dateKey: slot.dateKey,
                                time: slot.time,
                              },
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                            active
                              ? "bg-blue-500 text-white"
                              : "border border-gray-300 text-gray-700"
                          }`}
                        >
                          {slot.time.toLowerCase()}
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Book button */}
                <button
                  onClick={() => bookSlot(msg.docId)}
                  disabled={
                    !picks[msg.docId]?.dateKey ||
                    !picks[msg.docId]?.time ||
                    booking
                  }
                  className={`mt-4 w-full py-2 rounded-full text-sm ${
                    !picks[msg.docId]?.dateKey ||
                    !picks[msg.docId]?.time ||
                    booking
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {booking ? "Booking..." : "Book Appointment"}
                </button>

                {/* No slots fallback */}
                {msg.availableSlots.every((d) => d.length === 0) && (
                  <p className="text-xs text-red-500 mt-2">
                    No available slots in the next 7 days.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Thinking...</p>}
      </div>

      {/* Input area */}
      <div className="p-3 border-t flex gap-2  bg-white sticky bottom-0 ">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Ask about an appointment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-5 py-2 rounded-full font-medium"
        >
          Send
        </button> 
         <button
          onClick={clearChat}
          className="bg-red-500 text-white px-4 py-2 rounded-full font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default PrescriptoAIChat;
