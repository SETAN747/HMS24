// socket.io.js
import { Server } from "socket.io";
import callHandlers from "../sockets/callHandlers.js";
let io; // global reference store karenge

export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("✅ Socket.io initialized");

  // Socket.io events
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);
      console.log("✅ Connected to socket server:", socket.id);
    callHandlers(io, socket); // ✅ attach call handlers
  });

  return io; // agar kahin aur use karna ho
};

// Getter for io instance (optional)
export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized yet!");
  }
  return io;
}; 
