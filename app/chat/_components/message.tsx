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
        style={{ whiteSpace: "pre-wrap" }}
      >
        {msg.parts?.map((part, index) => {
          if (part.type === "text") {
            return <div key={index}>{part.text}</div>;
          } else if (part.type === "tool-invocation") {
            const invocation = part.toolInvocation;
            return invocation.state !== "result" ? (
              <ToolUI
                key={invocation.toolCallId}
                toolCallId={invocation.toolCallId}
                tool={invocation.toolName}
              />
            ) : (
              <div key={invocation.toolCallId}>
                {invocation.result.message}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
