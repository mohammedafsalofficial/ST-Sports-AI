import { RecentChat } from "@/types/chat";

export const groupChatsByTime = (chats: RecentChat[]) => {
  const groups: Record<string, RecentChat[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  chats.forEach((chat) => {
    const chatDate = new Date(chat.time);

    if (chatDate >= todayStart) {
      groups.Today.push(chat);
    } else if (chatDate >= yesterdayStart) {
      groups.Yesterday.push(chat);
    } else {
      groups.Earlier.push(chat);
    }
  });

  return groups;
};
