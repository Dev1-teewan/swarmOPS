"use client";

import { ChatSession } from "./chat-session";
import EmptyState from "./empty-state";
import { useParams } from "next/navigation";
import { useChatStore } from "@/app/_store/useChatStore";
import { useEffect, useState } from "react";

export function Chat() {
  const params = useParams();
  const [isClient, setIsClient] = useState(false);
  const [sessionId, setSessionId] = useState(Number(params?.sessionId));
  const { getSessionById, addSession } = useChatStore();
  const session = getSessionById(sessionId);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNewSession = () => {
    const createSession = addSession();
    setSessionId(createSession?.id as number);
    return sessionId;
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pt-20 pb-24 bg-zinc-900">
        <div className="max-w-3xl mx-auto space-y-8">
          {session ? (
            <ChatSession
              sessionId={session?.id}
              initialMessages={session?.messages}
            />
          ) : (
            <EmptyState onNewSession={handleNewSession} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Chat;
