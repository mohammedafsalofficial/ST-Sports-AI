"use server";

import { ChatSessionType } from "@/types/newChat";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
};

export const createChatSession = async (userId: string, title: string, userPrompt: string, aiResponse: string) => {
  const supabase = await createClient();

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
    .upsert({ user_id: userId, title, messages: initialMessages })
    .select()
    .single();

  if (result.error) {
    throw new Error(`Database error: ${result.error.message}`);
  }

  if (!result.data) {
    throw new Error("No data returned by database");
  }

  return result.data as ChatSessionType;
};
