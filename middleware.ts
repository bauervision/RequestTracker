import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const userRole = request.cookies.get("userRole")?.value || "guest";

  // Define roles and their accessible paths
  const rolePaths: { [key: string]: string[] } = {
    admin: ["/admin", "/user"],
    user: ["/user"],
    guest: [],
  };

  // Check if the user has access to the requested path
  const hasAccess = rolePaths[userRole]?.some((path) =>
    pathname.startsWith(path)
  );

  if (!hasAccess) {
    url.pathname = "/";
    url.searchParams.set("message", "You do not have access to this page");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Specify paths to apply middleware
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
