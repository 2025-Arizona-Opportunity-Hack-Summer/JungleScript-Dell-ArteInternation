"use client"

import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@clerk/nextjs"
import { useMemo, useEffect, useState } from "react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Hook to create an authenticated Supabase client for client-side operations
 * This client will respect RLS policies based on the current user's Clerk JWT
 */
export function useSupabaseClient() {
  const { getToken } = useAuth()
  const [supabaseClient, setSupabaseClient] = useState(() => 
    createClient(supabaseUrl, supabaseAnonKey)
  )

  useEffect(() => {
    const updateClient = async () => {
      const token = await getToken({ template: "supabase" })
      
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      })
      
      setSupabaseClient(client)
    }

    updateClient()
  }, [getToken])

  return supabaseClient
}

/**
 * Create a basic Supabase client for non-authenticated operations
 * This should only be used for public data or when user is not logged in
 */
export function createBasicSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}