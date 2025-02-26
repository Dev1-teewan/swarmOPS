"use client";

import React from "react";
import { Send } from "lucide-react";
import { useChatStore } from "../../_store/useChatStore";

interface ChatInputProps {
  onNewSession?: () => number;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  // onNewSession
  inputMessage,
  setInputMessage,
  handleSendMessage,
}) => {
  const { disableMessage, status } = useChatStore();
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        disabled={disableMessage.length > 0 || status !== "ready"}
        placeholder="Type your message..."
        className="flex-grow p-3 rounded-lg bg-zinc-700 text-white outline-none focus:ring-1 focus:ring-zinc-700 border border-transparent focus:border-zinc-700 transition-all disabled:cursor-not-allowed disabled:opacity-50"
      />

      <button
        onClick={() => handleSendMessage()}
        disabled={disableMessage.length > 0 || status !== "ready"}
        className=" text-[#ddf813] p-3 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
