import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations/auth"
import authConfig from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.statusCheckedAt = Date.now()
      }

      // Re-validate user status every 5 minutes
      if (token.id) {
        const now = Date.now()
        const lastCheck = (token.statusCheckedAt as number) || 0
        if (now - lastCheck > 5 * 60 * 1000) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { status: true, role: true },
          })
          if (!dbUser || dbUser.status !== "ACTIVE") {
            token.id = ""
            token.role = undefined
          } else {
            token.role = dbUser.role
          }
          token.statusCheckedAt = now
        }
      }

      return token
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) return null

        const user = await prisma.user.findUnique({
          where: { email: validated.data.email },
        })
        if (!user?.passwordHash) return null

        const isValid = await bcrypt.compare(
          validated.data.password,
          user.passwordHash
        )
        if (!isValid) return null
        if (user.status !== "ACTIVE") return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
})
