import type { Message } from "ai";
import { ToolUI } from "./tool-ui";

interface MessageProps {
  key: number;
  msg: Message;
}

export function Message({ msg }: MessageProps) {
  return (
    <div
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
        {msg.parts && msg.parts.length > 0 && (
          <div className="flex flex-col gap-2">
            {msg.parts
              .filter((part) => part.type === "tool-invocation")
              .map((part) => (
                <ToolUI
                  key={part.toolInvocation.toolCallId}
                  toolCallId={part.toolInvocation.toolCallId}
                  tool={part.toolInvocation.toolName}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
