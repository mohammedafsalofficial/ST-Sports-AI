import OpenAI from "openai";
import { createClient } from "../supabase/server";
import { ChatMessage } from "@/types/chat";
import { formatSchemaContext, getSystemPrompt, parseAIResponseRobust } from "./helper";
import { executeSQL, sanitizeSQL } from "../sql/helper";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
});

const CHAT_MODEL = "gpt-4o";
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 768;

const GENERAL_SYSTEM_PROMPT = getSystemPrompt("systemPrompt.general.txt");
const RESPONSE_SYSTEM_PROMPT = getSystemPrompt("systemPrompt.response.txt");
const NEW_CHAT_CREATION_SYSTEM_PROMPT = getSystemPrompt("systemPrompt.newChat.txt");

const getClosestSchemaText = async (userPrompt: string) => {
  try {
    console.log("Generating embedding for prompt:", userPrompt);

    const embeddingRes = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: userPrompt,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const promptEmbedding = embeddingRes.data[0]?.embedding;
    if (!promptEmbedding) {
      console.error("Failed to generate embedding.");
      return null;
    }

    console.log("Embedding generated successfully, length:", promptEmbedding.length);

    const supabase = await createClient();

    // First, let's check if the RPC function exists and what tables we have
    console.log("Calling RPC function with parameters:");
    console.log("- match_threshold: 0.0");
    console.log("- match_count: 3");
    console.log("- embedding dimensions:", promptEmbedding.length);

    const { data, error } = await supabase.rpc("match_schema_embeddings", {
      query_embedding: promptEmbedding,
      match_threshold: 0.0,
      match_count: 3,
    });

    console.log("RPC Response - Data:", data);
    console.log("RPC Response - Error:", error);

    if (error) {
      console.error("Error fetching schema embeddings:", error);

      // Try alternative approaches if RPC fails
      console.log("Attempting fallback query...");
      return await fallbackSchemaQuery(supabase, promptEmbedding);
    }

    if (!data || data.length === 0) {
      console.log("No matching schemas found with current threshold");

      // Try with a higher threshold or different approach
      console.log("Trying with higher threshold...");
      const { data: fallbackData } = await supabase.rpc("match_schema_embeddings", {
        query_embedding: promptEmbedding,
        match_threshold: 0.0, // Higher threshold
        match_count: 5,
      });

      if (!fallbackData || fallbackData.length === 0) {
        console.log("Still no matches, trying direct table query...");
        return await fallbackSchemaQuery(supabase, promptEmbedding);
      }

      return formatSchemaContext(fallbackData);
    }

    return formatSchemaContext(data);
  } catch (error) {
    console.error("Error in getClosestSchemaText:", error);

    // Try a completely different approach
    console.log("Attempting manual schema retrieval...");
    return await getSchemaManually();
  }
};

// Fallback function to query schemas directly without RPC
const fallbackSchemaQuery = async (supabase: any, embedding: number[]) => {
  try {
    // Assuming you have a table like 'schema_embeddings' or similar
    const { data, error } = await supabase
      .from("schema_embeddings") // Adjust table name as needed
      .select("*")
      .limit(5);

    if (error) {
      console.error("Fallback query error:", error);
      return null;
    }

    console.log("Fallback data retrieved:", data?.length, "records");
    return data ? formatSchemaContext(data) : null;
  } catch (error) {
    console.error("Fallback query failed:", error);
    return null;
  }
};

const getSchemaManually = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name, table_schema")
      .eq("table_schema", "public");

    if (data && data.length > 0) {
      const schemaInfo = data.map((table) => `Table: ${table.table_name}`).join("\n");
      console.log("Manual schema retrieval successful");
      return schemaInfo;
    }

    return "No schema information available";
  } catch (error) {
    console.error("Manual schema retrieval failed:", error);
    return "Schema information unavailable";
  }
};

export const generateNewChatResponse = async (prompt: string): Promise<string> => {
  const newChatIndicator = `User's prompt: ${prompt}`;

  const aiResponse = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `${NEW_CHAT_CREATION_SYSTEM_PROMPT}\n\n${GENERAL_SYSTEM_PROMPT}`,
      },
      {
        role: "user",
        content: newChatIndicator,
      },
    ],
  });

  return aiResponse.choices[0]?.message?.content || "";
};
export const generateChatResponse = async (userPrompt: string, chatSessionId: string) => {
  const supabase = await createClient();

  const { data } = await supabase.from("chat_sessions").select("messages").eq("id", chatSessionId).single();

  const conversationHistory: ChatMessage[] = data?.messages?.slice(-20) || [];

  const formattedHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = conversationHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));

  const schemaText = await getClosestSchemaText(userPrompt);
  console.log("Retrieved schema text:", schemaText);

  const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "system",
    content: `${GENERAL_SYSTEM_PROMPT}\n\nSchema: ${schemaText || "No specific schema available"}`,
  };

  const aiResponse = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      systemMessage,
      ...formattedHistory,
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const responseText = aiResponse.choices[0]?.message?.content || "";
  console.log("First AI Response:", responseText);

  const parsedResponse = parseAIResponseRobust(responseText);
  if (!parsedResponse) {
    return "I couldn't understand the response format. Please try rephrasing your request.";
  }

  if (parsedResponse.classification === "RESPONSE") {
    return parsedResponse.content;
  }

  if (parsedResponse.classification === "QUERY") {
    try {
      const sqlResult = await executeSQL(parsedResponse.content);

      console.log("SQL Query:", parsedResponse.content);
      console.log("SQL Result:", sqlResult);

      const followUp = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: `${RESPONSE_SYSTEM_PROMPT}
            CRITICAL: You must respond in this exact JSON format:
            {
              "classification": "RESPONSE",
              "response": "Your message to the user here"
            }
            Do not return plain text. Always use the JSON format above.`,
          },
          ...formattedHistory,
          {
            role: "user",
            content: `Based on this SQL result: ${JSON.stringify(sqlResult)}
            Generate a user-friendly response for the original request: "${userPrompt}"
            Remember to format your response as JSON with classification "RESPONSE".`,
          },
        ],
      });

      const followUpText = followUp.choices[0]?.message?.content || "";
      console.log("Second AI Response:", followUpText);

      const finalResponse = parseAIResponseRobust(followUpText);
      if (finalResponse && finalResponse.classification === "RESPONSE") {
        return finalResponse.content;
      }

      return "I found some results but couldn't format the response properly. Please try again.";
    } catch (sqlError) {
      console.error("SQL Execution Error:", sqlError);

      try {
        const errorResponse = await openai.chat.completions.create({
          model: CHAT_MODEL,
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant for ST Sports court booking system.
              
The user's request resulted in a database error. Respond helpfully in this exact JSON format:
{
  "classification": "RESPONSE", 
  "response": "Your helpful error message here"
}

Be polite and suggest they try rephrasing their request or contact support if needed.`,
            },
            {
              role: "user",
              content: `The user asked: "${userPrompt}"
              
The generated SQL query failed with an error. Please provide a helpful response to the user explaining that their request couldn't be processed and suggest they try rephrasing it.`,
            },
          ],
        });

        const errorResponseText = errorResponse.choices[0]?.message?.content || "";
        const parsedErrorResponse = parseAIResponseRobust(errorResponseText);

        if (parsedErrorResponse && parsedErrorResponse.classification === "RESPONSE") {
          return parsedErrorResponse.content;
        }

        return "I'm sorry, I couldn't process your request. Please try rephrasing it or contact support for assistance.";
      } catch (errorHandlingError) {
        console.error("Error handling error:", errorHandlingError);
        return "I'm sorry, I couldn't process your request. Please try rephrasing it or contact support for assistance.";
      }
    }
  }

  return "I'm not sure how to handle that request. Please try rephrasing it.";
};
