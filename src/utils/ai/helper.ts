export const cleanJsonAIResponse = (text: string): string => {
  return text
    .replace(/```json\s*/g, "")
    .replace(/```\s*$/g, "")
    .trim();
};

export const parseAIResponse = (responseText: string): { classification: string; content: string } | null => {
  try {
    // Step 1: Extract from code block if exists
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : responseText.trim();

    // Step 2: Try to auto-fix if it looks like an object but is not wrapped properly
    if (!jsonString.startsWith("{") && jsonString.includes("{")) {
      jsonString = jsonString.slice(jsonString.indexOf("{"));
    }
    if (!jsonString.endsWith("}") && jsonString.includes("}")) {
      jsonString = jsonString.slice(0, jsonString.lastIndexOf("}") + 1);
    }

    const parsed = JSON.parse(jsonString);

    if (parsed.classification === "QUERY" && parsed.sql) {
      return { classification: "QUERY", content: parsed.sql };
    } else if (parsed.classification === "RESPONSE" && parsed.response) {
      return { classification: "RESPONSE", content: parsed.response };
    }

    console.warn("Parsed JSON doesn't match expected structure:", parsed);
    return null;
  } catch (error) {
    console.error("Failed to parse AI response JSON:", error, "\nRaw text was:", responseText);
    return null;
  }
};
