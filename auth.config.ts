import type { NextAuthConfig } from "next-auth";


export const authConfig = {
  pages: {
    signIn: 'login',
  },
  // secret: process.env.SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
if (isOnDashboard) {
  if (isLoggedIn) return true;
  return false; // Redirect unauthenticated users to login page
} else if (isLoggedIn) {
  return Response.redirect(new URL('/dashboard', nextUrl));
}
return true;
    },
  },
providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

// Satisfies En TypeScript, el operador satisfies verifica si un tipo específico satisface una condición o interfaz determinada. Se trata de una manera nueva y efectiva de garantizar la seguridad de tipos en TypeScript.