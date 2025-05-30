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
