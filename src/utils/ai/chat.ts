import { Content, GoogleGenAI } from "@google/genai";
import { createClient } from "../supabase/server";
import { ChatMessage } from "@/types/chat";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.0-flash";

export const generateChatResponse = async (prompt: string, chatSessionId?: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("chat_sessions").select("messages").eq("id", chatSessionId).single();

  const conversationHistory: ChatMessage[] = data?.messages || [];
  const lastMessages = conversationHistory.slice(-20);

  const formattedHistory: Content[] =
    lastMessages?.map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    })) || [];

  formattedHistory.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: formattedHistory,
  });

  return response.text as string;
};
