import { io } from "socket.io-client";

let socket;

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL);
    // 🔎 Debug connection events
    socket.on("connect", () => {
      console.log("✅ Connected to socket server (Doctor):", socket.id);
    }); 

    

    socket.on("disconnect", () => {
      console.log("❌ Doctor Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });
  }
  return socket;
};

const setSocket = () => {
  socket = null;
};

export default { getSocket, setSocket };
