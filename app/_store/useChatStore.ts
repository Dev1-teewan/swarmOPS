import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message } from "ai/react";

interface ChatSession {
  id: number;
  title: string;
  timestamp: string;
  messages: Message[];
  model: { name: string; subTxt: string };
}

interface ChatStore {
  initialMessage: string;
  sessions: ChatSession[];
  currentSessionId: number | null;
  setInitialMessage: (message: string) => void;
  addSession: (model: { name: string; subTxt: string }) => ChatSession;
  setCurrentSession: (sessionId: number) => void;
  setCurrentSessionModalName: (
    currentSessionId: number,
    model: { name: string; subTxt: string }
  ) => void;
  addMessageToSession: (
    sessionId: number,
    message: { role: "user" | "assistant"; content: string }
  ) => void;
  deleteSession: (sessionId: number) => void;
  getSessionById: (sessionId: number) => ChatSession | undefined;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      initialMessage: "",
      sessions: [],
      currentSessionId: null,
      setInitialMessage: (message: string) => set({ initialMessage: message }),
      addSession: (model) => {
        const newSession = {
          id: Date.now(),
          title: "New Chat",
          timestamp: new Date().toLocaleString(),
          model: model,
          messages: [],
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
        return newSession;
      },
      setCurrentSession: (sessionId: number) =>
        set({ currentSessionId: sessionId }),
      addMessageToSession: (
        sessionId: number,
        message: { role: "user" | "assistant"; content: string }
      ) => {
        set((state) => {
          const updatedSessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              const newMessage: Message = {
                id: String(Date.now()),
                content: message.content,
                role: message.role,
              };

              return {
                ...session,
                title:
                  session.title === "New Chat" && message.role === "user"
                    ? message.content.slice(0, 30) + "..."
                    : session.title,
                messages: [...session.messages, newMessage],
              };
            }
            return session;
          });

          return { sessions: updatedSessions };
        });
      },
      deleteSession: (sessionId: number) =>
        set((state) => ({
          sessions: state.sessions.filter(
            (session) => session.id !== sessionId
          ),
          currentSessionId:
            state.currentSessionId === sessionId
              ? state.sessions[1]?.id || null // Select next session or null if none left
              : state.currentSessionId,
        })),
      getSessionById: (sessionId: number) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        return session;
      },
      setCurrentSessionModalName: (currentSessionId, model) => {
        set((state) => {
          const updatedSessions = state.sessions.map((session) => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                model: model,
              };
            }
            return session;
          });

          return { sessions: updatedSessions };
        });
      },
    }),
    {
      name: "chat-storage",
    }
  )
);
