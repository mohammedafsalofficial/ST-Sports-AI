import Sidebar from "@/components/layout/Sidebar";

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex items-center justify-center h-screen">
      <Sidebar />
      <section className="w-[80%] ml-[20%] h-screen text-primary bg-primary p-5">
        <div className="bg-secondary h-full rounded-3xl flex flex-col overflow-hidden">
          <header className="p-3 shrink-0">
            <h1 className="font-semibold text-xl">Smart Court Assistant</h1>
          </header>
          <hr className="text-gray-300" />
          <div className="flex-1 overflow-y-auto p-4 space-y-2">{children}</div>
        </div>
      </section>
    </main>
  );
}
