"use server";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
});

type CreateNewChatResponse = {
  success: boolean;
  error: string | null;
};

export const createNewChat = async (
  previousState: CreateNewChatResponse,
  formData: FormData
): Promise<CreateNewChatResponse> => {
  const prompt = formData.get("new-prompt") as string;

  const response = await client.responses.create({
    model: "gpt-3.5-turbo",
    input: "Write a one-sentence bedtime story about a unicorn.",
  });

  console.log(response.output_text);

  return { success: true, error: null };
};
