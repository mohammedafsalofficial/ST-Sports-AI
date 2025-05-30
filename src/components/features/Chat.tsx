"use client";

import { generateLLMResponse } from "@/actions/chat";
import { ArrowUp } from "lucide-react";
import { useActionState, useRef } from "react";

export default function Chat({ chatSessionId }: { chatSessionId: string }) {
  const [state, formAction, pending] = useActionState(generateLLMResponse, {
    chatSessionId,
    success: false,
    error: null,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  return (
    <form action={formAction} className="h-full flex-1 flex flex-col items-center justify-center space-y-8">
      <div className="relative w-[80%]">
        <textarea
          ref={textareaRef}
          onInput={handleInput}
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
