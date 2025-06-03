import Sidebar from "@/components/layout/Sidebar";
import { getAuthenticatedUser } from "@/utils/auth/helper";
import { User } from "lucide-react";

export default async function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user_metadata } = await getAuthenticatedUser();
  const fullName = user_metadata?.full_name;

  // Generate initials: e.g., "Mohammed Afsal" => "MA", "Afsal" => "A"
  const initials = fullName
    ? fullName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <main className="flex items-center justify-center h-screen">
      <Sidebar />
      <section className="w-[80%] ml-[20%] h-screen text-primary bg-primary p-5">
        <div className="bg-secondary h-full rounded-3xl flex flex-col overflow-hidden">
          <header className="p-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white p-2 rounded-full shadow-md">🏸</div>
              <div>
                <h1 className="font-semibold text-lg">Welcome to ST Sports</h1>
                <p className="text-sm text-muted-foreground">Book your court, effortlessly.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {initials || <User className="w-5 h-5 text-white" />}
              </div>
            </div>
          </header>

          <hr className="text-gray-300" />
          <div className="flex-1 overflow-y-auto p-4 space-y-2">{children}</div>
        </div>
      </section>
    </main>
  );
}
