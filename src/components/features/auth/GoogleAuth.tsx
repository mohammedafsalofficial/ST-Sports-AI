"use client";

import GoogleSVG from "@/components/ui/GoogleSVG";

export default function GoogleAuth() {
  const handleClick = () => {};

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center space-x-1 border border-gray-500 px-4 py-2 rounded-sm cursor-pointer bg-primary hover:bg-[#3b3a38] duration-150 transition-colors"
    >
      <GoogleSVG width="23" height="23" />
      <span>Continue with Google</span>
    </button>
  );
}
