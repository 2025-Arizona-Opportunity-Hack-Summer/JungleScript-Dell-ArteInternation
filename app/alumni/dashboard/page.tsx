"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Calendar, Briefcase, Edit, Eye } from "lucide-react"
import Header from "@/components/layout/header"
import Link from "next/link"

interface User {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  graduationYear?: string
  program?: string
}

export default function AlumniDashboard() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const stats = [
    {
      title: "Total Alumni",
      value: "1,247",
      icon: Users,
      description: "Active members in network",
    },
    {
      title: "Countries",
      value: "23",
      icon: MapPin,
      description: "Alumni locations worldwide",
    },
    {
      title: "Recent Graduates",
      value: "45",
      icon: Calendar,
      description: "Class of 2024",
    },
    {
      title: "Professional Fields",
      value: "12",
      icon: Briefcase,
      description: "Different career paths",
    },
  ]

  const recentActivity = [
    {
      type: "new_member",
      message: "Sarah Johnson joined the network",
      time: "2 hours ago",
    },
    {
      type: "update",
      message: "Michael Chen updated their profile",
      time: "5 hours ago",
    },
    {
      type: "location",
      message: "3 new alumni added to the map",
      time: "1 day ago",
    },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
            <p className="mt-2 text-gray-600">Stay connected with your Dell'Arte community</p>
          </div>

          {/* Profile Status Card */}
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
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.program && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="secondary">{user.program}</Badge>
                      {user.graduationYear && <Badge variant="outline">Class of {user.graduationYear}</Badge>}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    Profile visibility: Public
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
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
