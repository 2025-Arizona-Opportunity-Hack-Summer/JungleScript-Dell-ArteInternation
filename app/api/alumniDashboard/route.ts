import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server"; // Using Clerk for auth
import { createClient } from "@supabase/supabase-js"; // Supabase client

// Initialize Supabase client (do this in a separate config file)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // 1. Authenticate the user securely on the server
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // You can also get the full user object from Clerk
  const user = await currentUser();

  try {
    // 2. Fetch data from your Supabase database in parallel
    const [alumniStats, recentActivity] = await Promise.all([
      // Example: Fetching total alumni count
      supabase.from("alumni_profiles").select("*", { count: "exact", head: true }),
      
      // Example: Fetching recent activity
      supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(3),
    ]);

    // 3. Construct the response object
    const responseData = {
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.emailAddresses[0]?.emailAddress,
        // You would fetch program/year from your own 'profiles' table
        program: "MFA Physical Theatre", 
        graduationYear: "2022",
      },
      stats: {
        totalAlumni: alumniStats.count ?? 0,
        countries: 23, // Replace with real data
        recentGraduates: 45, // Replace with real data
        professionalFields: 12, // Replace with real data
      },
      activity: recentActivity.data, // This comes directly from Supabase
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}