import { ChatConversation } from "../models/chat_conversation.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// ---------------------------------------------------------------------------
// Small rule-based reply engine for the MVP/demo — no external LLM key required.
// Swap the body of generateBotReply() for a real model call later (Anthropic/OpenAI);
// keep the same (conversation, incomingMessage) => { text, action } signature so
// nothing else in this file needs to change.
// ---------------------------------------------------------------------------
function generateBotReply(conversation, incomingMessage) {
    const { text = "", attachment_url } = incomingMessage;
    const lower = text.toLowerCase();

    if (attachment_url) {
        // TODO(integration): call POST /api/internal/detect-defect with attachment_url here
        // (Person 1's CV service), then use the returned defect_type/severity/confidence_score
        // to actually create a Complaint and set conversation.linked_complaint_id.
        return {
            text:
                "Photo mila! Main isse analyze kar raha hoon — defect detect hote hi location confirm karke " +
                "complaint file kar dunga. (AI vision hookup pending from the Complaints module)",
            action: "AWAITING_DEFECT_DETECTION"
        };
    }

    if (/status|kaha|track/.test(lower)) {
        return {
            text: conversation.linked_complaint_id
                ? `Aapki complaint #${conversation.linked_complaint_id} abhi track ho rahi hai. Status update ke liye 'My Complaints' page check karein.`
                : "Abhi tak koi complaint is chat se link nahi hai. Ek photo bhejein defect ki, main file kar dunga.",
            action: "STATUS_CHECK"
        };
    }

    if (/pothole|gaddha|street ?light|garbage|drainage/.test(lower)) {
        return {
            text: "Samajh gaya. Ek photo aur location bhejiye, main defect verify karke seedha sahi department ko route kar dunga.",
            action: "PROMPT_FOR_PHOTO"
        };
    }

    if (/^(hi|hello|hey|namaste)\b/.test(lower)) {
        return {
            text:
                "Namaste! Main Prahari Assistant hoon — pothole, streetlight ya garbage ki photo bhejein, main complaint " +
                "file kar dunga. Ya apni complaint ka status pooch sakte hain.",
            action: "GREETING"
        };
    }

    return {
        text: "Maaf kijiye, main abhi sirf road defects report karne aur complaint status batane mein madad kar sakta hoon. Ek photo bhejein ya 'status' likhein.",
        action: "FALLBACK"
    };
}

// @desc    Send a message (text or photo) to the citizen chatbot
// @route   POST /api/chatbot/citizen/message
// @body    { user_id, text?, attachment_url?, channel? }
export const sendChatbotMessage = async (req, res) => {
    try {
        const { user_id, text, attachment_url, channel = "CITIZEN" } = req.body;

        if (!user_id) {
            throw new ApiError(400, "user_id is required (until Person 1's auth middleware populates req.user)");
        }
        if (!text && !attachment_url) {
            throw new ApiError(400, "Message must contain text or an attachment_url");
        }

        // Continue the citizen's most recent conversation rather than always creating a new one.
        let conversation = await ChatConversation.findOne({ user_id, channel }).sort({ updatedAt: -1 });
        if (!conversation) {
            conversation = await ChatConversation.create({ user_id, channel, messages: [] });
        }

        conversation.messages.push({
            sender: "USER",
            text,
            attachment_url: attachment_url || null,
            created_at: new Date()
        });

        const reply = generateBotReply(conversation, { text, attachment_url });
        const botMessage = { sender: "BOT", text: reply.text, created_at: new Date() };
        conversation.messages.push(botMessage);

        await conversation.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { conversation_id: conversation._id, reply: botMessage, action: reply.action },
                "Message processed"
            )
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error processing chatbot message", [], error.stack)
        );
    }
};

// @desc    Fetch full chat history for a citizen (also serves 'what's my complaint status?' follow-ups)
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
