"use client"

import { UserProfile } from "@clerk/nextjs"

export default function AccountPage() {
  return (
    <main className="flex-1 flex justify-center items-start py-12 overflow-y-auto">
      <UserProfile path="/account" routing="path" />
    </main>
  )
} 