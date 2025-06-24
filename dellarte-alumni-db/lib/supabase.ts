import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// -----------------------------------------------------------------------------
// 🛡  Fallback: return a dummy client if env vars are missing (next-lite preview)
// -----------------------------------------------------------------------------
function createNoopClient() {
  /* A tiny stub with the same surface we use (`from().select()` etc.)    */
  /* so the rest of the code keeps working without network requests.      */
  const noData = { data: [], error: null, count: 0 } as any
  return {
    from() {
      return {
        select() {
          return Promise.resolve({ ...noData })
        },
        in() {
          return this
        },
        not() {
          return this
        },
        order() {
          return this
        },
        gte() {
          return this
        },
        limit() {
          return this
        },
      }
    },
  } as any
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createNoopClient()

// Types for our database
export interface AlumniProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  biography?: string
  current_role?: string
  current_organization?: string
  website_url?: string
  profile_visibility: "public" | "alumni-only" | "private"
  last_active: string
  created_at: string
  updated_at: string
  programs?: Array<{
    name: string
    graduation_year: number
  }>
  professional_tags?: Array<{
    name: string
  }>
  dellarte_roles?: Array<{
    name: string
  }>
}

export interface Program {
  id: string
  name: string
  description?: string
}

export interface ProfessionalTag {
  id: string
  name: string
}

export interface DellArteRole {
  id: string
  name: string
  description?: string
}

// Optimized function to fetch all alumni with their associations
export async function fetchAllAlumni(): Promise<AlumniProfile[]> {
  try {
    // Single query with all joins - much faster!
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select(`
        *,
        alumni_programs (
          graduation_year,
          programs (
            name
          )
        ),
        alumni_professional_tags (
          professional_tags (
            name
          )
        ),
        alumni_dellarte_roles (
          dellarte_roles (
            name
          )
        )
      `)
      .in("profile_visibility", ["public", "alumni-only"])

    if (error) {
      console.error("Error fetching alumni:", error)
      return []
    }

    // Transform the data to match our interface
    const transformedData: AlumniProfile[] = data.map((profile: any) => ({
      ...profile,
      programs:
        profile.alumni_programs?.map((ap: any) => ({
          name: ap.programs?.name || "Unknown Program",
          graduation_year: ap.graduation_year || new Date().getFullYear(),
        })) || [],
      professional_tags:
        profile.alumni_professional_tags
          ?.map((apt: any) => ({
            name: apt.professional_tags?.name,
          }))
          .filter((t: any) => t.name) || [],
      dellarte_roles:
        profile.alumni_dellarte_roles
          ?.map((adr: any) => ({
            name: adr.dellarte_roles?.name,
          }))
          .filter((r: any) => r.name) || [],
    }))

    console.log(`Fetched ${transformedData.length} alumni profiles in single query`)
    return transformedData
  } catch (error) {
    console.error("Error in fetchAllAlumni:", error)
    return []
  }
}

// Optimized function to fetch alumni with coordinates for map
export async function fetchAlumniForMap(): Promise<AlumniProfile[]> {
  try {
    // Single query with coordinate filter - even faster for map!
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select(`
        *,
        alumni_programs (
          graduation_year,
          programs (
            name
          )
        ),
        alumni_professional_tags (
          professional_tags (
            name
          )
        ),
        alumni_dellarte_roles (
          dellarte_roles (
            name
          )
        )
      `)
      .in("profile_visibility", ["public", "alumni-only"])
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (error) {
      console.error("Error fetching alumni for map:", error)
      return []
    }

    // Transform the data to match our interface
    const transformedData: AlumniProfile[] = data.map((profile: any) => ({
      ...profile,
      programs:
        profile.alumni_programs?.map((ap: any) => ({
          name: ap.programs?.name || "Unknown Program",
          graduation_year: ap.graduation_year || new Date().getFullYear(),
        })) || [],
      professional_tags:
        profile.alumni_professional_tags
          ?.map((apt: any) => ({
            name: apt.professional_tags?.name,
          }))
          .filter((t: any) => t.name) || [],
      dellarte_roles:
        profile.alumni_dellarte_roles
          ?.map((adr: any) => ({
            name: adr.dellarte_roles?.name,
          }))
          .filter((r: any) => r.name) || [],
    }))

    console.log(`Fetched ${transformedData.length} alumni profiles with coordinates in single query`)
    return transformedData
  } catch (error) {
    console.error("Error in fetchAlumniForMap:", error)
    return []
  }
}
