import { createContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext()

const AppContextProvider = (props) => {

  const currencySymbol = '₹ '
  const backendUrl = import.meta.env.VITE_BACKEND_URL;   

   const navigate = useNavigate(); 

  
  const [doctors, setDoctors] = useState([]); 
     const [token, setToken] = useState(localStorage.getItem("token") || "");

   const [userData, setUserData] = useState({});


   const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }; 

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.user);
        console.log("data.user",data.user)
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }; 

  const logout = () => {
  localStorage.removeItem("token"); // ✅ Clear token from localStorage
  setToken("");                     // ✅ Reset state
  setUserData(false); 
   navigate("/login");              // ✅ Reset user data
  toast.success("Logged out successfully");
};


  const value = {
     
    doctors,
     getDoctorsData,
    currencySymbol,
     token,
    setToken,
    backendUrl,
     userData,
    setUserData,
    loadUserProfileData,
      logout,
 
  } 

   useEffect(() => {
    getDoctorsData();
  }, []); 

    useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider