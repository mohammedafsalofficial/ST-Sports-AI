"use server";

import { ChatSessionType, CreateNewChatResponse } from "@/types/newChat";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const createNewChat = async (
  previousState: CreateNewChatResponse,
  formData: FormData
): Promise<CreateNewChatResponse> => {
  const supabase = await createClient();
  const prompt = formData.get("new-prompt") as string;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Give me a single new title for this prompt. I am going to store this title in a DB. So return just the title: ${prompt}`,
  });

  const title = response.text;
  const result = await supabase
    .from("chat_sessions")
    .upsert({ user_id: "b7717ab2-deee-4ae8-85f7-702e1047dae9", title })
    .select();

  if (result.error) {
    console.error("Error inserting chat title:", result.error.message);
    return { success: false, error: "Error creating new chat" };
  }

  const data = result.data as ChatSessionType[] | null;

  if (!data) {
    return { success: false, error: "Something went wrong" };
  }

  return { success: true, error: null, data };
};
