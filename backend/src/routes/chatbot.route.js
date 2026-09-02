import { Router } from "express";
import multer from "multer";
import { sendChatbotMessage, getChatbotHistory } from "../controllers/chatbot.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // in-memory: files pushed to Cloudinary, nothing written to disk

// Route: /api/chatbot/citizen/message
router.route("/message").post(upload.single("photo"), sendChatbotMessage);

// Route: /api/chatbot/citizen/history/:userId
router.route("/history/:userId").get(getChatbotHistory);

export default router;
