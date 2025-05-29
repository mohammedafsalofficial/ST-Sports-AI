"use client";

import { createNewChat } from "@/actions/chat";
import { createClient } from "@/utils/supabase/client";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export default function NewChat() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createNewChat, {
    success: false,
    error: null,
  });

  useEffect(() => {
    if (state.success && state.data) {
      router.push(`/chat/${state.data[0].id}`);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex-1 flex flex-col items-center justify-center space-y-8">
      <h1 className="text-2xl">What can I help you with?</h1>
      <div className="relative w-[50%]">
        <input
          className="border border-gray-300 w-full p-3 pr-12 rounded-3xl outline-none text-gray-700"
          type="text"
          name="new-prompt"
          placeholder="Ask anything"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-primary text-secondary rounded-full p-2 hover:bg-brand-primary/85 disabled:opacity-60 transition-colors duration-150"
        >
          {pending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp size={16} />
          )}
        </button>
      </div>
    </form>
  );
}
