import { ChatConversation } from "../models/chat_conversation.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import FormData from "form-data";
import { Complaint } from "../models/complaint.model.js";
import { detectDefectViaML } from "./complaints.controller.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

// Helper to get GoogleGenerativeAI client dynamically
function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
}

// Helper function to call the ML model with an in-memory buffer
async function callMLModel(fileBuffer) {
    try {
        const form = new FormData();
        form.append("file", fileBuffer, "attachment.jpg");

        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
            headers: {
                ...form.getHeaders()
            },
            timeout: 10000
        });
        
        return mlResponse.data;
    } catch (error) {
        console.error("ML Model Error:", error.message);
        throw new ApiError(500, "Image processing service (ML Model) is currently unavailable.");
    }
}

// System prompt defining the persona and behavior
const SYSTEM_INSTRUCTION = `You are the Prahari Assistant, an AI chatbot for RoadGuard AI (Prayagraj Smart City infrastructure).
Your purpose is to help citizens report road infrastructure defects (potholes, broken streetlights, garbage, drainage issues), check traffic safety, and track their complaints.

Follow these rules:
1. Always be polite and helpful. You can speak in English or natural Hinglish (Hindi + English) based on the user's tone.
2. If the user wants to report a defect but hasn't provided a photo or location, guide them to provide the location or attach a photo.
3. If the user provides a photo, acknowledge it and analyze it based on the system context provided.
4. If a defect is confirmed, ask the user to confirm the location to file the complaint.
5. If the user asks for complaint status, inform them they can check the "My Complaints" page or provide their ticket/complaint ID.
6. Return a JSON string at the end of your response in this exact format:
   :::{"action": "<ACTION_NAME>"}:::
   Where <ACTION_NAME> can be one of: "PROMPT_FOR_PHOTO", "AWAITING_LOCATION", "FILE_COMPLAINT", "STATUS_CHECK", "GREETING", "EMERGENCY", "FALLBACK".
   The rest of your response will be shown to the user. Do not leak internal backend stack traces.`;



// @desc    Send a message (text or photo) to the citizen chatbot
// @route   POST /api/chatbot/citizen/message
// @body    { user_id, text?, attachment_url?, channel? }
export const sendChatbotMessage = async (req, res) => {
    try {
        const { user_id, text, channel = "CITIZEN" } = req.body;
        let attachment_url = req.body.attachment_url || null;
        let fileBuffer = null;

        if (req.file) {
            fileBuffer = req.file.buffer;
            const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, "prahari-ai/chatbot");
            attachment_url = cloudinaryResult.secure_url;
        }

        if (!user_id) {
            throw new ApiError(400, "user_id is required");
        }
        if (!text && !attachment_url && !fileBuffer) {
            throw new ApiError(400, "Message must contain text or an attachment");
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
        let mlResult = null;
        if (fileBuffer) {
            mlResult = await callMLModel(fileBuffer);
            if (mlResult) {
                mlContext = `[SYSTEM CONTEXT: The user uploaded an image. Our ML model detected a ${mlResult.defect_type || 'unknown defect'} with a severity of ${mlResult.severity || 'unknown'} (confidence: ${mlResult.confidence_score ? Math.round(mlResult.confidence_score * 100) : 'unknown'}%). Please inform the user and ask for location confirmation.]\n\n`;
            }
        }

        let botText = "";
        let botAction = "FALLBACK";

        const genAI = getGenAI();

        if (genAI) {
            try {
                // Prepare sanitized history strictly following Gemini API alternating format
                const rawHistory = [];
                const allPastMessages = conversation.messages.slice(0, -1); // all except the current message

                for (const msg of allPastMessages) {
                    if (msg.sender === "USER") {
                        const content = (msg.text || "").trim() || "[User sent a photo]";
                        rawHistory.push({ role: "user", parts: [{ text: content }] });
                    } else if (msg.sender === "BOT") {
                        const content = (msg.text || "").trim();
                        if (content) {
                            rawHistory.push({ role: "model", parts: [{ text: content }] });
                        }
                    }
                }

                // Sanitize history so it starts with 'user' and alternates strictly
                const sanitizedHistory = [];
                for (let i = 0; i < rawHistory.length; i++) {
                    const current = rawHistory[i];
                    if (sanitizedHistory.length === 0) {
                        if (current.role === "user") {
                            sanitizedHistory.push(current);
                        }
                    } else {
                        const last = sanitizedHistory[sanitizedHistory.length - 1];
                        if (last.role !== current.role) {
                            sanitizedHistory.push(current);
                        } else {
                            // Merge consecutive parts of same role
                            last.parts[0].text += "\n" + current.parts[0].text;
                        }
                    }
                }

                // If sanitized history ends with user, trim it so incoming message alternates
                if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === "user") {
                    sanitizedHistory.pop();
                }

                // Models to attempt in order of preference
                const candidateModels = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.7-flash"];
                let responseSuccess = false;

                const outgoingText = (mlContext + (text || "[User shared an attachment]")).trim();

                for (const modelName of candidateModels) {
                    try {
                        const model = genAI.getGenerativeModel({
                            model: modelName,
                            systemInstruction: SYSTEM_INSTRUCTION
                        });

                        const chat = model.startChat({ history: sanitizedHistory });
                        const result = await chat.sendMessage(outgoingText);
                        const rawResponse = result.response.text();

                        // Parse the custom action JSON at the end
                        const actionMatch = rawResponse.match(/:::(\{.*?\}):::/);
                        if (actionMatch) {
                            try {
                                const parsed = JSON.parse(actionMatch[1]);
                                botAction = parsed.action || "FALLBACK";
                                botText = rawResponse.replace(actionMatch[0], "").trim();

                                if (botAction === "FILE_COMPLAINT") {
                                    try {
                                        const lastAttachmentMsg = conversation.messages.slice().reverse().find(m => m.attachment_url);
                                        let photo_url = lastAttachmentMsg ? lastAttachmentMsg.attachment_url : "";
                                        const hostUrl = `${req.protocol}://${req.get("host")}/`;
                                        if (photo_url.startsWith(hostUrl)) {
                                            photo_url = photo_url.replace(hostUrl, "");
                                        }

                                        const lastUserMsg = conversation.messages.slice().reverse().find(m => m.sender === "USER" && m.text);
                                        const address = lastUserMsg ? lastUserMsg.text : "Prayagraj";

                                        let defect_type = "POTHOLE";
                                        let severity = "HIGH";
                                        let confidence = 90;

                                        if (photo_url && fs.existsSync(photo_url)) {
                                            const mlRes = await detectDefectViaML(photo_url);
                                            if (mlRes && mlRes.available) {
                                                defect_type = mlRes.defect_type === "Pothole" ? "POTHOLE" 
                                                            : mlRes.defect_type === "Streetlight Defect" ? "BROKEN_STREETLIGHT" 
                                                            : mlRes.defect_type === "Garbage Accumulation" ? "GARBAGE" 
                                                            : mlRes.defect_type === "Drainage Issues" ? "DRAINAGE" : "OTHER";
                                                severity = mlRes.severity || "HIGH";
                                                confidence = Number(mlRes.confidence_score) || 90;
                                            }
                                        }

                                        await Complaint.create({
                                            citizen_id: user_id,
                                            photo_url: photo_url || "uploads/demo.jpg",
                                            defect_type,
                                            severity,
                                            confidence_score: confidence,
                                            ai_analysis_status: "AVAILABLE",
                                            location: { type: "Point", coordinates: [81.8463, 25.4358], address },
                                            status: "REPORTED"
                                        });
                                    } catch (fileErr) {
                                        console.error("Failed to automatically file complaint:", fileErr);
                                    }
                                }
                            } catch (e) {
                                botText = rawResponse.trim();
                            }
                        } else {
                            botText = rawResponse.trim();
                        }

                        responseSuccess = true;
                        break;
                    } catch (modelErr) {
                        console.warn(`Gemini model ${modelName} attempt failed:`, modelErr.message);
                    }
                }

                if (!responseSuccess) {
                    throw new ApiError(500, "AI Service is currently unavailable.");
                }
            } catch (llmError) {
                console.error("Gemini Generation Error:", llmError);
                throw new ApiError(500, "Failed to communicate with AI Service");
            }
        } else {
            console.warn("GEMINI_API_KEY is not configured in environment.");
            throw new ApiError(500, "AI Service is not configured (Missing GEMINI_API_KEY)");
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
