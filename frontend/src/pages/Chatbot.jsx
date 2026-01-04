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
  <div className="flex flex-col h-screen bg-gray-100">

    {/* Header */}
    <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Prescripto AI
        </h2>
        <p className="text-xs text-gray-500">
          Smart healthcare assistant
        </p>
      </div>
      <button
        onClick={clearChat}
        className="text-sm text-red-500 hover:underline"
      >
        Clear chat
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.type === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.type === "user"
                ? "bg-customPrimary text-white rounded-br-sm"
                : "bg-white text-gray-800 rounded-bl-sm"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}

      {/* Doctor card */}
      {messages.map(
        (msg, idx) =>
          msg.doctor && (
            <div
              key={`doc-${idx}`}
              className="bg-white rounded-2xl shadow border p-5 flex gap-4"
            >
              <img
                src={msg.doctor.image}
                alt={msg.doctor.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Dr. {msg.doctor.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {msg.doctor.degree} • {msg.doctor.speciality}
                </p>
                <p className="text-sm text-gray-500">
                  {msg.doctor.experience}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  Fees: ₹{msg.doctor.fees}
                </p>
              </div>
            </div>
          )
      )}

      {/* Slots */}
      {messages.map(
        (msg, idx) =>
          msg.availableSlots && (
            <div
              key={`slots-${idx}`}
              className="bg-white rounded-2xl shadow border p-5 space-y-4"
            >
              <p className="text-sm font-semibold text-gray-800">
                Available slots
              </p>

              {/* Dates */}
              <div className="flex gap-2 overflow-x-auto">
                {msg.availableSlots
                  .map((d, i) => ({ d, i }))
                  .filter(({ d }) => d.length > 0)
                  .map(({ d, i }) => {
                    const active =
                      picks[msg.docId]?.dayIndex === i;
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setPicks((prev) => ({
                            ...prev,
                            [msg.docId]: {
                              dayIndex: i,
                              dateKey: "",
                              time: "",
                            },
                          }))
                        }
                        className={`px-4 py-2 rounded-full text-xs font-medium ${
                          active
                            ? "bg-customPrimary text-white"
                            : "border text-gray-600"
                        }`}
                      >
                        {d[0].weekday} {d[0].dayNum}
                      </button>
                    );
                  })}
              </div>

              {/* Times */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(msg.availableSlots[picks[msg.docId]?.dayIndex ?? 0] ||
                  []).map((slot, i) => {
                  const active =
                    picks[msg.docId]?.time === slot.time;
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setPicks((prev) => ({
                          ...prev,
                          [msg.docId]: {
                            dayIndex:
                              picks[msg.docId]?.dayIndex ?? 0,
                            dateKey: slot.dateKey,
                            time: slot.time,
                          },
                        }))
                      }
                      className={`px-3 py-2 rounded-full text-xs ${
                        active
                          ? "bg-customPrimary text-white"
                          : "border text-gray-600"
                      }`}
                    >
                      {slot.time.toLowerCase()}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => bookSlot(msg.docId)}
                disabled={
                  !picks[msg.docId]?.dateKey ||
                  !picks[msg.docId]?.time ||
                  booking
                }
                className={`w-full py-3 rounded-full text-sm font-medium ${
                  booking ||
                  !picks[msg.docId]?.dateKey ||
                  !picks[msg.docId]?.time
                    ? "bg-gray-300 text-gray-600"
                    : "bg-customPrimary text-white"
                }`}
              >
                {booking ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          )
      )}

      {loading && (
        <p className="text-xs text-gray-500 italic">
          Prescripto AI is thinking...
        </p>
      )}
    </div>

    {/* Input */}
    <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
      <input
        type="text"
        className="flex-1 border rounded-full px-5 py-3 text-sm focus:outline-none"
        placeholder="Describe symptoms or ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleSend}
        className="bg-customPrimary text-white px-6 py-3 rounded-full text-sm font-medium"
      >
        Send
      </button>
    </div>
  </div>
);

};

export default PrescriptoAIChat;
