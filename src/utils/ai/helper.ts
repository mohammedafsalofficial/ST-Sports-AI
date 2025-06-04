import { readFileSync } from "fs";
import { join } from "path";

export const cleanJsonAIResponse = (text: string): string => {
  return text
    .replace(/```json\s*/g, "")
    .replace(/```\s*$/g, "")
    .trim();
};

export const parseAIResponse = (responseText: string): { classification: string; content: string } | null => {
  try {
    // Step 1: Try to extract JSON from a ```json code block
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : responseText.trim();

    // Step 2: Attempt to isolate object if extra text exists before or after
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1);
    }

    // Step 3: Sanitize smart quotes or non-standard characters
    jsonString = jsonString
      .replace(/[“”]/g, '"') // smart double quotes
      .replace(/[‘’]/g, "'") // smart single quotes
      .replace(/,\s*}/g, "}") // trailing commas
      .replace(/,\s*]/g, "]");

    // Step 4: Parse and validate structure
    const parsed = JSON.parse(jsonString);

    if (parsed.classification === "QUERY" && typeof parsed.sql === "string") {
      return { classification: "QUERY", content: parsed.sql };
    }
    if (parsed.classification === "RESPONSE" && typeof parsed.response === "string") {
      return { classification: "RESPONSE", content: parsed.response };
    }

    console.warn("Unexpected structure:", parsed);
    return null;
  } catch (error) {
    console.error("Failed to parse AI response:", error, "\nRaw text was:\n", responseText);
    return null;
  }
};

export const getSystemPrompt = (fileName: string) => {
  try {
    const systemPromptPath = join(process.cwd(), fileName);
    return readFileSync(systemPromptPath, "utf8");
  } catch (error) {
    console.error("Error loading system prompt:", error);
    return "You are a helpful sports arena booking assistant for badminton and pickleball courts.";
  }
};

export const formatSchemaContext = (data: any[]) => {
  let schemaContext = "=== RELEVANT DATABASE SCHEMAS ===\n\n";

  data.forEach((schema: any, index: number) => {
    schemaContext += `${index + 1}. Table: ${schema.table_name}\n`;
    if (schema.description) schemaContext += `   Description: ${schema.description}\n`;
    schemaContext += `   Schema: ${schema.schema_text}\n`;
    schemaContext += `   Similarity: ${(schema.similarity * 100).toFixed(1)}%\n\n`;
  });

  schemaContext += "=== END SCHEMAS ===\n";
  return schemaContext;
};
