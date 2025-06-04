"use server";

import { CreateChatResponse, CreateNewChatResponse, NewChatLLMResponse } from "@/types/chat";
import { generateChatResponse, generateNewChatResponse } from "@/utils/ai/chat";
import { cleanJsonAIResponse } from "@/utils/ai/helper";
import { createChatSession, uploadPrompt } from "@/utils/supabase/chatSession";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createNewChat = async (
  previousState: CreateNewChatResponse,
  formData: FormData
): Promise<CreateNewChatResponse> => {
  const userPrompt = formData.get("new-prompt") as string;

  if (!userPrompt.trim()) {
    return { success: false, error: "Prompt is required and cannot be empty" };
  }

  const response = await generateNewChatResponse(userPrompt);

  try {
    const cleanedText = cleanJsonAIResponse(response);
    const { title, response: aiResponse } = JSON.parse(cleanedText) as NewChatLLMResponse;

    const data = await createChatSession(title, userPrompt, aiResponse);

    revalidatePath("/chat");

    return { success: true, error: null, data };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }

    return { success: false, error: "Error creating a new chat session" };
  }
};

export const generateLLMResponse = async (
  previousState: CreateChatResponse,
  formData: FormData
): Promise<CreateChatResponse> => {
  const chatSessionId = previousState.chatSessionId as string;
  const userPrompt = formData.get("new-prompt") as string;

  if (!userPrompt.trim()) {
    return { chatSessionId, success: false, error: "Prompt is required and cannot be empty" };
  }

  const response = await generateChatResponse(userPrompt, chatSessionId);

  try {
    await uploadPrompt(chatSessionId, userPrompt, response);

    revalidatePath(`/chat/${chatSessionId}`);

    return { chatSessionId, success: true, error: null };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }

    return { chatSessionId, success: false, error: "Error generating llm response" };
  }
};

export const deleteChat = async (chatSessionId: string, currentPath: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase.from("chat_sessions").delete().eq("id", chatSessionId);
  if (error) {
    console.error("Failed to delete chat session:", error.message);
    return;
  }

  revalidatePath("/chat");

  const currentChatId = currentPath.split("/").pop();
  if (currentChatId === chatSessionId) {
    redirect("/chat");
  }
};
