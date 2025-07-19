import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Briefcase, Edit, Eye } from "lucide-react";
import Header from "@/components/layout/header";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

// Helper function to get the base URL
function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`; // localhost
}

// The page is an async function
export default async function AlumniDashboard() {
  console.log("Entering here!")
  // ✅ SOLUTION: Call auth().getToken() directly and await the result.
  const token = await auth().getToken();

  const res = await fetch(`${getBaseUrl()}/api/alumniDashboard`, {
    headers: { Authorization: `Bearer ${token}` }, // Use the token variable here
  });

  if (!res.ok) {
    // You might want to add more specific error handling here
    console.error("Failed to fetch dashboard data:", res.status, res.statusText);
    return <div>Failed to load dashboard data. Please try again.</div>
  }

  const data = await res.json();
  const { user, stats, activity } = data;

  // Your stats can now be dynamic
  const statCards = [
    { title: "Total Alumni", value: stats.totalAlumni, icon: Users, description: "Active members in network" },
    { title: "Countries", value: stats.countries, icon: MapPin, description: "Alumni locations worldwide" },
    { title: "Recent Graduates", value: stats.recentGraduates, icon: Calendar, description: "Class of 2024" },
    { title: "Professional Fields", value: stats.professionalFields, icon: Briefcase, description: "Different career paths" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
            <p className="mt-2 text-gray-600">Stay connected with your Dell'Arte community</p>
          </div>

          {/* Profile Status Card (using data fetched from the server) */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Profile</span>
                <Link href="/alumni/profile">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* This is where you would display the user's details */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.program && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="secondary">{user.program}</Badge>
                      {user.graduationYear && <Badge variant="outline">Class of {user.graduationYear}</Badge>}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The rest of your JSX remains the same... */}
        </div>
      </main>
    </div>
  );
}