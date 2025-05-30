export type CreateNewChatResponse = {
  success: boolean;
  error: string | null;
  data?: ChatSessionType;
};

export type NewChatLLMResponse = {
  title: string;
  response: string;
};

export type CreateChatResponse = {
  chatSessionId: string;
  success: boolean;
  error: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type ChatSessionType = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  messages: ChatMessage[];
};
