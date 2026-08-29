"use client";
import dynamic from "next/dynamic";

// LiveChat statically imports socket.io-client, which was landing in the
// main bundle and loading on every page even for visitors who never open
// chat. Same dynamic-import pattern as DynamicChatWidget.tsx.
const LiveChat = dynamic(() => import("@/components/LiveChat"), {
  ssr: false,
});

export default LiveChat;
