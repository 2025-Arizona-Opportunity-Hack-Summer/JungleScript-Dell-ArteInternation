"use client"

import { create } from "zustand"
import { supabase, isSupabaseConfigured } from "./supabase"
import { demoAlumni } from "./demo-data"

export interface AlumniProfile {
  id: number
  firstName: string
  lastName: string
  email: string
    phone?: string
  clerkUserId?: string
  imageUrl?: string
  address: {
    street?: string
    city: string
    state?: string
    zipCode?: string
    country: string
    latitude: number
    longitude: number
  }
  programsAttended: {
    program: string
    graduationYear: number
    cohort?: string
  }[]
  biography?: string
  currentWork?: {
    title?: string
    organization?: string
    location?: string
  }
  tags: string[]
  languagesSpoken: string[]
  professionalAchievements: string[]
  portfolioLinks?: {
    website?: string
    linkedin?: string
    instagram?: string
    youtube?: string
  }
  experiencesAtDellArte: string[]
  referrals: string[]
  lastUpdated?: string
  profilePrivacy: "public" | "private"
  donationHistory: {
    date: string
    amount: number
    campaign: string
  }[]
}

interface AlumniStore {
  alumni: AlumniProfile[]
  loading: boolean
  error: string | null
  fetchAlumni: () => Promise<void>
  addAlumni: (newAlumni: Omit<AlumniProfile, "id">) => Promise<void>
  updateAlumni: (updatedAlumni: AlumniProfile) => Promise<void>
  deleteAlumni: (id: number) => Promise<void>
}

// No longer needed
// const transformSupabaseToAlumni = (supabaseObj: any): AlumniProfile => { ... }

export const useAlumniStore = create<AlumniStore>((set, get) => ({
  alumni: [],
  loading: false,
  error: null,

  fetchAlumni: async () => {
    set({ loading: true, error: null })

    try {
      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, using demo data")
        set({ alumni: demoAlumni, loading: false })
        return
      }

      console.log("Fetching alumni through API...")
      // Use the admin API route which handles both admin and user permissions properly
      const response = await fetch("/api/admin/alumni", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch alumni: ${response.statusText}`)
      }

      const data = await response.json()
      set({ alumni: data || [], loading: false })
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
      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, adding to local state only")
        const alumni = get().alumni
        const newId = Math.max(...alumni.map((a) => a.id), 0) + 1
        const alumniWithId = { ...newAlumni, id: newId }
        set({ alumni: [...alumni, alumniWithId as AlumniProfile] })
        return
      }

      const response = await fetch("/api/admin/alumni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newAlumni),
      })

      if (!response.ok) {
        throw new Error(`Failed to add alumni: ${response.statusText}`)
      }

      const data = await response.json()
      if (data) {
        set({ alumni: [...get().alumni, data] })
      }
    } catch (error: any) {
      set({ error: `Failed to add alumni: ${error.message}` })
    }
  },

  updateAlumni: async (updatedAlumni) => {
    set({ error: null })

    try {
      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, updating local state only")
        set({
          alumni: get().alumni.map((a) => (a.id === updatedAlumni.id ? updatedAlumni : a)),
        })
        return
      }

      const response = await fetch(`/api/admin/alumni/${updatedAlumni.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedAlumni),
      })

      if (!response.ok) {
        throw new Error(`Failed to update alumni: ${response.statusText}`)
      }

      const data = await response.json()
      if (data) {
        set({
          alumni: get().alumni.map((a) => (a.id === data.id ? data : a)),
        })
      }
    } catch (error: any) {
      set({ error: `Failed to update alumni: ${error.message}` })
    }
  },

  deleteAlumni: async (id) => {
    set({ error: null })

    try {
      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, deleting from local state only")
        set({ alumni: get().alumni.filter((a) => a.id !== id) })
        return
      }

      const response = await fetch(`/api/admin/alumni/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete alumni: ${response.statusText}`)
      }

      set({ alumni: get().alumni.filter((a) => a.id !== id) })
    } catch (error: any) {
      set({ error: `Failed to delete alumni: ${error.message}` })
    }
  },
}))
