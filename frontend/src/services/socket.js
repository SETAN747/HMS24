import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL);
    // 🔎 Debug connection events
    socket.on("connect", () => {
      console.log("✅ Connected to socket server (Patient):", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Patient Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });
  }
  return socket;
};

export const setSocket = () => {
  socket = null;
};
