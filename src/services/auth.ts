import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"

// Create axios instance with auth header
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          if (response.data.status) {
            const { token: newToken, expires_at } = response.data.data
            localStorage.setItem("accessToken", newToken)
            localStorage.setItem("expiresAt", expires_at)

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("expiresAt")
        window.location.href = "/auth/signin"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API functions
export const authApi = {
  async register(userData: {
    fullname: string
    username: string
    email: string
    password: string
    phone: string
  }) {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
  },

  async login(credentials: { email: string; password: string }) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    return response.data
  },

  async getProfile() {
    const response = await api.get("/auth/profile")
    return response.data
  },

  async logout() {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("expiresAt")
    }
  },

  async refreshToken(refreshToken: string) {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    })
    return response.data
  },
}

export default authApi
