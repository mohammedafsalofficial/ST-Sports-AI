import { SquarePen } from "lucide-react";
import AppIcon from "../ui/AppIcon";
import { groupChatsByTime } from "@/utils/helper";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ChatSessionType } from "@/types/chat";
import SidebarAction from "./SidebarAction";
import SignOut from "../features/auth/SignOut";
import { getAuthenticatedUser } from "@/utils/auth/helper";

export default async function Sidebar() {
  const { id: userId } = await getAuthenticatedUser();
  const supabase = await createClient();
  const { data: recentChats, error: chatError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId);

  if (chatError) {
    console.error(`Error fetching chat sessions: ${chatError.message}`);
  }

  const groupedChats = groupChatsByTime((recentChats as ChatSessionType[]) || []);

  return (
    <aside className="h-screen w-[20%] text-secondary fixed left-0 p-5 flex flex-col items-start justify-between">
      <div className="w-full">
        <h1 className="text-brand-primary text-2xl font-semibold flex items-center justify-start space-x-3">
          <AppIcon />
          <span>ST Sports</span>
        </h1>

        <div className="my-5 w-full">
          <Link
            href={"/chat"}
            className="w-full hover:bg-gray-500/30 rounded-md py-2 flex items-center space-x-2 px-4 text-sm duration-150 transition-colors ease-in-out group cursor-pointer"
          >
            <SquarePen
              className="group-hover:text-brand-primary duration-150 transition-colors ease-in-out"
              size={17}
            />
            <span>New Chat</span>
          </Link>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedChats).map(
            ([group, chats]) =>
              chats.length > 0 && (
                <div key={group}>
                  <p className="text-xs text-gray-400 px-4 mb-1">{group}</p>
                  <div className="space-y-1">
                    {chats.map((chat) => (
                      <SidebarAction key={chat.id} chat={chat} />
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      <SignOut />
    </aside>
  );
}
