import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      const pathname = nextUrl.pathname;

      const isHostRoute = pathname.startsWith('/host');
      const isBookingsRoute = pathname.startsWith('/mis-reservas');
      const isDashboardRoute = pathname.startsWith('/dashboard');
      const isLoginRoute = pathname.startsWith('/login');

      // 1. Rutas de Anfitrión (/host)
      if (isHostRoute) {
        if (!isLoggedIn) return false;
        if (userRole && userRole !== 'host' && userRole !== 'admin') {
          return Response.redirect(new URL('/login?error=UnauthorizedHost', nextUrl));
        }
        return true;
      }

      // 2. Rutas de Reservas y Dashboard
      if (isBookingsRoute || isDashboardRoute) {
        if (!isLoggedIn) return false;
        return true;
      }

      // 3. Redirigir si ya inició sesión e intenta ir a /login
      if (isLoginRoute && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;