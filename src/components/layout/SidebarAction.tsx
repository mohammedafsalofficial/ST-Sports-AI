"use client";

import { deleteChat } from "@/actions/chat";
import { ChatSessionType } from "@/types/chat";
import { Pen, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SidebarChatProps {
  chat: ChatSessionType;
}

export default function SidebarAction({ chat }: SidebarChatProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleDeleteChat = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await deleteChat(chat.id, pathname);
  };

  const handleRenameChat = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <Link
      href={`/chat/${chat.id}`}
      className={`w-full rounded-md py-2 flex items-center justify-between space-x-2 px-4 text-sm duration-150 transition-colors ease-in-out group cursor-pointer ${
        isOpen ? "bg-gray-500/30" : "hover:bg-gray-500/30"
      }`}
    >
      <span>{chat.title}</span>
      <div className="relative" ref={actionRef}>
        <button
          onClick={handleClick}
          className="space-x-[1px] flex items-center justify-center cursor-pointer p-1 rounded transition-colors"
        >
          <div
            className={`h-1 w-1 rounded-full ${isOpen ? "bg-secondary" : "bg-primary group-hover:bg-secondary"}`}
          ></div>
          <div
            className={`h-1 w-1 rounded-full ${isOpen ? "bg-secondary" : "bg-primary group-hover:bg-secondary"}`}
          ></div>
          <div
            className={`h-1 w-1 rounded-full ${isOpen ? "bg-secondary" : "bg-primary group-hover:bg-secondary"}`}
          ></div>
        </button>

        {isOpen && (
          <div className="absolute top-3 left-0 z-50 bg-white shadow-md border border-gray-200 rounded-md py-1 w-32 animate-fade-in">
            <button
              onClick={handleRenameChat}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Pen className="text-primary" size={16} />
              <span className="text-primary">Rename</span>
            </button>
            <button
              onClick={handleDeleteChat}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Trash2 className="text-red-600" size={16} />
              <span className="text-red-600">Delete</span>
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
