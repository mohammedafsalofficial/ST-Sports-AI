import NewChat from "./NewChat";

export default function Chat() {
  return (
    <section className="w-[80%] ml-[20%] h-screen text-primary bg-primary p-5">
      <div className="bg-background h-full rounded-3xl flex flex-col">
        <header className="p-3">
          <h1 className="font-semibold text-xl">Smart Court Assistant</h1>
        </header>
        <hr className="text-gray-300" />
        <NewChat />
      </div>
    </section>
  );
}
