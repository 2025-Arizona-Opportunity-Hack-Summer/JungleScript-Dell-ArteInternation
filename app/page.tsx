"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Dell'Arte Alumni Network</h1>
      <p className="text-lg text-gray-700 mb-8">
        Connect with fellow alumni, discover opportunities, and stay in touch with the Dell'Arte community.
      </p>
      <div className="flex space-x-4">
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="outline">Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}
