export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestPayload {
  messages: ChatMessage[];
  sessionId?: string;
}
