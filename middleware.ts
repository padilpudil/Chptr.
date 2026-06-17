import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding");
  const isProtectedRoute = nextUrl.pathname.startsWith("/works/new") || nextUrl.pathname.startsWith("/bookmarks") || nextUrl.pathname.endsWith("/edit");

  // Force onboarding if the user has a pending Google username pattern
  const isPendingUsername = isLoggedIn && req.auth?.user?.username?.startsWith("pending_google_");

  if (isPendingUsername && !isOnboardingPage && !nextUrl.pathname.startsWith("/api")) {
    return Response.redirect(new URL("/onboarding", nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
  }

  if (isAuthPage && isLoggedIn && !isPendingUsername) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
