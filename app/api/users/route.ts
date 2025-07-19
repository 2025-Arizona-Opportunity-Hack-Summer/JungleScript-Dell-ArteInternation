// File: app/api/users/create-profile/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Get the authenticated user from Clerk
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 2. Get the custom data from the request body
    const { program, graduationYear } = await req.json();

    if (!program || !graduationYear) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // 3. Save the data to your 'alumni_profiles' table in Supabase
    const { data, error } = await supabaseAdmin
      .from("alumni_profiles") // Make sure this table name is correct
      .insert({
        id: userId, // Use the Clerk user ID as the primary key
        email: user.emailAddresses[0].emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        program: program,
        graduation_year: parseInt(graduationYear, 10),
        // Add any other fields you need here
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // Handle potential duplicate entry if user retries
      if (error.code === '23505') { 
         // This means the profile already exists, so we can update it instead
         const { error: updateError } = await supabaseAdmin
            .from('alumni_profiles')
            .update({ program, graduation_year: parseInt(graduationYear, 10) })
            .eq('id', userId);
        if (updateError) throw updateError; // Throw if update fails
      } else {
        throw error; // Throw other errors
      }
    }

    return new NextResponse(JSON.stringify({ success: true, profile: data }), { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}