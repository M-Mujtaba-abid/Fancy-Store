import api from "../api";
import { ChatRequestPayload } from "@/types/chat.types";

interface ChatApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    reply: string;
    model: string;
    sessionId: string;
  };
}

export const chatService = {
  sendMessage: async (payload: ChatRequestPayload) => {
    const res = await api.post<ChatApiResponse>("/chat", payload);
    return res.data.data;
  },
};
