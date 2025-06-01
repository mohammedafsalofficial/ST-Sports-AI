import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export const getAuthenticatedUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(`Authentication Error: ${authError?.message}`);
    redirect("/");
  }

  return user;
};
