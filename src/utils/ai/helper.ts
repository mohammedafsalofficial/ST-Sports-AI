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
    // Clean up the response text
    const cleanText = responseText.trim();

    // Check if it's already a plain text error message or response
    if (!cleanText.includes("{") && !cleanText.includes("}")) {
      // If it looks like an error message, classify it as RESPONSE
      if (
        cleanText.toLowerCase().includes("error") ||
        cleanText.toLowerCase().includes("failed") ||
        cleanText.toLowerCase().includes("could not") ||
        cleanText.toLowerCase().includes("unable to")
      ) {
        console.warn("AI returned error message instead of JSON:", cleanText);
        return { classification: "RESPONSE", content: cleanText };
      }

      // If it's a regular text response, treat it as RESPONSE
      console.warn("AI returned plain text instead of JSON:", cleanText);
      return { classification: "RESPONSE", content: cleanText };
    }

    // Step 1: Try to extract JSON from a ```json code block
    const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : cleanText;

    // Step 2: Attempt to isolate object if extra text exists before or after
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      // No valid JSON structure found, treat as plain response
      console.warn("No JSON structure found, treating as plain response:", cleanText);
      return { classification: "RESPONSE", content: cleanText };
    }

    jsonString = jsonString.slice(firstBrace, lastBrace + 1);

    // Step 3: Sanitize smart quotes or non-standard characters
    jsonString = jsonString
      .replace(/[""]/g, '"') // smart double quotes
      .replace(/['']/g, "'") // smart single quotes
      .replace(/,\s*}/g, "}") // trailing commas
      .replace(/,\s*]/g, "]"); // trailing commas in arrays

    // Step 4: Parse and validate structure
    const parsed = JSON.parse(jsonString);

    // Validate expected structure for QUERY
    if (parsed.classification === "QUERY") {
      if (typeof parsed.sql === "string") {
        return { classification: "QUERY", content: parsed.sql };
      } else if (typeof parsed.content === "string") {
        return { classification: "QUERY", content: parsed.content };
      }
    }

    // Validate expected structure for RESPONSE
    if (parsed.classification === "RESPONSE") {
      if (typeof parsed.response === "string") {
        return { classification: "RESPONSE", content: parsed.response };
      } else if (typeof parsed.content === "string") {
        return { classification: "RESPONSE", content: parsed.content };
      }
    }

    // Handle other possible structures
    if (typeof parsed.classification === "string" && typeof parsed.content === "string") {
      return { classification: parsed.classification, content: parsed.content };
    }

    console.warn("Unexpected JSON structure:", parsed);

    // Try to extract any meaningful content
    if (typeof parsed === "object" && parsed !== null) {
      const possibleContent = parsed.response || parsed.content || parsed.message || parsed.text;
      if (typeof possibleContent === "string") {
        return { classification: "RESPONSE", content: possibleContent };
      }
    }

    // Fallback to treating the original text as response
    return { classification: "RESPONSE", content: cleanText };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.log("Raw text was:", responseText);

    // Instead of returning null, return the original text as a RESPONSE
    // This prevents the function from breaking the flow
    return { classification: "RESPONSE", content: responseText.trim() };
  }
};

// Alternative: More robust parser that handles multiple formats
export const parseAIResponseRobust = (responseText: string): { classification: string; content: string } => {
  const cleanText = responseText.trim();

  // Try different parsing strategies
  const strategies = [
    // Strategy 1: JSON code block
    () => {
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match) return JSON.parse(match[1].trim());
      return null;
    },

    // Strategy 2: Direct JSON parsing
    () => {
      const firstBrace = cleanText.indexOf("{");
      const lastBrace = cleanText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1));
      }
      return null;
    },

    // Strategy 3: Look for classification patterns in text
    () => {
      if (
        cleanText.toLowerCase().includes("select ") ||
        cleanText.toLowerCase().includes("insert ") ||
        cleanText.toLowerCase().includes("update ") ||
        cleanText.toLowerCase().includes("delete ")
      ) {
        return { classification: "QUERY", content: cleanText };
      }
      return null;
    },
  ];

  // Try each strategy
  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result && result.classification && result.content) {
        return { classification: result.classification, content: result.content };
      }
      if (result && result.classification && (result.sql || result.response)) {
        return {
          classification: result.classification,
          content: result.sql || result.response,
        };
      }
    } catch (e) {
      // Continue to next strategy
      continue;
    }
  }

  // Final fallback: treat everything as a response
  return { classification: "RESPONSE", content: cleanText };
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
