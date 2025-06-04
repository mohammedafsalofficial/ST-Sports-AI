import { Content, GoogleGenAI } from "@google/genai";
import { createClient } from "../supabase/server";
import { ChatMessage } from "@/types/chat";
import { formatSchemaContext, getSystemPrompt, parseAIResponse } from "./helper";
import { executeSQL, sanitizeSQL } from "../sql/helper";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
const GEMINI_MODEL = "gemma-3n-e4b-it";
const EMBEDDING_MODEL = "embedding-001";

const GENERAL_SYSTEM_PROMPT = getSystemPrompt("systemPrompt.general.txt");
const NEW_CHAT_CREATION_SYSTEM_PROMPT = getSystemPrompt("systemPrompt.newChat.txt");

const getClosestSchemaText = async (userPrompt: string) => {
  try {
    const embeddingRes = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: { parts: [{ text: userPrompt }], role: "user" },
    });

    const promptEmbedding = embeddingRes.embeddings?.[0].values;
    if (!promptEmbedding) {
      console.error("Failed to generate embedding.");
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("match_schema_embeddings", {
      query_embedding: promptEmbedding,
      match_threshold: 0.0,
      match_count: 3,
    });

    console.log("RPC Response - Data:", data);
    console.log("RPC Response - Error:", error);

    if (error) {
      console.error("Error fetching schema embeddings:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No matching schemas found");
      return null;
    }

    return formatSchemaContext(data);
  } catch (error) {
    console.error("Error in getClosestSchemaText:", error);
    return null;
  }
};

export const generateNewChatResponse = async (prompt: string): Promise<string> => {
  const newChatIndicator = `User's prompt: ${prompt}`;

  const aiResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
              New chat creation system prompt: ${NEW_CHAT_CREATION_SYSTEM_PROMPT}\n
              General system prompt: ${GENERAL_SYSTEM_PROMPT}\n
              user prompt: ${newChatIndicator}
            `,
          },
        ],
      },
    ],
  });

  return aiResponse.text as string;
};

export const generateChatResponse = async (userPrompt: string, chatSessionId: string) => {
  const supabase = await createClient();

  const { data } = await supabase.from("chat_sessions").select("messages").eq("id", chatSessionId).single();

  const conversationHistory: ChatMessage[] = data?.messages?.slice(-20) || [];

  const formattedHistory: Content[] = conversationHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const schemaText = await getClosestSchemaText(userPrompt);

  const prompt = `
    System prompt : ${GENERAL_SYSTEM_PROMPT},\n
    Context : ${JSON.stringify(formattedHistory, null, 2)},\n 
    Schema : ${schemaText},\n 
    Prompt : ${userPrompt}
  `;

  const aiResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  const parsedResponse = parseAIResponse(aiResponse.text || "");
  if (!parsedResponse) return "Couldn't parse AI response.";

  if (parsedResponse.classification === "RESPONSE") {
    return parsedResponse.content;
  }

  try {
    const sqlResult = await executeSQL(parsedResponse.content);

    console.log("SQL Query:", parsedResponse.content);
    console.log("SQL Result:", sqlResult);

    const followUp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `System prompt : ${GENERAL_SYSTEM_PROMPT},\n Context : ${formattedHistory.toString()},\n SQL Result : ${sqlResult}.  Generate a response using the prompt: ${userPrompt} to show it to the user`,
            },
          ],
        },
      ],
    });

    const finalResponse = parseAIResponse(followUp.text || "");
    console.log(finalResponse);
    return finalResponse?.classification === "RESPONSE" ? finalResponse.content : "Ask in a more clarified way";
  } catch (err) {
    console.error("SQL Execution Error:", err);
    return "There was an error executing the SQL query.";
  }
};
