import Chat from "@/components/features/chat/Chat";
import Sidebar from "@/components/layout/Sidebar";

export default function ChatPage() {
  return (
    <main className="flex items-center justify-center h-screen">
      <Sidebar />
      <Chat />
    </main>
  );
}
