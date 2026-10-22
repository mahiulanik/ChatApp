import express from "express";
import { checkAuth } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/check", authMiddleware, checkAuth);

export default router;