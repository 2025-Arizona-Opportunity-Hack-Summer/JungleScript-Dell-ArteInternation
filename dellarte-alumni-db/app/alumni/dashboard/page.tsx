"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Calendar, Briefcase, Edit, Eye } from "lucide-react"
import Header from "@/components/layout/header"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Stats {
  totalAlumni: number
  countries: number
  recentGraduates: number
  professionalFields: number
}

export default function AlumniDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAlumni: 0,
    countries: 0,
    recentGraduates: 0,
    professionalFields: 0,
  })

  // Add state for recent alumni and loading
  const [recentAlumni, setRecentAlumni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Move all async operations to useEffect
  useEffect(() => {
    async function fetchStats() {
      try {
        // Get total alumni count
        const { count: totalAlumni } = await supabase
          .from("alumni_profiles")
          .select("*", { count: "exact", head: true })

        // Get unique countries
        const { data: countries } = await supabase.from("alumni_profiles").select("country").not("country", "is", null)

        const uniqueCountries = new Set(countries?.map((c) => c.country)).size

        // Get recent graduates (last 2 years)
        const currentYear = new Date().getFullYear()
        const { count: recentGraduates } = await supabase
          .from("alumni_programs")
          .select("*", { count: "exact", head: true })
          .gte("graduation_year", currentYear - 1)

        // Get unique professional tags count
        const { count: professionalFields } = await supabase
          .from("professional_tags")
          .select("*", { count: "exact", head: true })

        setStats({
          totalAlumni: totalAlumni || 0,
          countries: uniqueCountries || 0,
          recentGraduates: recentGraduates || 0,
          professionalFields: professionalFields || 0,
        })

        // Fetch recent alumni for the activity feed
        const { data: recentAlumniData } = await supabase
          .from("alumni_profiles")
          .select(`
          id, first_name, last_name, email, created_at,
          alumni_programs!inner(
            graduation_year,
            programs(name)
          )
        `)
          .order("created_at", { ascending: false })
          .limit(3)

        if (recentAlumniData) {
          const transformedRecentAlumni = recentAlumniData.map((alumni: any) => ({
            id: alumni.id,
            name: `${alumni.first_name} ${alumni.last_name}`,
            email: alumni.email,
            program: alumni.alumni_programs?.[0]?.programs?.name || "Unknown Program",
            graduationYear: alumni.alumni_programs?.[0]?.graduation_year || new Date().getFullYear(),
            status: "active",
            addedDate: new Date(alumni.created_at).toISOString().split("T")[0],
          }))
          setRecentAlumni(transformedRecentAlumni)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Update the stats display to show loading state
  const statsDisplay = [
    {
      title: "Total Alumni",
      value: loading ? "..." : stats.totalAlumni.toString(),
      icon: Users,
      description: "Active members in network",
    },
    {
      title: "Countries",
      value: loading ? "..." : stats.countries.toString(),
      icon: MapPin,
      description: "Alumni locations worldwide",
    },
    {
      title: "Recent Graduates",
      value: loading ? "..." : stats.recentGraduates.toString(),
      icon: Calendar,
      description: "Last 2 years",
    },
    {
      title: "Professional Fields",
      value: loading ? "..." : stats.professionalFields.toString(),
      icon: Briefcase,
      description: "Different career paths",
    },
  ]

  // Replace the recentActivity array with real data from recentAlumni
  const recentActivity =
    recentAlumni.length > 0
      ? [
          {
            type: "new_member",
            message: `${recentAlumni[0]?.name} joined the network`,
            time: "Recently",
          },
          {
            type: "update",
            message: `${recentAlumni.length} alumni profiles in database`,
            time: "Current",
          },
          {
            type: "location",
            message: `Alumni in ${stats.countries} countries worldwide`,
            time: "Global reach",
          },
        ]
      : [
          {
            type: "new_member",
            message: "Alumni profiles loaded from database",
            time: "Recently",
          },
          {
            type: "update",
            message: "Real-time data from Supabase",
            time: "Live",
          },
          {
            type: "location",
            message: "Interactive map with real locations",
            time: "Available",
          },
        ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Dell'Arte Alumni!</h1>
            <p className="mt-2 text-gray-600">Stay connected with your Dell'Arte community</p>
          </div>

          {/* Profile Status Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Alumni Network</span>
                <Link href="/alumni/profile">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Dell'Arte Alumni Database</h3>
                  <p className="text-gray-600">Connect with fellow alumni worldwide</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="secondary">Dell'Arte Community</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    Network visibility: Public
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsDisplay.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-3 rounded-full">
                      <stat.icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/alumni/directory">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Alumni Directory
                  </Button>
                </Link>
                <Link href="/alumni/map">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Alumni Map
                  </Button>
                </Link>
                <Link href="/alumni/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Your Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
