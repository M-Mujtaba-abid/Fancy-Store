"use client";

import { useMutation } from "@tanstack/react-query";
import { chatService, ChatRequestPayload } from "@/service/chatService/chat.service";
import toast from "react-hot-toast";

export const useChat = () => {
  return useMutation({
    mutationFn: (payload: ChatRequestPayload) => chatService.sendMessage(payload),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Chatbot is unavailable right now.",
      );
    },
  });
};
