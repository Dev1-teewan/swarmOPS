"use client";

import EmptyState from "./empty-state";

export function Chat() {
  const messages = [];
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pt-20 pb-24 bg-zinc-900">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1 overflow-y-auto pt-5 pb-24">
              {/* Messages Area 
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
                        {renderMessageContent(msg)} 
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

              {/* Input Area 
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
              </div>*/}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Chat;
