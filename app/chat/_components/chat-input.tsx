"use client";

import React, { useEffect, useState } from "react";
import { useChat } from "ai/react";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { generateId } from "@ai-sdk/provider-utils";
import { useChatStore } from "@/app/_store/useChatStore";

interface ChatInputProps {
  onNewSession?: () => number;
  inputMessage?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onNewSession,
  inputMessage,
}) => {
  const params = useParams();
  const sessionId = Number(params?.sessionId);

  const [mounted, setMounted] = useState(false);
  const {
    setCurrentSession,
    getLatestCurrentSession,
    setResponseLoading,
    setAddToolResult,
  } = useChatStore();
  const { authToken, selectedSwarm, addMessageToSession } = useChatStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { input, setInput, handleSubmit, addToolResult } = useChat({
    maxSteps: 20,
    api: "/api/agent/sendMessage",
    headers: {
      authorization: authToken,
    },
    body: {
      swarmId: selectedSwarm,
    },
    onFinish: async (message) => {
      // Add message to the session
      addMessageToSession(getLatestCurrentSession() as number, message);
      setResponseLoading(false);
    },
  });
  const addToolResultRef = React.useRef(addToolResult);

  useEffect(() => {
    addToolResultRef.current = addToolResult;
    setAddToolResult(addToolResultRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputMessage) {
      setInput(inputMessage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  if (!mounted) {
    return null;
  }

  const onHandleSubmit = async () => {
    if (!sessionId) {
      if (onNewSession) {
        onNewSession();
      }

      setResponseLoading(true);

      // Create user message
      const userMessage = {
        id: generateId(),
        role: "user" as const,
        content: input,
        createdAt: new Date(),
      };

      // Add user message to the session
      addMessageToSession(getLatestCurrentSession() as number, userMessage);

      handleSubmit();
    } else {
      setCurrentSession(sessionId);

      // Create user message
      const userMessage = {
        id: generateId(),
        role: "user" as const,
        content: input,
        createdAt: new Date(),
      };

      // Add user message to the session
      addMessageToSession(getLatestCurrentSession() as number, userMessage);

      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onHandleSubmit();
          }
        }}
        placeholder="Type your message..."
        className="flex-grow p-3 rounded-lg bg-zinc-700 text-white outline-none focus:ring-1 focus:ring-zinc-700 border border-transparent focus:border-zinc-700 transition-all"
      />

      <button
        onClick={() => onHandleSubmit()}
        className="bg-emerald-800 text-[#ddf813] p-3 rounded-lg hover:bg-emerald-900 transition-colors flex items-center justify-center"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
