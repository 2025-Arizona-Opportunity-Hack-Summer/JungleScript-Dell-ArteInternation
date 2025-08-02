import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a Supabase client that authenticates using Clerk's JWT
 * This client respects RLS policies based on the authenticated user
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth()
  
  // Get Clerk's JWT token for Supabase
  const supabaseAccessToken = await getToken({
    template: "supabase",
  })

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  })

  return supabase
}

/**
 * Create a Supabase client for client-side operations
 * This should be used in components and client-side code
 */
export function createClientSupabaseClient() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  return supabase
}