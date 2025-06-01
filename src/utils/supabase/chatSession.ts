import { ChatSessionType } from "@/types/chat";
import { createClient } from "./server";

export const createChatSession = async (title: string, userPrompt: string, aiResponse: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error creating session");
    return;
  }

  const initialMessages = [
    {
      id: crypto.randomUUID(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    },
  ];

  const result = await supabase
    .from("chat_sessions")
    .upsert({ user_id: user?.id, title, messages: initialMessages })
    .select()
    .single();

  if (result.error) throw new Error(`Database error: ${result.error.message}`);
  if (!result.data) throw new Error("No data returned by database");

  return result.data as ChatSessionType;
};

export const uploadPrompt = async (chatSessionId: string, userPrompt: string, aiResponse: string) => {
  const supabase = await createClient();

  const newMessages = [
    {
      id: crypto.randomUUID(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    },
  ];

  const { data: existingSession, error: fetchError } = await supabase
    .from("chat_sessions")
    .select("messages")
    .eq("id", chatSessionId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch chat session: ${fetchError.message}`);
  }

  const existingMessages = existingSession.messages || [];
  const updatedMessages = [...existingMessages, ...newMessages];

  const { data: updatedSession, error: updateError } = await supabase
    .from("chat_sessions")
    .update({ messages: updatedMessages })
    .eq("id", chatSessionId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update chat session: ${updateError.message}`);
  }
};
