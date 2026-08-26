import { Router } from "express";
import { sendChatbotMessage, getChatbotHistory } from "../controllers/chatbot.controller.js";

const router = Router();

// Route: /api/chatbot/citizen/message
router.route("/message").post(sendChatbotMessage);

// Route: /api/chatbot/citizen/history/:userId
router.route("/history/:userId").get(getChatbotHistory);

export default router;
