// CallContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../services/socket";
import { AppContext } from "./AppContext";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { userData } = useContext(AppContext);
  const [incomingCallDoctor, setIncomingCallDoctor] = useState();

  useEffect(() => {
    const socket = getSocket();

    if (userData && userData._id) {
      socket.emit("join", {
        id: userData._id,
        name: userData.name,
        role: "patient",
      });
      console.log("✅ Patient joined with:", userData._id);
    }

    socket.on("incomingCall", (data) => {
      console.log("📞 incomingCall received:", data);
      setIncomingCallDoctor({
        _id: data.fromSocketId,     // doctor's socket.id
        name: data.name,
        profilepic: data.profilepic,
        signalData: data.signal,
      });
    });

    return () => {
      socket.off("incomingCall");
    };
  }, [userData?._id]);

  return (
    <CallContext.Provider value={{ incomingCallDoctor, setIncomingCallDoctor }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
