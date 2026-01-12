import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        fullname: { label: "Full Name", type: "text" },
        username: { label: "Username", type: "text" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials: any, req: any) {
        try {
          // Check if this is a registration request (has fullname, username, phone)
          if (credentials?.fullname && credentials?.username && credentials?.phone) {
            // Registration
            const registerResponse = await axios.post(
              `${API_URL}/auth/register`,
              {
                fullname: credentials.fullname,
                username: credentials.username,
                email: credentials.email,
                password: credentials.password,
                phone: credentials.phone,
              }
            )

            if (registerResponse.data.status) {
              const { customer, token, refresh_token, expires_at } = registerResponse.data.data
              
              return {
                id: customer.id,
                email: customer.email,
                name: customer.fullname,
                username: customer.username,
                accessToken: token,
                refreshToken: refresh_token,
                expiresAt: expires_at,
              }
            }
          } else {
            // Login
            const loginResponse = await axios.post(
              `${API_URL}/auth/login`,
              {
                email: credentials.email,
                password: credentials.password,
              }
            )

            if (loginResponse.data.status) {
              const { customer, token, refresh_token, expires_at } = loginResponse.data.data
              
              return {
                id: customer.id,
                email: customer.email,
                name: customer.fullname,
                username: customer.username,
                accessToken: token,
                refreshToken: refresh_token,
                expiresAt: expires_at,
              }
            }
          }
        } catch (error: any) {
          console.error("Auth error:", error.response?.data || error.message)
          throw new Error(error.response?.data?.message || "Authentication failed")
        }
        
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      // Initial sign in
      if (user && account) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
          username: user.username,
        }
      }

      // Check if token is expired
      if (token.expiresAt) {
        const expirationTime = new Date(token.expiresAt).getTime()
        const currentTime = Date.now()
        
        if (currentTime >= expirationTime) {
          try {
            // Refresh token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refresh_token: token.refreshToken as string,
            })

            if (response.data.status) {
              const { token: newToken, expires_at } = response.data.data
              
              return {
                ...token,
                accessToken: newToken,
                expiresAt: expires_at,
              }
            }
          } catch (error) {
            // Refresh failed, return null to sign out
            console.error("Token refresh failed:", error)
            return null
          }
        }
      }

      return token
    },
    async session({ session, token }: any) {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub!,
            username: token.username,
          },
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresAt,
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
