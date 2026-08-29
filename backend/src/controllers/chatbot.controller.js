import { ChatConversation } from "../models/chat_conversation.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import FormData from "form-data";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash_if_missing");

// Helper function to call the ML model with an image URL
async function callMLModel(attachmentUrl) {
    try {
        // Fetch the image as a stream
        const response = await axios.get(attachmentUrl, { responseType: "stream" });
        
        // Create form data
        const form = new FormData();
        form.append("file", response.data, "attachment.jpg"); // filename is required for backend to recognize it as a file

        // Call the local Python ML server
        const mlResponse = await axios.post("http://127.0.0.1:8000/predict", form, {
            headers: {
                ...form.getHeaders()
            },
            timeout: 10000 // 10s timeout
        });
        
        return mlResponse.data;
    } catch (error) {
        console.error("ML Model Error:", error.message);
        return null;
    }
}

// System prompt defining the persona and behavior
const SYSTEM_INSTRUCTION = `You are the Prahari Assistant, an AI chatbot for RoadGuard AI.
Your purpose is to help citizens report road infrastructure defects (potholes, broken streetlights, garbage, drainage issues) and track their complaints.

Follow these rules:
1. Always be polite and speak in a mix of Hindi and English (Hinglish), or plain English depending on the user.
2. If the user wants to report a defect but hasn't provided a photo or location, ask them to provide them.
3. If the user provides a photo, acknowledge it and analyze it based on the system context provided.
4. If a defect is confirmed, ask the user to confirm the location to file the complaint.
5. If the user asks for complaint status, inform them they can check the "My Complaints" page or provide the linked complaint ID if available.
6. Return a JSON string at the end of your response in this exact format:
   :::{"action": "<ACTION_NAME>"}:::
   Where <ACTION_NAME> can be one of: "PROMPT_FOR_PHOTO", "AWAITING_LOCATION", "FILE_COMPLAINT", "STATUS_CHECK", "GREETING", "FALLBACK".
   The rest of your response will be shown to the user. Do not leak internal system details.`;

// @desc    Send a message (text or photo) to the citizen chatbot
// @route   POST /api/chatbot/citizen/message
// @body    { user_id, text?, attachment_url?, channel? }
export const sendChatbotMessage = async (req, res) => {
    try {
        const { user_id, text, attachment_url, channel = "CITIZEN" } = req.body;

        if (!user_id) {
            throw new ApiError(400, "user_id is required");
        }
        if (!text && !attachment_url) {
            throw new ApiError(400, "Message must contain text or an attachment_url");
        }

        // Fetch or create conversation
        let conversation = await ChatConversation.findOne({ user_id, channel }).sort({ updatedAt: -1 });
        if (!conversation) {
            conversation = await ChatConversation.create({ user_id, channel, messages: [] });
        }

        // Add user message
        const userMessage = {
            sender: "USER",
            text: text || "",
            attachment_url: attachment_url || null,
            created_at: new Date()
        };
        conversation.messages.push(userMessage);

        // Prepare context for Gemini
        let mlContext = "";
        if (attachment_url) {
            const mlResult = await callMLModel(attachment_url);
            if (mlResult) {
                mlContext = `[SYSTEM CONTEXT: The user uploaded an image. Our ML model detected a ${mlResult.defect_type || 'unknown defect'} with a severity of ${mlResult.severity || 'unknown'} (confidence: ${mlResult.confidence_score ? Math.round(mlResult.confidence_score * 100) : 'unknown'}%). Please inform the user and ask for location confirmation.]\n\n`;
            } else {
                mlContext = `[SYSTEM CONTEXT: The user uploaded an image, but the ML model failed to analyze it. Acknowledge the photo but mention analysis failed.]\n\n`;
            }
        }

        // Reconstruct history for Gemini
        const history = [];
        for (const msg of conversation.messages) {
            if (msg.sender === "USER") {
                let userText = msg.text || "";
                if (msg === userMessage && mlContext) {
                    userText = mlContext + userText;
                }
                history.push({ role: "user", parts: [{ text: userText || "[User sent an image]" }] });
            } else if (msg.sender === "BOT") {
                history.push({ role: "model", parts: [{ text: msg.text || "" }] });
            }
        }

        // We use gemini-1.5-flash as the default model
        let botText = "";
        let botAction = "FALLBACK";

        try {
            if (!process.env.GEMINI_API_KEY) {
                console.warn("GEMINI_API_KEY is not set. Falling back to default message.");
                botText = "I'm sorry, my AI brain (Gemini API) is currently unconfigured. Please set GEMINI_API_KEY.";
            } else {
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    systemInstruction: SYSTEM_INSTRUCTION
                });

                // Get the last message to send, and remove it from history
                const lastMessage = history.pop();
                
                const chat = model.startChat({ history });
                const result = await chat.sendMessage(lastMessage.parts[0].text);
                const rawResponse = result.response.text();
                
                // Parse the custom action JSON at the end
                const actionMatch = rawResponse.match(/:::(\{.*?\}):::/);
                if (actionMatch) {
                    try {
                        const parsed = JSON.parse(actionMatch[1]);
                        botAction = parsed.action || "FALLBACK";
                        botText = rawResponse.replace(actionMatch[0], "").trim();
                    } catch (e) {
                        botText = rawResponse.trim();
                    }
                } else {
                    botText = rawResponse.trim();
                }
            }
        } catch (llmError) {
            console.error("Gemini Error:", llmError);
            throw new ApiError(502, "Error communicating with AI Assistant provider");
        }

        const botMessage = { sender: "BOT", text: botText, created_at: new Date() };
        conversation.messages.push(botMessage);

        await conversation.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { conversation_id: conversation._id, reply: botMessage, action: botAction },
                "Message processed"
            )
        );
    } catch (error) {
        console.error("Chatbot Controller Error:", error);
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error processing chatbot message", [], error.stack)
        );
    }
};

// @desc    Fetch full chat history for a citizen
// @route   GET /api/chatbot/citizen/history/:userId
export const getChatbotHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await ChatConversation.find({ user_id: userId, channel: "CITIZEN" }).sort({
            createdAt: 1
        });

        return res.status(200).json(new ApiResponse(200, conversations, "Chat history retrieved"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching chat history", [], error.stack)
        );
    }
};
