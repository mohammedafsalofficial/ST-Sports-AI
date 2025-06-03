"use client";

import { ChatSessionType } from "@/types/chat";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import Chat from "./Chat";

export function ChatView({ chatSession, chatSessionId }: { chatSession: ChatSessionType; chatSessionId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGoDown, setShowGoDown] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [chatSession.messages]);

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowGoDown(!isBottom);
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" ref={containerRef} onScroll={handleScroll}>
        {chatSession.messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} px-4`}>
            <div
              className={`px-4 py-3 rounded-lg bg-background text-primary break-words ${
                message.role === "user" ? "rounded-br-none max-w-[60%] ml-auto" : "rounded-bl-none max-w-[85%] mx-auto"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {showGoDown && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 z-50 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/80 transition"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>

      <div className="sticky bottom-0 bg-secondary border-t border-gray-200 p-4">
        <Chat chatSessionId={chatSessionId} />
      </div>
    </div>
  );
}
