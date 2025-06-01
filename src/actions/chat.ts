"use server";

import { CreateChatResponse, CreateNewChatResponse, NewChatLLMResponse } from "@/types/chat";
import { generateChatResponse } from "@/utils/ai/chat";
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

  const systemPrompt = `You need to provide two things in JSON format:
        1. Generate a 3-4 word title for this prompt (for sidebar display)
        2. Provide a complete response to the prompt

        Return in this exact JSON format:
        {
          "title": "your generated title here",
          "response": "your complete response here"
        }

        The user's prompt is: ${userPrompt}`;
  const response = await generateChatResponse(systemPrompt);

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

  console.log(chatSessionId);

  if (!userPrompt.trim()) {
    return { chatSessionId, success: false, error: "Prompt is required and cannot be empty" };
  }

  const response = await generateChatResponse(userPrompt);

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

export const deleteChat = async (chatSessionId: string) => {
  const supabase = await createClient();
  const { error } = await supabase.from("chat_sessions").delete().eq("id", chatSessionId);

  if (error) {
    console.error(error.message);
  }

  redirect("/chat");
};
