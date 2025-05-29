import Sidebar from "@/components/layout/Sidebar";

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex items-center justify-center h-screen">
      <Sidebar />
      <section className="w-[80%] ml-[20%] h-screen text-primary bg-primary p-5">
        <div className="bg-background h-full rounded-3xl flex flex-col">
          <header className="p-3">
            <h1 className="font-semibold text-xl">Smart Court Assistant</h1>
          </header>
          <hr className="text-gray-300" />
          {children}
        </div>
      </section>
    </main>
  );
}
