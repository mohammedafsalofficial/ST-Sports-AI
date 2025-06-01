import Chat from "@/components/features/chat/Chat";
import { ChatSessionType } from "@/types/chat";
import { createClient } from "@/utils/supabase/server";
import Markdown from "react-markdown";

interface ChatPageProps {
  params: Promise<{ chatSessionId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatSessionId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("chat_sessions").select().eq("id", chatSessionId).single();

  const currentChatSession = data as unknown as ChatSessionType;

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {currentChatSession.messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} px-4`}>
            <div
              className={`px-4 py-3 rounded-lg bg-background text-primary break-words ${
                message.role === "user" ? "rounded-br-none max-w-[60%] ml-auto" : "rounded-bl-none max-w-[85%] mx-auto"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <Markdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 pl-4">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 pl-4">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">{children}</pre>
                    ),
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-secondary border-t border-gray-200 p-4">
        <Chat chatSessionId={chatSessionId} />
      </div>
    </div>
  );
}
