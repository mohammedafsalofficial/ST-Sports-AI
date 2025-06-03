"use client";

import { createNewChat } from "@/actions/chat";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

export default function NewChat() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createNewChat, {
    success: false,
    error: null,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.data) {
      router.push(`/chat/${state.data.id}`);
    }
  }, [state]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="h-full flex-1 flex flex-col items-center justify-center space-y-8"
    >
      <h1 className="text-2xl">What can I help you with?</h1>
      <div className="relative w-[50%]">
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={pending}
          rows={1}
          style={{ maxHeight: "200px" }}
          className="border border-gray-300 w-full p-3 pr-12 rounded-3xl outline-none text-gray-700 resize-none overflow-y-auto scrollbar-hide"
          name="new-prompt"
          placeholder="Ask anything"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute right-2 top-[45%] transform -translate-y-1/2 bg-brand-primary text-secondary rounded-full p-2 hover:bg-brand-primary/85 disabled:opacity-60 transition-colors duration-150"
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
