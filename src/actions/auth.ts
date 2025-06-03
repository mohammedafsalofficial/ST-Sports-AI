"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const REDIRECT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const googleAuth = async (redirectPath: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${REDIRECT_BASE_URL}/api/auth/callback?next=${redirectPath}`,
    },
  });

  if (error) {
    console.error("Google Auth Error:", error.message);
    return;
  }

  if (data.url) {
    redirect(data.url);
  }
};

export const signOut = async () => {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Sign out error:", err);
  }

  redirect("/");
};
