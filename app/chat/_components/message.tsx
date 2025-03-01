import type { Message } from "ai";
import { ToolUI } from "./tool-ui";
import { PORTFOLIO_NAME } from "@/ai-swarm/action-names";

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
        {msg.parts?.map((part, index) => {
          if (part.type === "text") {
            return <div key={index}>{part.text}</div>;
          } 
          
          if (part.type === "tool-invocation") {
            const invocation = part.toolInvocation;
            // special case for portfolio view and fund view - always show
            if (invocation.toolName === PORTFOLIO_NAME) {
              return <ToolUI
                key={invocation.toolCallId}
                toolCallId={invocation.toolCallId}
                tool={invocation.toolName}
              />
            }
            return invocation.state !== "result" ? (
              <ToolUI
                key={invocation.toolCallId}
                toolCallId={invocation.toolCallId}
                tool={invocation.toolName}
              />
            ) : (
              <div
                key={invocation.toolCallId}
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: invocation.result.message }}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
