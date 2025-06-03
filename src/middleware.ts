import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chat")) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        const redirectUrl = new URL("/", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const { data } = await supabase.from("user_status").select("status").eq("user_id", user.id);
      const userStatus = data && data[0].status;
      if (!userStatus || userStatus === "pending") {
        throw new Error("User not approved");
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth check failed:", error);
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/chat/:path*",
};
