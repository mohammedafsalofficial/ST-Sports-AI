"use client";

import { useState } from "react";
import { signOut } from "@/actions/auth";
import { LogOut, Loader2 } from "lucide-react";

export default function SignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex text-sm items-center justify-start space-x-2 bg-gray-500/30 hover:bg-gray-500/20 w-full py-2 px-4 rounded-md cursor-pointer disabled:opacity-50"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="animate-spin text-brand-primary" size={18} />
      ) : (
        <LogOut className="text-brand-primary" size={18} />
      )}
      <span>{loading ? "Logging out..." : "Log out"}</span>
    </button>
  );
}
