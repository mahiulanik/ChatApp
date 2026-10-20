import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from '@clerk/express'
import fs from "fs";
import path from "path";


const app = express();

const publicDir = path.join(process.cwd(), "public");

// Global Middlewares
app.use(helmet());
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
    "https://hrmsync.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(clerkMiddleware())


// WEB CACHE
app.set("etag", false);


app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// API Routes


// if the public directory exists, serve the static files
// this is for the production build
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// Error Middleware



export default app;