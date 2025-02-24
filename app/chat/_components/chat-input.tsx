"use client";

import React from "react";
import { Send } from "lucide-react";
import { useChat } from "ai/react";

const ChatInput = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { input, setInput, handleSubmit } = useChat({
    maxSteps: 20,
    api: "/api/agent/sendMessage",
    headers: {
      authorization: "",
    },
    body: {
      swarmId: "a0137492-291d-4e14-9844-168979c0bfbc",
    },
    onFinish: async (messages) => {
      console.log("Messages:", messages);
    },
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Type your message..."
        className="flex-grow p-3 rounded-lg bg-zinc-700 text-white outline-none focus:ring-1 focus:ring-zinc-700 border border-transparent focus:border-zinc-700 transition-all"
      />

      <button
        onClick={() => handleSubmit()}
        className="bg-emerald-800 text-[#ddf813] p-3 rounded-lg hover:bg-emerald-900 transition-colors flex items-center justify-center"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
