import { ChatConversation } from "../models/chat_conversation.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import FormData from "form-data";

// Helper to get GoogleGenerativeAI client dynamically
function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
}

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

// Intelligent local rule-based fallback if external API is temporarily unavailable
function generateLocalFallback(text = "", attachmentUrl = null, mlResult = null) {
    const lower = text.toLowerCase();
    let botAction = "FALLBACK";
    let botText = "";

    if (attachmentUrl || mlResult) {
        const defect = mlResult?.defect_type || "Road defect";
        botAction = "AWAITING_LOCATION";
        botText = `📸 Photo received! Our vision model identified a potential ${defect}. Please share the exact landmark or street location in Prayagraj so we can dispatch the road maintenance crew.`;
    } else if (lower.includes("status") || lower.includes("track") || lower.includes("complaint") || /rep-\d+/i.test(lower)) {
        botAction = "STATUS_CHECK";
        botText = "🔍 To check your complaint status, please provide your Ticket ID (e.g. REP-PRG-10452) or check the 'My Complaints' section in your citizen dashboard.";
    } else if (lower.includes("pothole") || lower.includes("road") || lower.includes("light") || lower.includes("garbage") || lower.includes("drain") || lower.includes("broken")) {
        botAction = "PROMPT_FOR_PHOTO";
        botText = "⚠️ Thanks for bringing this to our attention. Could you please provide the road location and attach a photo if available so our team can verify and fix it quickly?";
    } else if (lower.includes("emergency") || lower.includes("accident") || lower.includes("ambulance") || lower.includes("hospital")) {
        botAction = "EMERGENCY";
        botText = "🚑 If this is a life-threatening emergency, please dial 112 (Police) or 108 (Ambulance) immediately. Nearest trauma center: SRN Hospital, Prayagraj.";
    } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("namaste") || lower.includes("hey")) {
        botAction = "GREETING";
        botText = "Namaste! I am the Prahari AI Assistant for Prayagraj Smart Roads. How can I help you today? You can report potholes, check complaint status, or ask about road safety.";
    } else {
        botAction = "FALLBACK";
        botText = "Namaste! I am here to help you report road defects, track complaints, or check safety conditions. How can I assist you?";
    }

    return { botText, botAction };
}

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
        let mlResult = null;
        if (attachment_url) {
            mlResult = await callMLModel(attachment_url);
            if (mlResult) {
                mlContext = `[SYSTEM CONTEXT: The user uploaded an image. Our ML model detected a ${mlResult.defect_type || 'unknown defect'} with a severity of ${mlResult.severity || 'unknown'} (confidence: ${mlResult.confidence_score ? Math.round(mlResult.confidence_score * 100) : 'unknown'}%). Please inform the user and ask for location confirmation.]\n\n`;
            } else {
                mlContext = `[SYSTEM CONTEXT: The user uploaded an image, but the ML model failed to analyze it. Acknowledge the photo but mention analysis failed.]\n\n`;
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
                    const fallback = generateLocalFallback(text, attachment_url, mlResult);
                    botText = fallback.botText;
                    botAction = fallback.botAction;
                }
            } catch (llmError) {
                console.error("Gemini Generation Error:", llmError);
                const fallback = generateLocalFallback(text, attachment_url, mlResult);
                botText = fallback.botText;
                botAction = fallback.botAction;
            }
        } else {
            console.warn("GEMINI_API_KEY is not configured in environment.");
            const fallback = generateLocalFallback(text, attachment_url, mlResult);
            botText = fallback.botText;
            botAction = fallback.botAction;
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
