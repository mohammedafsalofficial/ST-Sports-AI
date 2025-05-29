import { ChatSessionType } from "@/types/newChat";

export const groupChatsByTime = (chats: ChatSessionType[]) => {
  const groups: Record<string, ChatSessionType[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  chats.forEach((chat) => {
    const chatDate = new Date(chat.created_at);

    if (chatDate >= todayStart) {
      groups.Today.unshift(chat);
    } else if (chatDate >= yesterdayStart) {
      groups.Yesterday.unshift(chat);
    } else {
      groups.Earlier.unshift(chat);
    }
  });

  return groups;
};
