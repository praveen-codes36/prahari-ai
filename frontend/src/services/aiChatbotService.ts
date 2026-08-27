import apiClient from './apiClient';
import { authService } from './authService';

export interface ChatbotMessage {
  sender: 'USER' | 'BOT';
  text: string;
  attachment_url?: string | null;
  created_at: string;
}

export interface ChatbotReplyResponse {
  conversation_id: string;
  reply: ChatbotMessage;
  action: string;
}

export const sendCitizenChatMessage = async (text: string, attachmentUrl?: string): Promise<ChatbotReplyResponse> => {
  const session = authService.getSession();
  const userId = session?.user?.id || 'USR-CITZ-04'; // fallback for demo if not strictly enforced

  const payload: any = {
    user_id: userId,
    channel: 'CITIZEN'
  };

  if (text) payload.text = text;
  if (attachmentUrl) payload.attachment_url = attachmentUrl;

  const res = await apiClient.post('/chatbot/citizen/message', payload);
  return res.data.data; // { conversation_id, reply, action }
};

export const getCitizenChatHistory = async (): Promise<any[]> => {
  const session = authService.getSession();
  const userId = session?.user?.id || 'USR-CITZ-04';

  try {
    const res = await apiClient.get(`/chatbot/citizen/history/${userId}`);
    return res.data.data || [];
  } catch (error) {
    console.error("Failed to fetch chat history", error);
    return [];
  }
};
