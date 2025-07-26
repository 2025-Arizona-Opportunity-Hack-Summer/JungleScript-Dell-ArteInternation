"use client"

import { create } from "zustand"
import { supabase, isSupabaseConfigured } from "./supabase"

export interface AlumniProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address: {
    street: string
    city: string
    state?: string
    zipCode: string
    country: string
    latitude: number
    longitude: number
  }
  programsAttended: Array<{
    program: string
    cohort: string
    graduationYear: number
  }>
  biography?: string
  currentWork?: {
    title: string
    organization: string
    location: string
  }
  tags: string[]
  languagesSpoken: string[]
  professionalAchievements: string[]
  portfolioLinks: {
    website?: string
    linkedin?: string
    instagram?: string
    youtube?: string
  }
  experiencesAtDellArte: string[]
  referrals: string[]
  lastUpdated: string
  profilePrivacy: "public" | "private" | "alumni-only"
  donationHistory: Array<{
    amount: number
    date: string
    campaign?: string
  }>
}

// Demo data for when Supabase is not configured
const demoAlumni: AlumniProfile[] = [
  {
    id: 1,
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@email.com",
    phone: "+1-555-0123",
    address: {
      street: "123 Theatre St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    programsAttended: [
      {
        program: "MFA in Ensemble Based Physical Theatre",
        cohort: "2018-2020",
        graduationYear: 2020,
      },
    ],
    biography:
      "Maria is a passionate physical theatre artist who combines traditional commedia dell'arte with contemporary social issues. She founded Teatro Nuevo in San Francisco, focusing on bilingual performances that bridge cultural divides.",
    currentWork: {
      title: "Artistic Director",
      organization: "Teatro Nuevo",
      location: "San Francisco, CA",
    },
    tags: ["directing", "commedia dell'arte", "bilingual theatre"],
    languagesSpoken: ["English", "Spanish"],
    professionalAchievements: ["Founded Teatro Nuevo (2021)", "SF Arts Commission Grant Recipient (2022)"],
    portfolioLinks: {
      website: "teatronuevo.org",
      instagram: "@teatronuevo",
    },
    experiencesAtDellArte: ["Commedia Intensive", "Mask Making Workshop"],
    referrals: [],
    lastUpdated: "2024-01-15",
    profilePrivacy: "public",
    donationHistory: [],
  },
  {
    id: 2,
    firstName: "James",
    lastName: "Chen",
    email: "james.chen@email.com",
    phone: "+1-555-0124",
    address: {
      street: "456 Performance Ave",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "USA",
      latitude: 45.5152,
      longitude: -122.6784,
    },
    programsAttended: [
      {
        program: "Professional Training Program",
        cohort: "2019",
        graduationYear: 2019,
      },
    ],
    biography:
      "James specializes in mask work and has developed innovative techniques for integrating technology with traditional mask performance. He teaches workshops internationally and has performed with major theatre companies.",
    currentWork: {
      title: "Mask Artist & Educator",
      organization: "Pacific Theatre Collective",
      location: "Portland, OR",
    },
    tags: ["mask making", "technology integration", "teaching"],
    languagesSpoken: ["English", "Mandarin"],
    professionalAchievements: ["TEDx Speaker on Digital Masks (2023)", "Oregon Arts Fellowship (2022)"],
    portfolioLinks: {
      website: "jameschen-masks.com",
      linkedin: "james-chen-theatre",
    },
    experiencesAtDellArte: ["Advanced Mask Techniques", "Teaching Methodology"],
    referrals: [],
    lastUpdated: "2024-01-10",
    profilePrivacy: "public",
    donationHistory: [],
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Thompson",
    email: "sarah.thompson@email.com",
    phone: "+1-555-0125",
    address: {
      street: "789 Clown Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
      latitude: 30.2672,
      longitude: -97.7431,
    },
    programsAttended: [
      {
        program: "Summer Workshop - Clown Intensive",
        cohort: "2020",
        graduationYear: 2020,
      },
    ],
    biography:
      "Sarah brings healing through laughter as a healthcare clown. She works in children's hospitals and elder care facilities, using Dell'Arte techniques to bring joy and comfort to patients and families.",
    currentWork: {
      title: "Healthcare Clown",
      organization: "Healing Hearts Hospital",
      location: "Austin, TX",
    },
    tags: ["clown", "healthcare clowning", "therapeutic arts"],
    languagesSpoken: ["English"],
    professionalAchievements: ["Certified Healthcare Clown (2021)", "Community Service Award (2023)"],
    portfolioLinks: {
      instagram: "@sarahtheclown",
      youtube: "SarahThompsonClown",
    },
    experiencesAtDellArte: ["Clown Intensive", "Medical Clowning Workshop"],
    referrals: [],
    lastUpdated: "2024-01-08",
    profilePrivacy: "public",
    donationHistory: [],
  },
  {
    id: 4,
    firstName: "Alessandro",
    lastName: "Bianchi",
    email: "alessandro.bianchi@email.com",
    phone: "+39-123-456-789",
    address: {
      street: "Via del Teatro 15",
      city: "Florence",
      state: "",
      zipCode: "50122",
      country: "Italy",
      latitude: 43.7696,
      longitude: 11.2558,
    },
    programsAttended: [
      {
        program: "International Summer School",
        cohort: "2021",
        graduationYear: 2021,
      },
    ],
    biography:
      "Alessandro is preserving and innovating traditional Italian theatre forms. He leads workshops across Europe and collaborates with Dell'Arte on international exchange programs.",
    currentWork: {
      title: "Theatre Director",
      organization: "Compagnia del Sole",
      location: "Florence, Italy",
    },
    tags: ["commedia dell'arte", "international collaboration", "cultural preservation"],
    languagesSpoken: ["Italian", "English", "French"],
    professionalAchievements: ["European Theatre Award (2022)", "Cultural Ambassador for Italy-US Arts Exchange"],
    portfolioLinks: {
      website: "compagniadelsole.it",
      linkedin: "alessandro-bianchi-theatre",
    },
    experiencesAtDellArte: ["International Summer School", "Cultural Exchange Program"],
    referrals: [],
    lastUpdated: "2024-01-12",
    profilePrivacy: "public",
    donationHistory: [],
  },
  {
    id: 5,
    firstName: "Aiyana",
    lastName: "Crow Feather",
    email: "aiyana.crowfeather@email.com",
    phone: "+1-555-0126",
    address: {
      street: "321 Sacred Way",
      city: "Santa Fe",
      state: "NM",
      zipCode: "87501",
      country: "USA",
      latitude: 35.687,
      longitude: -105.9378,
    },
    programsAttended: [
      {
        program: "MFA in Ensemble Based Physical Theatre",
        cohort: "2017-2019",
        graduationYear: 2019,
      },
    ],
    biography:
      "Aiyana weaves indigenous storytelling traditions with contemporary physical theatre. She creates powerful performances that honor her heritage while addressing modern social issues.",
    currentWork: {
      title: "Storyteller & Theatre Artist",
      organization: "Indigenous Arts Collective",
      location: "Santa Fe, NM",
    },
    tags: ["indigenous theatre", "storytelling", "cultural preservation"],
    languagesSpoken: ["English", "Lakota"],
    professionalAchievements: ["National Indigenous Arts Award (2023)", "Sundance Theatre Lab Fellow (2022)"],
    portfolioLinks: {
      website: "aiyanacrowfeather.com",
      instagram: "@aiyana_stories",
    },
    experiencesAtDellArte: ["MFA Program", "Indigenous Theatre Workshop"],
    referrals: [],
    lastUpdated: "2024-01-14",
    profilePrivacy: "public",
    donationHistory: [],
  },
]

interface AlumniStore {
  alumni: AlumniProfile[]
  loading: boolean
  error: string | null
  fetchAlumni: () => Promise<void>
  addAlumni: (alumni: Omit<AlumniProfile, "id">) => Promise<void>
  updateAlumni: (id: number, updates: Partial<AlumniProfile>) => Promise<void>
  deleteAlumni: (id: number) => Promise<void>
}

// Transform Supabase data to our interface
const transformSupabaseToAlumni = (data: any): AlumniProfile => ({
  id: data.id,
  firstName: data.first_name || "",
  lastName: data.last_name || "",
  email: data.email || "",
  phone: data.phone || "",
  address:
    typeof data.address === "string"
      ? JSON.parse(data.address)
      : data.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          latitude: 0,
          longitude: 0,
        },
  programsAttended:
    typeof data.programs_attended === "string"
      ? JSON.parse(data.programs_attended)
      : Array.isArray(data.programs_attended)
        ? data.programs_attended
        : [],
  biography: data.biography || "",
  currentWork:
    typeof data.current_work === "string"
      ? JSON.parse(data.current_work)
      : data.current_work || {
          title: "",
          organization: "",
          location: "",
        },
  tags: Array.isArray(data.tags) ? data.tags : [],
  languagesSpoken: Array.isArray(data.languages_spoken) ? data.languages_spoken : [],
  professionalAchievements: Array.isArray(data.professional_achievements) ? data.professional_achievements : [],
  portfolioLinks:
    typeof data.portfolio_links === "string" ? JSON.parse(data.portfolio_links) : data.portfolio_links || {},
  experiencesAtDellArte: Array.isArray(data.experiences_at_dellarte) ? data.experiences_at_dellarte : [],
  referrals: Array.isArray(data.referrals) ? data.referrals : [],
  lastUpdated: data.last_updated || new Date().toISOString().split("T")[0],
  profilePrivacy: (data.profile_privacy || "public") as "public" | "private" | "alumni-only",
  donationHistory:
    typeof data.donation_history === "string"
      ? JSON.parse(data.donation_history)
      : Array.isArray(data.donation_history)
        ? data.donation_history
        : [],
})

export const useAlumniStore = create<AlumniStore>((set, get) => ({
  alumni: [],
  loading: false,
  error: null,

  fetchAlumni: async () => {
    set({ loading: true, error: null })

    try {
      if (!isSupabaseConfigured || !supabase) {
        console.log("Supabase not configured, using demo data")
        set({ alumni: demoAlumni, loading: false })
        return
      }

      console.log("Fetching alumni from Supabase...")
      const { data, error } = await supabase.from("alumni").select("*").order("last_name", { ascending: true })

      if (error) {
        console.error("Supabase fetch error:", error)
        throw error
      }

      console.log("Raw Supabase data:", data)
      const transformedData = data?.map(transformSupabaseToAlumni) || []
      console.log("Transformed data:", transformedData)

      set({ alumni: transformedData, loading: false })
    } catch (error) {
      console.error("Error fetching alumni:", error)
      set({
        alumni: demoAlumni,
        loading: false,
        error: `Failed to fetch from database: ${error instanceof Error ? error.message : "Unknown error"}. Using demo data.`,
      })
    }
  },

  addAlumni: async (newAlumni) => {
    set({ error: null })

    try {
      if (!isSupabaseConfigured || !supabase) {
        console.log("Supabase not configured, adding to local state only")
        const alumni = get().alumni
        const newId = Math.max(...alumni.map((a) => a.id), 0) + 1
        const alumniWithId = { ...newAlumni, id: newId }
        set({ alumni: [...alumni, alumniWithId] })
        return
      }

      console.log("Adding alumni to Supabase:", newAlumni)

      // Prepare data for Supabase
      const supabaseData = {
        first_name: newAlumni.firstName,
        last_name: newAlumni.lastName,
        email: newAlumni.email,
        phone: newAlumni.phone || null,
        address: newAlumni.address,
        programs_attended: newAlumni.programsAttended,
        biography: newAlumni.biography || null,
        current_work: newAlumni.currentWork,
        tags: newAlumni.tags,
        languages_spoken: newAlumni.languagesSpoken,
        professional_achievements: newAlumni.professionalAchievements,
        portfolio_links: newAlumni.portfolioLinks,
        experiences_at_dellarte: newAlumni.experiencesAtDellArte,
        referrals: newAlumni.referrals,
        last_updated: newAlumni.lastUpdated,
        profile_privacy: newAlumni.profilePrivacy,
        donation_history: newAlumni.donationHistory,
      }

      console.log("Supabase insert data:", supabaseData)

      const { data, error } = await supabase.from("alumni").insert([supabaseData]).select().single()

      if (error) {
        console.error("Supabase insert error:", error)
        throw error
      }

      console.log("Insert successful, returned data:", data)

      if (data) {
        const transformedData = transformSupabaseToAlumni(data)
        const currentAlumni = get().alumni
        set({ alumni: [...currentAlumni, transformedData] })
        console.log("Alumni added successfully")
      }
    } catch (error) {
      console.error("Error adding alumni:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({ error: `Failed to add alumni: ${errorMessage}` })
      throw error
    }
  },

  updateAlumni: async (id, updates) => {
    set({ error: null })

    try {
      if (!isSupabaseConfigured || !supabase) {
        console.log("Supabase not configured, updating local state only")
        const alumni = get().alumni
        const updatedAlumni = alumni.map((a) => (a.id === id ? { ...a, ...updates } : a))
        set({ alumni: updatedAlumni })
        return
      }

      console.log("=== UPDATING ALUMNI IN SUPABASE ===")
      console.log("Alumni ID:", id)
      console.log("Updates:", updates)

      // Build update object with proper field mapping
      const updateData: any = {}

      if (updates.firstName !== undefined) updateData.first_name = updates.firstName
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.phone !== undefined) updateData.phone = updates.phone || null
      if (updates.address !== undefined) updateData.address = updates.address
      if (updates.programsAttended !== undefined) updateData.programs_attended = updates.programsAttended
      if (updates.biography !== undefined) updateData.biography = updates.biography || null
      if (updates.currentWork !== undefined) updateData.current_work = updates.currentWork
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.languagesSpoken !== undefined) updateData.languages_spoken = updates.languagesSpoken
      if (updates.professionalAchievements !== undefined)
        updateData.professional_achievements = updates.professionalAchievements
      if (updates.portfolioLinks !== undefined) updateData.portfolio_links = updates.portfolioLinks
      if (updates.experiencesAtDellArte !== undefined)
        updateData.experiences_at_dellarte = updates.experiencesAtDellArte
      if (updates.referrals !== undefined) updateData.referrals = updates.referrals
      if (updates.profilePrivacy !== undefined) updateData.profile_privacy = updates.profilePrivacy
      if (updates.donationHistory !== undefined) updateData.donation_history = updates.donationHistory

      // Always update timestamp
      updateData.last_updated = new Date().toISOString().split("T")[0]

      console.log("Prepared update data:", updateData)

      // Perform the update
      const { data, error } = await supabase.from("alumni").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Supabase update error:", error)
        throw error
      }

      console.log("Update successful, returned data:", data)

      if (data) {
        const transformedData = transformSupabaseToAlumni(data)
        const currentAlumni = get().alumni
        const updatedAlumni = currentAlumni.map((alumni) => (alumni.id === id ? transformedData : alumni))
        set({ alumni: updatedAlumni })
        console.log("Local state updated successfully")
      } else {
        console.warn("No data returned from update, but no error occurred")
        // Apply optimistic update
        const currentAlumni = get().alumni
        const updatedAlumni = currentAlumni.map((alumni) =>
          alumni.id === id ? { ...alumni, ...updates, lastUpdated: updateData.last_updated } : alumni,
        )
        set({ alumni: updatedAlumni })
      }

      console.log("=== UPDATE COMPLETED ===")
    } catch (error) {
      console.error("Error updating alumni:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({ error: `Failed to update alumni: ${errorMessage}` })
      throw error
    }
  },

  deleteAlumni: async (id) => {
    set({ error: null })

    try {
      if (!isSupabaseConfigured || !supabase) {
        console.log("Supabase not configured, removing from local state only")
        const alumni = get().alumni
        const filteredAlumni = alumni.filter((a) => a.id !== id)
        set({ alumni: filteredAlumni })
        return
      }

      console.log("=== DELETING ALUMNI FROM SUPABASE ===")
      console.log("Alumni ID:", id)

      const { error } = await supabase.from("alumni").delete().eq("id", id)

      if (error) {
        console.error("Supabase delete error:", error)
        throw error
      }

      console.log("Delete successful")

      // Update local state
      const currentAlumni = get().alumni
      const filteredAlumni = currentAlumni.filter((alumni) => alumni.id !== id)
      set({ alumni: filteredAlumni })

      console.log("=== DELETE COMPLETED ===")
    } catch (error) {
      console.error("Error deleting alumni:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({ error: `Failed to delete alumni: ${errorMessage}` })
      throw error
    }
  },
}))
