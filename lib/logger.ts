// centralized logging utility with environment-aware behavior
import { isDevelopment } from "./config"

export const logger = {
  // development-only info logging
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...(data !== undefined ? [data] : []))
    }
  },

  // development-only debug logging  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...(data !== undefined ? [data] : []))
    }
  },

  // development-only warning
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...(data !== undefined ? [data] : []))
    }
  },

  // always log errors (production + development)
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, ...(error !== undefined ? [error] : []))
  },

  // api-specific logging with endpoint context
  api: {
    info: (endpoint: string, message: string, data?: any) => {
      if (isDevelopment) {
        console.log(`[API:${endpoint}] ${message}`, ...(data !== undefined ? [data] : []))
      }
    },
    error: (endpoint: string, message: string, error?: any) => {
      console.error(`[API:${endpoint}] ${message}`, ...(error !== undefined ? [error] : []))
    }
  }
}