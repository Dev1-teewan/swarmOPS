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
  // console.log(msg.content)

  const toolInvocations = msg.parts
    ?.filter((part) => part.type === "tool-invocation")
    .map((part) => part.toolInvocation);

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
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((invocation) =>
              invocation.state !== "result" ? (
                <ToolUI
                  key={invocation.toolCallId}
                  toolCallId={invocation.toolCallId}
                  tool={invocation.toolName}
                />
              ) : (
                <div key={invocation.toolCallId} className="my-4">
                  {invocation.result.message}
                </div>
              )
            )}
          </div>
        )}
        {after && <div className="mt-2">{after}</div>}
      </div>
    </div>
  );
}
