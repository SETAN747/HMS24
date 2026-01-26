import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [showReview, setShowReview] = useState(null); // appointmentId ya null
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // handle razorpay payment
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-razorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          console.log("error:", error);
          toast.error(error.message);
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.open();
  };

  // handle razorpay payment
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) { 
        console.log("init has about to called now")
        initPay(data.order);
         console.log("init has been called ")
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  const handleReviewSubmit = async (appointmentId) => {
    if (!rating || !reviewText.trim()) {
      toast.error("Please add both rating and review.");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/add-review",
        { appointmentId, rating, reviewText },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Review submitted successfully!");
        setShowReview(null);
        setReviewText("");
        setRating(0);
        getUserAppointments(); // refresh
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <>
  <div className="max-w-6xl mx-auto px-4 py-10">
    <h2 className="text-2xl font-semibold text-gray-800 mb-8">
      My Appointments
    </h2>

    <div className="space-y-6">
      {appointments.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col lg:flex-row gap-6 hover:shadow-xl transition"
        >
          {/* Doctor Image */}
          <div className="w-full lg:w-40 flex-shrink-0">
            <img
              src={item.docData.image}
              alt=""
              className="w-full h-40 object-cover rounded-xl bg-indigo-50"
            /> 

            
          </div> 

          

          {/* Doctor Info */}
          <div className="flex-1 text-sm text-gray-600">
            <h3 className="text-lg font-semibold text-gray-800">
              {item.docData.name}
            </h3>
            <p className="text-indigo-600">{item.docData.speciality}</p>

            <div className="mt-3 space-y-1">
              <p className="text-xs">
                <span className="font-medium text-gray-700">Address:</span>{" "}
                {item.docData.address.line1},{" "}
                {item.docData.address.line2}
              </p>

              <p className="text-xs">
                <span className="font-medium text-gray-700">
                  Appointment:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p> 

              <div className="w-full lg:w-40 flex-shrink-0">
            <img
              src={item.qrCode}
              alt="qrCode"
              className="w-full h-40 object-cover rounded-xl bg-indigo-50"
            />
          </div>

              <p className="text-xs">
                <span className="font-medium text-gray-700">
                  Verification Code:
                </span>{" "}
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-mono tracking-wider">
                  {item.verificationCode}
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-between gap-3 min-w-[180px]">
            {!item.cancelled && item.payment && !item.isCompleted && (
              <StatusBadge text="Paid" color="green" />
            )}

            {!item.cancelled && !item.payment && !item.isCompleted && (
              <ActionBtn
                text="Pay Online"
                onClick={() => appointmentRazorpay(item._id)}
              />
            )}

            {!item.cancelled && !item.isCompleted && (
              <DangerBtn
                text="Cancel Appointment"
                onClick={() => cancelAppointment(item._id)}
              />
            )}

            {item.cancelled && (
              <StatusBadge text="Cancelled" color="red" />
            )}

            {item.isCompleted && (
              <StatusBadge text="Completed" color="green" />
            )}

            {item.isCompleted && !item.isReviewed && (
              <button
                onClick={() => setShowReview(item._id)}
                className="border border-indigo-500 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition"
              >
                Rate & Review
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
   {showReview && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white/90 rounded-3xl shadow-2xl w-[90%] max-w-md p-6 relative">
      <button
        onClick={() => setShowReview(null)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
        Rate Your Experience
      </h2>

      {/* Stars */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl cursor-pointer transition ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        rows="4"
        className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        placeholder="Share your experience..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />

      <button
        onClick={() => handleReviewSubmit(showReview)}
        className="mt-5 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
      >
        Submit Review
      </button>
    </div>
  </div>
)}
</>

  );
}; 

const StatusBadge = ({ text, color }) => (
  <div
    className={`py-2 rounded-lg text-center text-sm font-medium border ${
      color === "green"
        ? "border-green-500 text-green-600 bg-green-50"
        : "border-red-500 text-red-600 bg-red-50"
    }`}
  >
    {text}
  </div>
);

const ActionBtn = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="py-2 rounded-lg border border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white transition"
  >
    {text}
  </button>
);

const DangerBtn = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition"
  >
    {text}
  </button>
);


export default MyAppointments;
