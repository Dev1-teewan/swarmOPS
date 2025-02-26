import type { Message } from "ai";
import { ToolUI } from "./tool-ui";

interface MessageProps {
  key: number;
  msg: Message;
}

export function Message({ msg }: MessageProps) {
  const splitContent = (content: string) => {
    const delimiter = "\n\n"; // Use \n\n as the delimiter
    const parts = content.split(delimiter);
    return {
      before: parts[0],
      after: parts.slice(1).join(delimiter),
    };
  };

  const { before, after } = splitContent(msg.content);

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
        <div>{before}</div>
        {msg.parts && msg.parts.length > 0 && (
          <div className="flex flex-col gap-4">
            {msg.parts
              .filter((part) => part.type === "tool-invocation")
              .map((part) =>
                part.toolInvocation.state !== "result" ? (
                  <ToolUI
                    key={part.toolInvocation.toolCallId}
                    toolCallId={part.toolInvocation.toolCallId}
                    tool={part.toolInvocation.toolName}
                  />
                ) : (
                  <div key={part.toolInvocation.toolCallId} className="my-4">
                    {part.toolInvocation.result.message}
                  </div>
                )
              )}
          </div>
        )}
        <div>{after}</div>
      </div>
    </div>
  );
}
