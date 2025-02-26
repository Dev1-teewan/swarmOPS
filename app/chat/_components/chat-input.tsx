"use client";

import React from "react";
import { Send } from "lucide-react";

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
        placeholder="Type your message..."
        className="flex-grow p-3 rounded-lg bg-zinc-700 text-white outline-none focus:ring-1 focus:ring-zinc-700 border border-transparent focus:border-zinc-700 transition-all"
      />

      <button
        onClick={() => handleSendMessage()}
        className="bg-emerald-800 text-[#ddf813] p-3 rounded-lg hover:bg-emerald-900 transition-colors flex items-center justify-center"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
