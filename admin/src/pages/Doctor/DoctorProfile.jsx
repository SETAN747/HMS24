import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import DoctorProfileUI from "../../components/Doctor/DoctorProfileUI";
import WeeklyAvailability from "./WeeklyAvailability";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = { 
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available, 
        availability: profileData.availability,
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    getProfileData();
  }, [dToken]);

  return (
     <>
      <div className="mx-auto max-w-7xl px-4 py-6">
      

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT: Doctor Profile */}
        <div className="lg:col-span-1">
          <DoctorProfileUI
            profileData={profileData}
            currency={currency}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            setProfileData={setProfileData}
            updateProfile={updateProfile}
          /> 
          
        </div>

        {/* RIGHT: Weekly Availability */}
        <div className="lg:col-span-2">
          <WeeklyAvailability
            profileData={profileData}
            setProfileData={setProfileData}
            isEdit={isEdit}
          />
        </div>
      </div>
    </div>
     </>
  );
};

export default DoctorProfile;