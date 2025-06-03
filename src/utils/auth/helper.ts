import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export const getAuthenticatedUser = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error("Authentication Error:", error?.message);
    redirect("/");
  }

  return data.user;
};
