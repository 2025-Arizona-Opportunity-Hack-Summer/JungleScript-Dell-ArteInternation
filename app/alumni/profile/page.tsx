// File: app/alumni/profile/page.tsx
import Header from "@/components/layout/header";
import ProfileForm from "@/components/forms/ProfileForm"; // We will create this next
import { auth } from "@clerk/nextjs/server";

// Helper function to get the base URL for server-side fetching
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// This is now a Server Component that fetches data before rendering
export default async function AlumniProfilePage() {
  const { getToken } = auth();

  // Fetch the user's current profile data on the server
  const res = await fetch(`${getBaseUrl()}/api/profile`, {
    headers: { Authorization: `Bearer ${await getToken()}` },
  });

  if (!res.ok) {
    // Handle error - maybe show a dedicated error page
    return <div>Could not load profile data. Please try again later.</div>;
  }

  const initialData = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
            {/* We pass the initial data to the interactive form component */}
            <ProfileForm initialData={initialData} />
        </div>
      </main>
    </div>
  );
}