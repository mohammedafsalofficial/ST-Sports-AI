import { ChatSessionType } from "./chat";

export type CreateNewChatResponse = {
  success: boolean;
  error: string | null;
  data?: ChatSessionType;
};

export type NewChatAIResponse = {
  title: string;
  response: string;
};
