import express from "express";
import {
  deleteConversationForMe,
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  markConversationRead,
  sendMessage,
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.put("/read/:id", markConversationRead);
router.delete("/conversation/:id", deleteConversationForMe);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media"), sendMessage);

export default router;