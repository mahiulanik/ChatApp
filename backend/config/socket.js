import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import User from "../models/user.model.js";

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL?.trim()
].filter(Boolean);

const userSocketMap = new Map();
let io;

export const getReceiverSocketId = (userId) =>
    userSocketMap.get(String(userId))?.values().next().value;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: allowedOrigins }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (typeof token !== "string" || !token) {
                return next(new Error("Unauthorized"));
            }

            const { sub } = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
                authorizedParties: allowedOrigins
            });

            const user = await User.findOne({ clerkId: sub }).select("_id").lean();

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.data.userId = String(user._id);
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;

        if (!userSocketMap.has(userId)) {
            userSocketMap.set(userId, new Set());
        }

        userSocketMap.get(userId).add(socket.id);
        socket.join(`user:${userId}`);

        io.emit("getOnlineUsers", [...userSocketMap.keys()]);

        const relayTyping = (event, { to } = {}) => {
            if (typeof to !== "string" || !userSocketMap.has(to)) return;

            io.to(`user:${to}`).emit(event, { from: userId });
        };

        socket.on("typing", (payload) => relayTyping("typing", payload));
        socket.on("stopTyping", (payload) => relayTyping("stopTyping", payload));

        socket.on("disconnect", () => {
            const sockets = userSocketMap.get(userId);
            if (!sockets) return;

            sockets.delete(socket.id);

            if (sockets.size === 0) {
                userSocketMap.delete(userId);
            }

            io.emit("getOnlineUsers", [...userSocketMap.keys()]);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.IO is not initialized");
    return io;
};
