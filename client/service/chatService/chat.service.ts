import api from "../api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestPayload {
  messages: ChatMessage[];
  sessionId?: string;
}

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
