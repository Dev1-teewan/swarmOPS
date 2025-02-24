"use client";

import React from "react";
import ChatInput from "./chat-input";

const inputSuggestions = ["Create a swarm", "Execute swap", "View portfolio"];

const InputArea = () => {
  const handleSuggestionClick = (suggestion: string) => {
    // setInputMessage(suggestion);
    console.log(suggestion);
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-emerald-500 rounded-t-xl bg-zinc-800 w-full max-w-3xl mx-auto">
      <ChatInput />
      <div className="mt-3 flex gap-2 flex-wrap">
        {inputSuggestions.map((suggestion) => (
          <span
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className="cursor-pointer text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-400 rounded-xl px-2 py-1"
          >
            + {suggestion}
          </span>
        ))}
      </div>
    </div>
  );
};

export default InputArea;
