import { LogOut, SquarePen } from "lucide-react";
import AppIcon from "../ui/AppIcon";
import { RecentChat } from "@/types/chat";
import { groupChatsByTime } from "@/utils/helper";

const recentChats: RecentChat[] = [
  { id: 1, title: "Sports Analytics Discussion", time: "2025-05-27T08:00:00Z" },
  { id: 2, title: "Team Performance Review", time: "2025-05-26T13:00:00Z" },
  { id: 3, title: "Player Statistics Query", time: "2025-05-25T10:30:00Z" },
  { id: 4, title: "Match Predictions", time: "2025-05-24T09:00:00Z" },
];

export default function Sidebar() {
  const groupedChats = groupChatsByTime(recentChats);

  return (
    <aside className="h-screen w-[20%] text-secondary fixed left-0 p-5 flex flex-col items-start justify-between">
      <div className="w-full">
        <h1 className="text-brand-primary text-2xl font-semibold flex items-center justify-start space-x-3">
          <AppIcon />
          <span>ST Sports</span>
        </h1>

        <div className="my-5 w-full">
          <button className="w-full hover:bg-gray-500/30 rounded-md py-2 flex items-center space-x-2 px-4 text-sm duration-150 transition-colors ease-in-out group cursor-pointer">
            <SquarePen
              className="group-hover:text-brand-primary duration-150 transition-colors ease-in-out"
              size={17}
            />
            <span>New Chat</span>
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedChats).map(
            ([group, chats]) =>
              chats.length > 0 && (
                <div key={group}>
                  <p className="text-xs text-gray-400 px-4 mb-1">{group}</p>
                  <div className="space-y-1">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        className="w-full hover:bg-gray-500/30 rounded-md py-2 flex items-center space-x-2 px-4 text-sm duration-150 transition-colors ease-in-out group cursor-pointer"
                      >
                        <span>{chat.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      <button className="flex text-sm items-center justify-start space-x-2 bg-gray-500/30 hover:bg-gray-500/20 w-full py-2 px-4 rounded-md cursor-pointer">
        <LogOut className="text-brand-primary" size={18} />
        <span>Log out</span>
      </button>
    </aside>
  );
}
