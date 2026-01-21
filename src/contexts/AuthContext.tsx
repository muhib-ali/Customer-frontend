"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { authApi } from "@/services/auth"

interface User {
  id: string
  fullname: string
  username: string
  email: string
  phone: string
  is_email_verified: boolean
  is_phone_verified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    fullname: string
    username: string
    email: string
    password: string
    phone: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      // Don't try to load profile if we don't have a session
      if (!session?.user || !session.accessToken) {
        setLoading(false);
        return;
      }

      try {
        // Store tokens in localStorage for API calls
        localStorage.setItem("accessToken", session.accessToken);
        if (session.refreshToken) {
          localStorage.setItem("refreshToken", session.refreshToken);
        }
        if (session.expiresAt) {
          localStorage.setItem("expiresAt", session.expiresAt);
        }

        // Set basic user info from session immediately
        const basicUser = {
          id: session.user.id,
          fullname: session.user.name || "",
          username: session.user.username || "",
          email: session.user.email || "",
          phone: "",
          is_email_verified: false,
          is_phone_verified: false,
        };
        setUser(basicUser);

        // Try to get full profile from API (don't fail completely if it fails)
        try {
          const profileData = await authApi.getProfile();
          if (profileData.status) {
            setUser(profileData.data);
          }
        } catch (profileError: any) {
          console.log("Profile API failed, checking if token expired:", profileError);
          
          // Check if it's an auth error (401)
          if (profileError.response?.status === 401) {
            console.log("Token expired, forcing logout");
            await logout();
            return;
          }
          
          // User is already set with basic info, so continue
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Set basic user info from session as fallback
        if (session.user) {
          setUser({
            id: session.user.id,
            fullname: session.user.name || "",
            username: session.user.username || "",
            email: session.user.email || "",
            phone: "",
            is_email_verified: false,
            is_phone_verified: false,
          });
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [session]);

  // Monitor session expiry and logout if needed
  useEffect(() => {
    if (!session?.expiresAt || !user) return;

    const checkSessionExpiry = () => {
      if (!session.expiresAt) return;
      
      const expiresAt = new Date(session.expiresAt).getTime()
      const currentTime = Date.now()
      
      // If session is expired or will expire in next 2 minutes, logout
      if (currentTime >= expiresAt) {
        console.log("Session expired, logging out")
        // Call logout logic directly without dependency
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("expiresAt")
        
        // Async logout
        ;(async () => {
          try {
            await authApi.logout()
            await signOut({ redirect: false })
            setUser(null)
          } catch (error) {
            console.error("Logout error:", error)
            await signOut({ redirect: false })
            setUser(null)
          }
        })()
      }
    }

    // Check immediately
    checkSessionExpiry()
    
    // Set up periodic check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000)
    
    return () => clearInterval(interval)
  }, [session?.expiresAt, user])

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.ok) {
        throw new Error("Login failed")
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: {
    fullname: string
    username: string
    email: string
    password: string
    phone: string
  }) => {
    try {
      const result = await signIn("credentials", {
        ...userData,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.ok) {
        throw new Error("Registration failed")
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear tokens from localStorage first
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("expiresAt")
      
      // Try to call logout API
      await authApi.logout()
      await signOut({ redirect: false })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API call fails
      await signOut({ redirect: false })
      setUser(null)
    }
  }

  const refreshProfile = async () => {
    try {
      const profileData = await authApi.getProfile()
      if (profileData.status) {
        setUser(profileData.data)
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
