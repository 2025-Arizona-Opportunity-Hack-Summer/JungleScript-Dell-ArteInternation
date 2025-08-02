import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local")
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    logger.api.error("webhooks/clerk", "Error verifying webhook", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  // webhook operations require admin privileges for user creation

  if (eventType === "user.created") {
    const { email_addresses, first_name, last_name, id: clerk_id } = evt.data
    const email = email_addresses[0].email_address

    // Check if user already exists in Supabase
    const { data: existingAlumni, error: selectError } = await supabaseAdmin
      .from("alumni")
      .select("id")
      .eq("email", email)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116: 'No rows found' - this is not an error in our case
      logger.api.error("webhooks/clerk", "Error checking for existing user", selectError)
      return new Response("Error checking for existing user", { status: 500 })
    }

    if (existingAlumni) {
      // User with this email already exists, link the new Clerk ID
      const { error: updateError } = await supabaseAdmin
        .from("alumni")
        .update({ clerkUserId: clerk_id })
        .eq("id", existingAlumni.id)

      if (updateError) {
        logger.api.error("webhooks/clerk", "Error linking Clerk ID to existing user", updateError)
        return new Response("Error linking user", { status: 500 })
      }
    } else {
      // User does not exist, create a new alumni record
      const { error: insertError } = await supabaseAdmin.from("alumni").insert([
        {
          clerkUserId: clerk_id,
          firstName: first_name,
          lastName: last_name,
          email: email,
        },
      ])

      if (insertError) {
        logger.api.error("webhooks/clerk", "Error creating new alumni record", insertError)
        return new Response("Error creating user", { status: 500 })
      }
    }
  }

  return new Response("", { status: 200 })
} 