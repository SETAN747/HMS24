import React from "react";

const DoctorProfileUI = ({
  profileData,
  currency,
  isEdit,
  setIsEdit,
  setProfileData,
  updateProfile,
}) => {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
      
      {/* Profile Header */}
      <div className="flex items-center gap-5">
        <img
          className="h-28 w-28 rounded-2xl object-cover shadow-md ring-2 ring-primary/20"
          src={profileData.image}
          alt="doctor"
        />

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800">
            {profileData.name}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {profileData.degree} · {profileData.speciality}
          </p> 
          

          <span className="mt-2 inline-block rounded-full border border-gray-300 px-3 py-0.5 text-xs font-medium text-gray-600">
            {profileData.experience}
          </span>  

          
        </div> 

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {profileData.available ? "Available" : "Unavailable"}
        </span>
        
      </div>

      {/* About */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          About
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          {profileData.about}
        </p>
      </div>

      {/* Fees */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">
          Appointment Fee
        </p>

        {isEdit ? (
          <input
            type="number"
            value={profileData.fees}
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                fees: e.target.value,
              }))
            }
            className="w-24 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-primary focus:outline-none"
          />
        ) : (
          <p className="text-sm font-semibold text-gray-800">
            {currency} {profileData.fees}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Address
        </p>

        {isEdit ? (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={profileData.address.line1}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  address: { ...prev.address, line1: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />

            <input
              type="text"
              value={profileData.address.line2}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  address: { ...prev.address, line2: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        ) : (
          <p className="mt-1 text-sm text-gray-600">
            {profileData.address?.line1}
            <br />
            {profileData.address?.line2}
          </p>
        )}
      </div>

      {/* Availability Toggle */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">
          Availability Status
        </p>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={profileData.available}
            onChange={() =>
              isEdit &&
              setProfileData((prev) => ({
                ...prev,
                available: !prev.available,
              }))
            }
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm text-gray-600">
            {profileData.available ? "Available" : "Unavailable"}
          </span>
        </label>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        {isEdit ? (
          <button
            onClick={updateProfile}
            className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white shadow-md transition hover:bg-primary/90"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="rounded-full border border-primary px-6 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileUI;
