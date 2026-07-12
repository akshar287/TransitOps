import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (!role) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // RBAC Enforcements based on the Matrix
    // Fleet Manager
    if (role === 'FleetManager') {
      if (path.startsWith('/trips') || path.startsWith('/expenses')) {
        return NextResponse.rewrite(new URL('/403', req.url));
      }
    }

    // Dispatcher
    if (role === 'Dispatcher') {
      if (path.startsWith('/analytics') || path.startsWith('/expenses') || path.startsWith('/maintenance') || path.startsWith('/settings')) {
        return NextResponse.rewrite(new URL('/403', req.url));
      }
      // Note: Dispatcher can view Fleet and Drivers (via trip dispatcher picker)
    }

    // Safety Officer
    if (role === 'SafetyOfficer') {
      if (path.startsWith('/fleet') || path.startsWith('/expenses') || path.startsWith('/analytics') || path.startsWith('/maintenance') || path.startsWith('/settings')) {
        return NextResponse.rewrite(new URL('/403', req.url));
      }
    }

    // Financial Analyst
    if (role === 'FinancialAnalyst') {
      if (path.startsWith('/drivers') || path.startsWith('/trips') || path.startsWith('/maintenance') || path.startsWith('/settings')) {
        return NextResponse.rewrite(new URL('/403', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/seed (Seed route)
     * - login (Login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/seed|login|register|_next/static|_next/image|favicon.ico).*)',
  ],
};
