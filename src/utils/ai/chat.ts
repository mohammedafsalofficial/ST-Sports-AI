import { Content, GoogleGenAI } from "@google/genai";
import { createClient } from "../supabase/server";
import { ChatMessage } from "@/types/chat";
import { getSystemPrompt, parseAIResponse } from "./helper";
import { sanitizeSQL } from "../sql/helper";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
const GEMINI_MODEL = "gemma-3n-e4b-it";
const EMBEDDING_MODEL = "embedding-001";

const GENERAL_SYSTEM_PROMPT = getSystemPrompt("systemPrompt.txt");
const NEW_CHAT_CREATION_SYSTEM_PROMPT = getSystemPrompt("newChatSystemPrompt.txt");

async function getClosestSchemaText(userPrompt: string) {
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
}

function formatSchemaContext(data: any[]) {
  let schemaContext = "=== RELEVANT DATABASE SCHEMAS ===\n\n";

  data.forEach((schema: any, index: number) => {
    schemaContext += `${index + 1}. Table: ${schema.table_name}\n`;
    if (schema.description) schemaContext += `   Description: ${schema.description}\n`;
    schemaContext += `   Schema: ${schema.schema_text}\n`;
    schemaContext += `   Similarity: ${(schema.similarity * 100).toFixed(1)}%\n\n`;
  });

  schemaContext += "=== END SCHEMAS ===\n";
  return schemaContext;
}

export const generateChatResponse = async (prompt: string, chatSessionId?: string) => {
  if (!chatSessionId) {
    const newChatIndicator = `User's prompt: ${prompt}`;

    const aiResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: "user", parts: [{ text: NEW_CHAT_CREATION_SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: newChatIndicator }] },
      ],
    });

    return aiResponse.text || "";
  }

  const supabase = await createClient();

  const { data } = await supabase.from("chat_sessions").select("messages").eq("id", chatSessionId).single();
  const conversationHistory: ChatMessage[] = data?.messages || [];
  const lastMessages = conversationHistory.slice(-20);

  const formattedHistory: Content[] = lastMessages.map((message) => ({
    role: message.role === "user" ? "user" : "model",
    parts: [{ text: message.content }],
  }));

  const schemaText = await getClosestSchemaText(prompt);

  const contents: Content[] = [
    { role: "user", parts: [{ text: GENERAL_SYSTEM_PROMPT }] },
    {
      role: "model",
      parts: [
        {
          text: "I understand. I'm now a sports arena booking assistant for ST Sports, ready to help with badminton and pickleball court bookings.",
        },
      ],
    },
    ...(schemaText
      ? [
          {
            role: "user",
            parts: [{ text: `Here are the relevant database schemas:\n\n${schemaText}` }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Thank you for providing the database schema context. I'll use this information to help with accurate booking queries.",
              },
            ],
          },
        ]
      : []),
    ...formattedHistory,
    { role: "user", parts: [{ text: prompt }] },
  ];

  const aiResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: contents,
  });

  const parsedResponse = parseAIResponse(aiResponse.text || "");
  if (!parsedResponse) return "Couldn't parse AI response.";

  if (parsedResponse.classification === "RESPONSE") {
    return parsedResponse.content;
  }

  console.log("SQL Query Response:", parsedResponse);

  const { data: sqlResult, error: sqlError } = await supabase.rpc("run_any_sql", {
    sql_query: sanitizeSQL(parsedResponse.content),
  });

  if (sqlError) {
    console.error("SQL Execution Error:", sqlError);
    return "There was an error executing the SQL query.";
  }

  console.log("SQL Result:", sqlResult);

  const followUp = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      { role: "user", parts: [{ text: GENERAL_SYSTEM_PROMPT }] },
      ...(schemaText
        ? [
            {
              role: "user",
              parts: [{ text: `Here are the relevant database schemas:\n\n${schemaText}` }],
            },
            {
              role: "model",
              parts: [
                {
                  text: "Thank you for providing the database schema context. I'll use this information to help with accurate booking queries.",
                },
              ],
            },
          ]
        : []),
      {
        role: "user",
        parts: [{ text: `SQL Query: ${parsedResponse.content}\n\nResult:\n${JSON.stringify(sqlResult, null, 2)}` }],
      },
      {
        role: "user",
        parts: [
          {
            text: "Generate a helpful booking assistant response from this result. Use the standard JSON format with classification 'RESPONSE'.",
          },
        ],
      },
    ],
  });

  const finalResponse = parseAIResponse(followUp.text || "");
  if (!finalResponse) return "Couldn't parse AI response.";

  if (finalResponse.classification === "RESPONSE") {
    return finalResponse.content;
  }

  return "Ask in a more clarified way";
};
