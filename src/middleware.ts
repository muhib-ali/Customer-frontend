import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPaths = ["/cart", "/wishlist", "/orders"]

  // Define public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/register",
    "/api/auth",
    "/_next",
    "/favicon.ico",
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  try {
    // Get token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If user is authenticated and trying to access auth pages, redirect to home
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!token && isProtectedPath) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // If token verification fails, redirect to login for protected routes
    if (isProtectedPath && !isPublicPath) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

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
}
