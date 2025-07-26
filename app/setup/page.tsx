"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Play, ExternalLink } from "lucide-react"
import Header from "@/components/layout/header"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"

export default function SetupPage() {
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [tableStatus, setTableStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const createTable = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setTableStatus("error")
      setErrorMessage("Supabase is not configured. Please check your environment variables.")
      return
    }

    setIsCreatingTable(true)
    setTableStatus("idle")
    setErrorMessage("")

    try {
      // First, check if table exists
      const { data: tables, error: tablesError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "alumni")

      if (tablesError) {
        console.error("Error checking tables:", tablesError)
      }

      // Create the table using raw SQL
      const createTableSQL = `
        -- Create the alumni table with proper structure
        CREATE TABLE IF NOT EXISTS alumni (
          id BIGSERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address JSONB NOT NULL DEFAULT '{}',
          programs_attended JSONB NOT NULL DEFAULT '[]',
          biography TEXT,
          current_work JSONB NOT NULL DEFAULT '{}',
          tags TEXT[] NOT NULL DEFAULT '{}',
          languages_spoken TEXT[] NOT NULL DEFAULT '{}',
          professional_achievements TEXT[] NOT NULL DEFAULT '{}',
          portfolio_links JSONB NOT NULL DEFAULT '{}',
          experiences_at_dellarte TEXT[] NOT NULL DEFAULT '{}',
          referrals TEXT[] NOT NULL DEFAULT '{}',
          last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
          profile_privacy TEXT NOT NULL DEFAULT 'public' CHECK (profile_privacy IN ('public', 'private', 'alumni-only')),
          donation_history JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_alumni_last_name ON alumni(last_name);
        CREATE INDEX IF NOT EXISTS idx_alumni_email ON alumni(email);
        CREATE INDEX IF NOT EXISTS idx_alumni_tags ON alumni USING GIN(tags);

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON alumni
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `

      const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (createError) {
        // Try alternative method using direct query
        const { error: altError } = await supabase.from("alumni").select("id").limit(1)

        if (altError && altError.code === "42P01") {
          // Table doesn't exist, we need to create it manually
          throw new Error("Table creation failed. Please run the SQL script manually in your Supabase dashboard.")
        }
      }

      // Insert sample data
      const sampleData = [
        {
          first_name: "Maria",
          last_name: "Rodriguez",
          email: "maria.rodriguez@email.com",
          phone: "+1-555-0123",
          address: {
            street: "123 Theatre St",
            city: "San Francisco",
            state: "CA",
            zipCode: "94102",
            country: "USA",
            latitude: 37.7749,
            longitude: -122.4194,
          },
          programs_attended: [
            {
              program: "MFA in Ensemble Based Physical Theatre",
              cohort: "2018-2020",
              graduationYear: 2020,
            },
          ],
          biography:
            "Maria is a passionate physical theatre artist who combines traditional commedia dell'arte with contemporary social issues.",
          current_work: {
            title: "Artistic Director",
            organization: "Teatro Nuevo",
            location: "San Francisco, CA",
          },
          tags: ["directing", "commedia dell'arte", "bilingual theatre"],
          languages_spoken: ["English", "Spanish"],
          professional_achievements: ["Founded Teatro Nuevo (2021)", "SF Arts Commission Grant Recipient (2022)"],
          portfolio_links: {
            website: "teatronuevo.org",
            instagram: "@teatronuevo",
          },
          experiences_at_dellarte: ["Commedia Intensive", "Mask Making Workshop"],
          referrals: [],
          profile_privacy: "public",
          donation_history: [],
        },
        {
          first_name: "James",
          last_name: "Chen",
          email: "james.chen@email.com",
          phone: "+1-555-0124",
          address: {
            street: "456 Performance Ave",
            city: "Portland",
            state: "OR",
            zipCode: "97201",
            country: "USA",
            latitude: 45.5152,
            longitude: -122.6784,
          },
          programs_attended: [
            {
              program: "Professional Training Program",
              cohort: "2019",
              graduationYear: 2019,
            },
          ],
          biography:
            "James specializes in mask work and has developed innovative techniques for integrating technology with traditional mask performance.",
          current_work: {
            title: "Mask Artist & Educator",
            organization: "Pacific Theatre Collective",
            location: "Portland, OR",
          },
          tags: ["mask making", "technology integration", "teaching"],
          languages_spoken: ["English", "Mandarin"],
          professional_achievements: ["TEDx Speaker on Digital Masks (2023)", "Oregon Arts Fellowship (2022)"],
          portfolio_links: {
            website: "jameschen-masks.com",
            linkedin: "james-chen-theatre",
          },
          experiences_at_dellarte: ["Advanced Mask Techniques", "Teaching Methodology"],
          referrals: [],
          profile_privacy: "public",
          donation_history: [],
        },
      ]

      // Insert sample data with conflict handling
      const { error: insertError } = await supabase.from("alumni").upsert(sampleData, { onConflict: "email" })

      if (insertError) {
        console.error("Insert error:", insertError)
        // Don't fail if insert fails - table creation is more important
      }

      setTableStatus("success")
    } catch (error) {
      console.error("Setup error:", error)
      setTableStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsCreatingTable(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Database Setup</h1>
            <p className="mt-2 text-gray-600">Set up your Supabase database for the Dell'Arte Alumni system</p>
          </div>

          {/* Configuration Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Configuration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {isSupabaseConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={isSupabaseConfigured ? "text-green-700" : "text-red-700"}>
                    Supabase Configuration: {isSupabaseConfigured ? "✓ Configured" : "✗ Missing"}
                  </span>
                </div>

                {!isSupabaseConfigured && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please set the following environment variables:
                      <ul className="mt-2 list-disc list-inside">
                        <li>NEXT_PUBLIC_SUPABASE_URL</li>
                        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Option 1: Automatic Setup (Recommended)</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to automatically create the alumni table and insert sample data.
                </p>
                <Button
                  onClick={createTable}
                  disabled={!isSupabaseConfigured || isCreatingTable}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isCreatingTable ? "Setting up..." : "Create Alumni Table"}
                </Button>

                {tableStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                      ✅ Database setup completed successfully! You can now use the alumni management system.
                    </AlertDescription>
                  </Alert>
                )}

                {tableStatus === "error" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">❌ Setup failed: {errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">Option 2: Manual Setup</h3>
                <p className="text-sm text-gray-600">
                  If automatic setup fails, you can manually run the SQL script in your Supabase dashboard.
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Supabase Dashboard
                    </a>
                  </Button>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-sm font-mono">
                    1. Go to your Supabase project dashboard
                    <br />
                    2. Navigate to SQL Editor
                    <br />
                    3. Copy and paste the SQL from scripts/create-alumni-table.sql
                    <br />
                    4. Run the script
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">After setting up the database, you can:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>
                    Visit the{" "}
                    <a href="/admin/alumni" className="text-red-600 hover:underline">
                      Alumni Management
                    </a>{" "}
                    page
                  </li>
                  <li>Add, edit, and delete alumni profiles</li>
                  <li>View alumni on the interactive map</li>
                  <li>Import bulk alumni data</li>
                  <li>Send communications to alumni groups</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
