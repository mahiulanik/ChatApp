import { Server } from "socket.io";

const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:5173").trim();

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
  io = new Server(server, { cors: { origin: [allowedOrigin] } });

  // io.emit() sends event to everyone - broadcast
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

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
