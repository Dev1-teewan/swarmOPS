"use client";

import { Message } from "ai";
import InputArea from "./input-area";
import LoadingMessage from "./loading-message";
import { useChatStore } from "@/app/_store/useChatStore";
import { Message as MessageUI } from "./message";

interface ChatSessionProps {
  sessionId: number;
  initialMessages: Array<Message>;
}

export function ChatSession({ initialMessages }: ChatSessionProps) {
  const { isResponseLoading } = useChatStore();

  return (
    <div className="flex-1 overflow-y-auto pt-5 pb-24">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div>
          {initialMessages.map((msg, index) => (
            <MessageUI key={index} msg={msg} />
          ))}
          {isResponseLoading && <LoadingMessage />}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full shadow-md">
        <InputArea />
      </div>
    </div>
  );
}
