"use client";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () => import("@/components/shop/chat/ChatWidget"),
  { ssr: false }
);

export default ChatWidget;
