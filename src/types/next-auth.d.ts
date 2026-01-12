import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string
    } & DefaultSession["user"]
    accessToken?: string
    refreshToken?: string
    expiresAt?: string
  }

  interface User {
    id: string
    email: string
    name: string
    username: string
    accessToken: string
    refreshToken: string
    expiresAt: string
  }

  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: string
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: string
    username?: string
  }
}
