"use client";

import { createNewChat } from "@/actions/chat";
import { ArrowUp } from "lucide-react";
import { useActionState } from "react";

export default function NewChat() {
  const [state, formAction, pending] = useActionState(createNewChat, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction} className="flex-1 flex flex-col items-center justify-center space-y-8">
      <h1 className="text-2xl">What can I help you with?</h1>
      <div className="relative w-[50%]">
        <input
          className="border border-gray-300 w-full p-3 pr-12 rounded-3xl outline-none text-gray-600"
          type="text"
          name="new-prompt"
          placeholder="Ask anything"
          autoComplete="off"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-primary text-secondary rounded-full p-2 hover:bg-brand-primary/85 duration-150 transition-colors">
          <ArrowUp size={16} />
        </button>
      </div>
    </form>
  );
}
