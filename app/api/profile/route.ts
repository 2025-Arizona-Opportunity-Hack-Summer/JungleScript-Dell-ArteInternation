// File: app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET handler to fetch the user's profile
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("alumni_profiles") // Make sure this is your table name
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    // If no profile exists yet, return default info from Clerk
    if (!profile) {
        const user = await currentUser();
        return NextResponse.json({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.emailAddresses[0]?.emailAddress || "",
            // Provide default empty values for the rest
            phone: "",
            address: { city: "", state: "", country: "" },
            programs: [],
            graduationYears: [],
            biography: "",
            currentRole: "",
            currentOrganization: "",
            websiteUrl: "",
            professionalTags: [],
            dellArteRoles: [],
            profileVisibility: "public",
        });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH handler to update the user's profile
export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Note: You may need to map camelCase keys from your frontend
    // state to snake_case keys for your Supabase columns.
    // For simplicity, this example assumes they match or you've handled it.

    const { data, error } = await supabaseAdmin
      .from("alumni_profiles")
      .update(body)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}