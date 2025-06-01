"use client";

import { signOut } from "@/actions/auth";
import { LogOut } from "lucide-react";

export default function SignOut() {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex text-sm items-center justify-start space-x-2 bg-gray-500/30 hover:bg-gray-500/20 w-full py-2 px-4 rounded-md cursor-pointer"
    >
      <LogOut className="text-brand-primary" size={18} />
      <span>Log out</span>
    </button>
  );
}
