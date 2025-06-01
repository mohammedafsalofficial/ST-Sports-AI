"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const googleAuth = async (redirectPath: string) => {
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `http://localhost:3000/api/auth/callback?next=${redirectPath}`,
    },
  });

  if (error) console.error("Error:", error.message);
  if (data.url) redirect(data.url);
};

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
};
