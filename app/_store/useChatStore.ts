import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UIMessage } from "@ai-sdk/ui-utils";

interface ChatSession {
  id: number;
  title: string;
  timestamp: string;
  messages: UIMessage[];
  model: { name: string; subTxt: string };
}

interface ChatStore {
  authToken: string;
  sessions: ChatSession[];
  selectedSwarm: string | null;
  currentSessionId: number | null;
  isResponseLoading: boolean;
  setAuthToken: (token: string) => void;
  addSession: (model?: { name: string; subTxt: string }) => ChatSession;
  setSelectedSwarm: (swarmId: string) => void;
  setCurrentSession: (sessionId: number) => void;
  setCurrentSessionModalName: (
    currentSessionId: number,
    model: { name: string; subTxt: string }
  ) => void;
  addMessageToSession: (sessionId: number, message: UIMessage) => void;
  deleteSession: (sessionId: number) => void;
  getLatestCurrentSession: () => number | null;
  getSessionById: (sessionId: number) => ChatSession | undefined;
  setResponseLoading: (isLoading: boolean) => void;
  addToolResult: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: unknown;
  }) => void;
  setAddToolResult: (
    addToolResult: (params: { toolCallId: string; result: unknown }) => void
  ) => void;
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
  getMessages: () => UIMessage[];
  disableMessage: string;
  setDisableMessage: (disableMessage: string) => void;
  status: string;
  setStatus: (status: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      authToken: "",
      sessions: [],
      selectedSwarm: "a0137492-291d-4e14-9844-168979c0bfbc",
      currentSessionId: 0,
      isResponseLoading: false,
      setAuthToken: (token: string) => set({ authToken: "Bearer " + token }),
      addSession: (
        model = {
          name: "Claude",
          subTxt: "Claude 3.5 Sonnet",
        }
      ) => {
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
      setSelectedSwarm: (swarmId: string) => set({ selectedSwarm: swarmId }),
      setCurrentSession: (sessionId: number) =>
        set({ currentSessionId: sessionId }),
      addMessageToSession: (sessionId: number, message: UIMessage) => {
        set((state) => {
          const updatedSessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                title:
                  session.title === "New Chat" && message.role === "user"
                    ? message.content.slice(0, 30) + "..."
                    : session.title,
                messages: [...session.messages, message],
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
      getLatestCurrentSession: () => {
        return get().currentSessionId;
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
      setResponseLoading: (isLoading) => set({ isResponseLoading: isLoading }),
      addToolResult: ({ toolCallId, result }) => {
        console.log("Tool result", toolCallId, result);
      },
      setAddToolResult: (addToolResult) => {
        if (get().addToolResult !== addToolResult) {
          set({ addToolResult });
        }
      },
      messages: [],
      setMessages: (messages: UIMessage[]) => set({ messages }),
      getMessages: () => get().messages,
      disableMessage: "",
      setDisableMessage: (disableMessage) => set({ disableMessage }),
      status: "",
      setStatus: (status) => set({ status }),
    }),
    {
      name: "chat-storage",
    }
  )
);
