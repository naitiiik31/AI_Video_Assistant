import { Router } from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from "../controllers/chatController.js";

const router = Router();

// All routes require authentication
router.use(protectRoute);

// Chat endpoints
router.post("/:id/chat", sendMessage);
router.get("/:id/chat", getChatHistory);
router.delete("/:id/chat", clearChatHistory);

export default router;
