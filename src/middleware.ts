import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function redirectToHomeWithPath(path: string, request: NextRequest) {
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("redirect", path);
  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/chat")) {
    return NextResponse.next();
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return redirectToHomeWithPath(pathname, request);
    }

    const { data: statusData, error: statusError } = await supabase
      .from("user_status")
      .select("status")
      .eq("user_id", user.id)
      .single();

    const userStatus = statusData?.status;

    if (statusError || !userStatus || userStatus === "pending") {
      throw new Error("User not approved or status check failed");
    }

    return NextResponse.next();
  } catch (err) {
    console.log("Middleware auth check failed:", err);
    return redirectToHomeWithPath(pathname, request);
  }
}

export const config = {
  matcher: "/chat/:path*",
};
