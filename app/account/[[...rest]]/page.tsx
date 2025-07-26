"use client"

import { UserProfile } from "@clerk/nextjs"

export default function AccountPage() {
  return (
    <main className="flex justify-center items-start py-12">
      <UserProfile path="/account" routing="path" />
    </main>
  )
} 