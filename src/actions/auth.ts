"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const googleAuth = async () => {
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/api/auth/callback",
      queryParams: { next: "/chat" },
    },
  });

  if (error) console.error("Error:", error.message);

  if (data.url) redirect(data.url);
};
