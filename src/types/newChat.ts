export type CreateNewChatResponse = {
  success: boolean;
  error: string | null;
  data?: ChatSessionType[];
};

export type ChatSessionType = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};
