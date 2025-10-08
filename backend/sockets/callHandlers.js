// socket/callHandlers.js
let onlineUsers = []; // [{ userId, name, role, socketId }]
const activeCalls = new Map(); // key: userId (DB id), value: { with: otherUserId, socketId }

export default function callHandlers(io, socket) {
  console.log("📞 Call handlers attached for:", socket.id);

  // When user connects & identifies themself (frontend must emit 'join')
  socket.on("join", (user) => {
    if (!user || !user.id) return;
    console.log(
      `➡️ connected : user ${user.name}  ${user.id} (socket ${socket.id})`
    );

    // store or update mapping
    const existing = onlineUsers.find((u) => u.userId === user.id);
    if (existing) {
      existing.socketId = socket.id;
      existing.name = user.name || existing.name;
      existing.role = user.role || existing.role;
    } else {
      console.log("New user pushed in onlineUsers List");
      onlineUsers.push({
        userId: user.id,
        name: user.name || "",
        role: user.role || "",
        socketId: socket.id,
      }); 
       console.log("🟢 Current onlineUsers:", onlineUsers);
    }

    // broadcast online list if you want
    io.emit("online-users", onlineUsers);
  });

  // Doctor requests call to patient (data.callToUserId is patient DB id)
  socket.on("callToUser", (data) => {
    console.log("📥 Backend received callToUser:", data);
    console.log("🟢 Current onlineUsers:", onlineUsers);
    const callee = onlineUsers.find((u) => u.userId === data.callToUserId);
    if (!callee) {
      socket.emit("userUnavailable", { message: "User is offline." });
      console.log("❌ callToUser: callee not found", data.callToUserId);
      return;
    }

    if (activeCalls.has(data.callToUserId)) {
      socket.emit("userBusy", { message: "User is busy." });
      console.log("⛔ callToUser: callee busy", data.callToUserId);
      return;
    }

    // forward incoming call to callee's socketId
    io.to(callee.socketId).emit("incomingCall", {
      signal: data.signalData,
      fromSocketId: socket.id, // doctor's socket.id
      fromUserId: data.fromUserId || null, // optional DB id if you send it
      name: data.name,
      profilepic: data.profilepic,
    });
    console.log("📤 Forwarded incomingCall to", callee.socketId);
  });

  // Patient accepts — frontend should emit "callAccepted" with { signal, to: doctorSocketId }
  socket.on("callAccepted", (data) => {
    console.log("📥 Backend received callAccepted:", data);
    // forward to doctor's socket id
    io.to(data.to).emit("callAccepted", {
      signal: data.signal,
      fromSocketId: socket.id, // patient's socket id
    });
    // record active call by userIds (if available)
    const patientEntry = onlineUsers.find((u) => u.socketId === socket.id);
    const doctorEntry = onlineUsers.find((u) => u.socketId === data.to);
    if (patientEntry && doctorEntry) {
      activeCalls.set(patientEntry.userId, {
        with: doctorEntry.userId,
        socketId: socket.id,
      });
      activeCalls.set(doctorEntry.userId, {
        with: patientEntry.userId,
        socketId: data.to,
      });
      console.log(
        "🔒 Active call set:",
        patientEntry.userId,
        "<->",
        doctorEntry.userId
      );
    }
  });

  // Reject
  socket.on("reject-call", (data) => {
    io.to(data.to).emit("callRejected", {
      name: data.name,
      profilepic: data.profilepic,
    });
  });

  // End call
  socket.on("call-ended", (data) => {
    io.to(data.to).emit("callEnded", { name: data.name });
    // cleanup active calls if exist
    activeCalls.delete(data.from);
    activeCalls.delete(data.to);
    console.log("📴 Call ended and cleared:", data.from, data.to);
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    const user = onlineUsers.find((u) => u.socketId === socket.id);
    if (user) {
      activeCalls.delete(user.userId);
      // remove any activeCalls that reference this user
      for (const [key, value] of activeCalls.entries()) {
        if (value.with === user.userId) activeCalls.delete(key);
      }
      console.log("❌ User disconnected (removed):", user.userId, socket.id);
    }
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("online-users", onlineUsers);
    console.log(`❌ Disconnected: ${socket.id}`);
  });
}
