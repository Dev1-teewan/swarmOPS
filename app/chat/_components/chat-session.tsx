"use client";

import { Message } from "ai";
import InputArea from "./input-area";

interface ChatSessionProps {
  sessionId: number;
  initialMessages: Array<Message>;
}

export function ChatSession({ initialMessages }: ChatSessionProps) {
  
  return (
    <div className="flex-1 overflow-y-auto pt-5 pb-24">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div>
          {initialMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user" ? "bg-[#ddf813] text-zinc-900" : ""
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full shadow-md">
        <InputArea />
      </div>
    </div>
  );
}
