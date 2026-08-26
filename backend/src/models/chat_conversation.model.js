import mongoose, { Schema } from "mongoose";

const CHANNEL_ENUM = ["CITIZEN", "AUTHORITY"];
const SENDER_ENUM = ["USER", "BOT"];

const chatMessageSchema = new Schema(
    {
        sender: {
            type: String,
            enum: SENDER_ENUM,
            required: true
        },
        text: {
            type: String,
            trim: true
        },
        attachment_url: {
            type: String,
            default: null
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const chatConversationSchema = new Schema(
    {
        user_id: {
            type: String,
            required: true
        },
        channel: {
            type: String,
            enum: CHANNEL_ENUM,
            default: "CITIZEN"
        },
        messages: {
            type: [chatMessageSchema],
            default: []
        },
        // Populated once the bot successfully files a complaint out of this conversation.
        // Integrates with Person 1's Complaint model once it exists.
        linked_complaint_id: {
            type: Schema.Types.ObjectId,
            ref: "Complaint",
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);
