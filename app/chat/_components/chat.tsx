"use client";

import { ChatSession } from "./chat-session";
import EmptyState from "./empty-state";
import { useChatStore } from "@/app/_store/useChatStore";
import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { CREATE_SWARM_NAME, SWAP_NAME } from "@/ai-swarm/action-names";

export function Chat() {
  // const params = useParams();
  // const [isClient, setIsClient] = useState(false);
  // const [sessionId, setSessionId] = useState(Number(params?.sessionId));
  // const { getSessionById, addSession } = useChatStore();
  // const session = getSessionById(sessionId);
  const {
    authToken,
    selectedSwarm,
    setAddToolResult,
    setResponseLoading,
    setDisableMessage,
    setStatus,
  } = useChatStore();

  const {
    messages: AIMessages,
    input,
    setInput,
    handleSubmit,
    status,
    addToolResult,
  } = useChat({
    maxSteps: 20,
    api: "/api/agent/sendMessage",
    headers: {
      authorization: authToken,
    },
    body: {
      swarmId: selectedSwarm,
    },
    onFinish: () => {
      setResponseLoading(false);
    },
  });

  const handleNewSession = () => {
    return 0;
  };

  const addToolResultRef = useRef(addToolResult);

  useEffect(() => {
    addToolResultRef.current = addToolResult;
    setAddToolResult(addToolResultRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (AIMessages.length === 0) {
      setDisableMessage("");
      return;
    }
    const lastMessage = AIMessages[AIMessages.length - 1];
    const message = lastMessage.parts
      .filter((part) => part.type === "tool-invocation")
      .map((toolInvocation) => {
        if (toolInvocation.toolInvocation.state === "result") return "";
        const toolName = toolInvocation.toolInvocation.toolName;
        switch (toolName) {
          case CREATE_SWARM_NAME:
            return `Complete or cancel your swarm creation`;
          case SWAP_NAME:
            return `Complete or cancel your swap`;
          default:
            return "";
        }
      });
    setDisableMessage(message.join(" and ") || "");
  }, [AIMessages]);

  useEffect(() => {
    if (status) {
      setStatus(status);
    }
  }, [status]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pt-20 pb-24 bg-zinc-900">
        <div className="max-w-3xl mx-auto space-y-8">
          {AIMessages.length === 0 ? (
            <EmptyState
              onNewSession={handleNewSession}
              inputMessage={input}
              setInputMessage={setInput}
              handleSendMessage={() => {
                if (status === "ready") {
                  setResponseLoading(true);
                  handleSubmit();
                }
              }}
            />
          ) : (
            <ChatSession
              sessionId={0}
              initialMessages={AIMessages}
              inputMessage={input}
              setInputMessage={setInput}
              handleSendMessage={() => {
                if (status === "ready") {
                  setResponseLoading(true);
                  handleSubmit();
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default Chat;
