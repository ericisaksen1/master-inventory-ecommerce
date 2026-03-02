import type { NextAuthConfig } from "next-auth"

export default {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as any
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const isAdmin = auth?.user?.role === "ADMIN" || auth?.user?.role === "SUPER_ADMIN"
      const isAffiliate = auth?.user?.role === "AFFILIATE" || isAdmin

      if (nextUrl.pathname.startsWith("/admin")) {
        return isAdmin
      }

      if (
        nextUrl.pathname.startsWith("/affiliate") &&
        nextUrl.pathname !== "/affiliate/apply"
      ) {
        return isAffiliate
      }

      if (
        nextUrl.pathname.startsWith("/account") ||
        nextUrl.pathname.startsWith("/orders")
      ) {
        return isLoggedIn
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
