import { Server } from "socket.io";

// Dev (localhost:5173) AND the deployed frontend (FRONTEND_URL) must both be
// able to open a socket — otherwise realtime events silently never arrive.
const allowedOrigins = [
  "http://localhost:5173",
  (process.env.FRONTEND_URL || "").trim(),
].filter(Boolean);

// online users map = { userId: socketId }
const userSocketMap = {};

let io = null;

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

/**
 * Attach Socket.IO to the HTTP server that also serves the Express app.
 * Called once from server.js: `initSocket(server)`.
 */
function initSocket(server) {
  io = new Server(server, { cors: { origin: allowedOrigins } });

  // io.emit() sends event to everyone - broadcast
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Typing presence — relayed ONLY to the person being typed at.
    socket.on("typing", (payload) => {
      const to = payload?.to && String(payload.to);
      const targetSocketId = to && userSocketMap[to];
      if (userId && targetSocketId) {
        io.to(targetSocketId).emit("typing", { from: userId });
      }
    });

    socket.on("stopTyping", (payload) => {
      const to = payload?.to && String(payload.to);
      const targetSocketId = to && userSocketMap[to];
      if (userId && targetSocketId) {
        io.to(targetSocketId).emit("stopTyping", { from: userId });
      }
    });

    // socket.on is used to listen for events
    socket.on("disconnect", () => {
      if (userId) delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
}

/** Access the initialized instance (safe to call inside request handlers). */
function getIO() {
  if (!io) throw new Error("Socket.io is not initialized yet — call initSocket(server) first");
  return io;
}

export { initSocket, getIO, getReceiverSocketId };
