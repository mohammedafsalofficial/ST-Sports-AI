import { ChatView } from "@/components/features/chat/ChatView";
import { ChatSessionType } from "@/types/chat";
import { createClient } from "@/utils/supabase/server";

interface ChatPageProps {
  params: Promise<{ chatSessionId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatSessionId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("chat_sessions").select().eq("id", chatSessionId).single();

  const currentChatSession = data as unknown as ChatSessionType;

  return <ChatView chatSession={currentChatSession} chatSessionId={chatSessionId} />;
}
