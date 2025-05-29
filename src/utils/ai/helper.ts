export const cleanJsonAIResponse = (text: string): string => {
  return text
    .replace(/```json\s*/g, "")
    .replace(/```\s*$/g, "")
    .trim();
};
