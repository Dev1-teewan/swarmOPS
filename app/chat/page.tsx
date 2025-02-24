"use client";

import { useChat } from "@ai-sdk/react";
// import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import React, { useState, useEffect, useRef } from "react";

// import { generateId } from "ai";
import InputArea from "./_components/input-area";
import PlainHeader from "@/app/_components/header";
// import { MessageCircle, Rocket } from "lucide-react";
import NotLoggedInAlert from "./_components/no-login";
import { EmptyState } from "./_components/empty-state";

// import Swap from "./ChatComponents/Swap";
// import { ToolInvocationUIPart } from "@ai-sdk/ui-utils";
// import { useChatStore } from "@/app/store/useChatStore";

export const SwarmBase = () => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { getAccessToken } = usePrivy();
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    const fetchAccessToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token ? "Bearer " + token : "");
    };

    fetchAccessToken();
  }, [getAccessToken]);

  // const {
  //   sessions,
  //   currentSessionId,
  //   addSession,
  //   setCurrentSession,
  //   deleteSession,
  //   getSessionById,
  //   addMessageToSession,
  //   setInitialMessage,
  // } = useChatStore();

  const {
    messages,
    input,
    setInput,
    // append,
    status,
    handleSubmit,
    // setMessages,
    // addToolResult,
  } = useChat({
    maxSteps: 20,
    api: "/api/agent/sendMessage",
    headers: {
      authorization: accessToken || "",
    },
    body: {
      swarmId: "a0137492-291d-4e14-9844-168979c0bfbc",
    },
    // onError: (error) => {
    //   toast({
    //     title: "Error",
    //     description:
    //       error.message || "An error occurred while sending the message",
    //     variant: "destructive",
    //   });
    // },
    // onFinish -> save messages to DB
    onFinish: async (messages) => {
      console.log("Messages:", messages);
    },
  });

  //   const renderMessageContent = (msg: any) => {
  //     const toolInvocation: ToolInvocationUIPart = msg.parts?.find(
  //       (part: any) => part.type === "tool-invocation"
  //     );

  //     if (toolInvocation) {
  //       const { toolName, toolCallId, state } =
  //         toolInvocation.toolInvocation || {};
  //       if (state === "call") {
  //         if (toolName === "create_swarm") {
  //           return (
  //             <CreateSwarm
  //               addToolResult={addToolResult}
  //               toolCallId={toolCallId}
  //             />
  //           );
  //         }
  //         if (toolName === "swap") {
  //           return (
  //             <Swap
  //               initialInputToken={null}
  //               initialOutputToken={null}
  //               inputLabel="Input Token"
  //               outputLabel="Output Token"
  //               initialInputAmount="0"
  //               swapText="Swap"
  //               swappingText="Swapping..."
  //               onSuccess={(txHash) => console.log("Swap successful:", txHash)}
  //               onError={(error) => console.log("Swap error:", error)}
  //               onCancel={() => console.log("Swap cancelled")}
  //             />
  //           );
  //         }
  //       }

  //       if (state === "result") {
  //         return (
  //           toolInvocation.toolInvocation.result.message ?? "result went wrong"
  //         ); // need to fix this typing
  //       }

  //       return "Unknown tool invocation";
  //     }

  //     return msg.content || "No content available";
  //   };

  return (
    <div className="flex h-screen">
      <NotLoggedInAlert />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PlainHeader />
        <main className="flex-1 overflow-y-auto pt-20 pb-24 bg-zinc-900">
          {/* Content */}
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.length === 0 ? (
              <EmptyState
                inputMessage={input}
                setInputMessage={setInput}
                handleSendMessage={() => {
                  if (status === "ready") {
                    handleSubmit();
                  }
                }}
              />
            ) : (
              <div className="flex-1 overflow-y-auto pt-5 pb-24">
                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                >
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-[#ddf813] text-zinc-900"
                              : ""
                          }`}
                        >
                          {/* {renderMessageContent(msg)} */}
                        </div>
                      </div>
                    ))}
                    {status === "submitted" && (
                      <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-700">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1 h-1 bg-white rounded-full custom-bounce"
                                style={{
                                  animationDelay: `${i * 150}ms`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                </div>

                {/* Input Area */}
                <div className="fixed bottom-0 left-0 w-full shadow-md">
                  <InputArea
                    inputMessage={input}
                    setInputMessage={setInput}
                    handleSendMessage={() => {
                      if (status === "ready") {
                        handleSubmit();
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <style jsx>{`
        @keyframes custom-bounce {
          0%,
          100% {
            transform: translateY(2px);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-6px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .custom-bounce {
          animation: custom-bounce 600ms infinite;
        }
      `}</style>
    </div>
  );
};

export default SwarmBase;
