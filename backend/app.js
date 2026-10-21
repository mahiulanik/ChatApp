import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from '@clerk/express'
import fs from "fs";
import path from "path";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";


const app = express();

const publicDir = path.join(process.cwd(), "public");

// Global Middlewares
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);
app.use(hpp());

// HTTPS enforcement in production
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

const allowedOrigins = [
    "http://localhost:5173",
    "https://hrmsync.vercel.app",
    (process.env.FRONTEND_URL || "").trim(),
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// it's important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(clerkMiddleware())


// WEB CACHE
app.set("etag", false);


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);


// if the public directory exists, serve the static files
// this is for the production build
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    app.get("/{*any}", (req, res, next) => {
        res.sendFile(
            path.join(publicDir, "index.html"),
            (err) => {
                if (err) next(err);
            }
        );
    });
}

// Error Middleware



export default app;