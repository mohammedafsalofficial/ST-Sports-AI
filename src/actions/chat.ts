"use server";

import { CreateNewChatResponse, NewChatAIResponse } from "@/types/newChat";
import { generateChatResponse } from "@/utils/ai/chat";
import { cleanJsonAIResponse } from "@/utils/ai/helper";
import { createChatSession } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
    const { title, response: aiResponse } = JSON.parse(cleanedText) as NewChatAIResponse;

    const data = await createChatSession("b7717ab2-deee-4ae8-85f7-702e1047dae9", title, userPrompt, aiResponse);

    revalidatePath("/chat");

    return { success: true, error: null, data };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }

    return { success: false, error: "Error creating a new chat session" };
  }
};
