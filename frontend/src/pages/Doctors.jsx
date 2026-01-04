import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  }, [doctors, speciality]);

  const renderStars = (rating = 0) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < full; i++)
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    if (half)
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    while (stars.length < 5)
      stars.push(<FaRegStar key={stars.length} className="text-gray-300" />);
    return stars;
  };

  const specialties = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Find the <span className="text-blue-600">Right Doctor</span>
        </h1>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
          Consult verified doctors, compare ratings and book appointments instantly.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-wrap justify-center gap-3">
        {specialties.map(sp => (
          <button
            key={sp}
            onClick={() =>
              speciality === sp
                ? navigate("/doctors")
                : navigate(`/doctors/${sp}`)
            }
            className={`px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-all
              ${
                speciality === sp
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white/70 text-gray-700 hover:bg-blue-100"
              }`}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filterDoc.map((item) => (
          <div
            key={item._id}
            onClick={() => navigate(`/appointment/${item._id}`)}
            className="group relative cursor-pointer"
          >
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur opacity-0 group-hover:opacity-40 transition" />

            {/* Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              
              {/* Avatar */}
              <div className="flex justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-md group-hover:scale-105 transition"
                />
              </div>

              {/* Info */}
              <div className="text-center mt-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Dr. {item.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {item.speciality}
                </p>

                {/* Availability */}
                <div className="flex justify-center items-center gap-2 mt-3 text-sm">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.available ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`${
                      item.available ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {item.available ? "Available Today" : "Unavailable"}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex justify-center items-center gap-2 mt-3">
                  <div className="flex">{renderStars(item.averageRating)}</div>
                  <span className="text-xs text-gray-500">
                    ({item.totalReviews || 0})
                  </span>
                </div>

                {/* CTA */}
                <button className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold tracking-wide hover:opacity-90 transition">
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;
