import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import fs from "node:fs";
import path from "node:path";

import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";

const app = express();
const publicDir = path.join(process.cwd(), "public");

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL?.trim()
].filter(Boolean);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(hpp());

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Clerk webhook requires the raw request body
app.use(
    "/api/webhooks/clerk",
    express.raw({ type: "application/json" }),
    clerkWebhook
);

// Global middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(clerkMiddleware());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime()
    });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

// Serve frontend in production
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    app.get("/{*any}", (req, res, next) => {
        res.sendFile(path.join(publicDir, "index.html"), (err) => {
            if (err) next(err);
        });
    });
}

export default app;
