import { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera } from "react-icons/fa";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!userData) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">

        {/* ===== LEFT: PROFILE CARD ===== */}
        <div className="relative bg-gradient-to-br from-customPrimary to-blue-500 rounded-3xl p-6 text-white shadow-2xl">

          <div className="relative mx-auto w-40 h-40 rounded-full ring-4 ring-white/30 overflow-hidden">
            <img
              src={image ? URL.createObjectURL(image) : userData.image}
              className="w-full h-full object-cover"
              alt=""
            />

            {isEdit && (
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                <FaCamera className="text-white text-xl" />
                <input
                  hidden
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl font-semibold">{userData.name}</h2>
            <p className="text-white/80 text-sm mt-1">{userData.email}</p>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <p><span className="font-medium">Gender:</span> {userData.gender}</p>
            <p><span className="font-medium">DOB:</span> {userData.dob}</p>
            <p><span className="font-medium">Phone:</span> {userData.phone}</p>
          </div>
        </div>

        {/* ===== RIGHT: DETAILS ===== */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-8">

          {/* SECTION: PERSONAL */}
          <Section title="Personal Information">
            <Input
              label="Full Name"
              value={userData.name}
              disabled={!isEdit}
              onChange={(e) =>
                setUserData((p) => ({ ...p, name: e.target.value }))
              }
            />
            <Input
              label="Phone"
              value={userData.phone}
              disabled={!isEdit}
              onChange={(e) =>
                setUserData((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </Section>

          {/* SECTION: ADDRESS */}
          <Section title="Address">
            <Input
              label="Address Line 1"
              value={userData.address?.line1 || ""}
              disabled={!isEdit}
              onChange={(e) =>
                setUserData((p) => ({
                  ...p,
                  address: { ...p.address, line1: e.target.value },
                }))
              }
            />
            <Input
              label="Address Line 2"
              value={userData.address?.line2 || ""}
              disabled={!isEdit}
              onChange={(e) =>
                setUserData((p) => ({
                  ...p,
                  address: { ...p.address, line2: e.target.value },
                }))
              }
            />
          </Section>

          {/* SECTION: BASIC */}
          <Section title="Basic Details">
            <Select
              label="Gender"
              value={userData.gender}
              disabled={!isEdit}
              onChange={(e) =>
                setUserData((p) => ({ ...p, gender: e.target.value }))
              }
            />
            <Input
              type="date"
              label="Date of Birth"
              value={userData.dob}
              disabled={!isEdit}
              onChange={(e) =>
                setUserData((p) => ({ ...p, dob: e.target.value }))
              }
            />
          </Section>

          {/* ACTION */}
          <div className="mt-10 flex justify-end">
            {isEdit ? (
              <button
                onClick={updateUserProfileData}
                className="bg-customPrimary text-white px-10 py-3 rounded-full shadow hover:scale-105 transition"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="border border-customPrimary text-customPrimary px-10 py-3 rounded-full hover:bg-customPrimary hover:text-white transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Reusable UI ===== */

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Input = ({ label, disabled, ...props }) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <input
      {...props}
      disabled={disabled}
      className={`w-full mt-1 px-4 py-2 rounded-lg border ${
        disabled ? "bg-gray-100" : "bg-white"
      } focus:ring-2 focus:ring-customPrimary outline-none`}
    />
  </div>
);

const Select = ({ label, disabled, ...props }) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <select
      {...props}
      disabled={disabled}
      className="w-full mt-1 px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-customPrimary outline-none"
    >
      <option>Male</option>
      <option>Female</option>
    </select>
  </div>
);

export default MyProfile;
