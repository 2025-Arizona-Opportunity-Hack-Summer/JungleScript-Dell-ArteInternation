"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, MapPin, Calendar, TrendingUp, Database, Plus, Edit } from "lucide-react"
import Header from "@/components/layout/header"
import Link from "next/link"

interface User {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
}

export default function AdminDashboard() {
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
      change: "+12",
      changeType: "increase",
      icon: Users,
      description: "Active alumni profiles",
    },
    {
      title: "New This Month",
      value: "23",
      change: "+5",
      changeType: "increase",
      icon: UserPlus,
      description: "Recently added alumni",
    },
    {
      title: "Countries",
      value: "23",
      change: "+2",
      changeType: "increase",
      icon: MapPin,
      description: "Global reach",
    },
    {
      title: "Graduation Years",
      value: "45",
      change: "0",
      changeType: "neutral",
      icon: Calendar,
      description: "Years represented",
    },
  ]

  const recentAlumni = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      program: "MFA Physical Theatre",
      graduationYear: 2024,
      status: "pending",
      addedDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      program: "Summer Intensive",
      graduationYear: 2023,
      status: "active",
      addedDate: "2024-01-14",
    },
    {
      id: "3",
      name: "Elena Rodriguez",
      email: "elena.rodriguez@email.com",
      program: "Professional Training",
      graduationYear: 2024,
      status: "active",
      addedDate: "2024-01-13",
    },
  ]

  const programStats = [
    { name: "MFA Physical Theatre", count: 456, percentage: 37 },
    { name: "Summer Intensive", count: 312, percentage: 25 },
    { name: "Professional Training", count: 234, percentage: 19 },
    { name: "International Summer", count: 156, percentage: 12 },
    { name: "Pedagogy Program", count: 89, percentage: 7 },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage Dell'Arte alumni database and community</p>
            </div>
            <Link href="/admin/alumni/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Alumni
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <stat.icon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  {stat.change !== "0" && (
                    <div className="mt-2 flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change} this month</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Alumni */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Alumni</CardTitle>
                  <CardDescription>Latest additions to the database</CardDescription>
                </div>
                <Link href="/admin/alumni">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlumni.map((alumni) => (
                    <div key={alumni.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alumni.name}</h4>
                        <p className="text-sm text-gray-600">{alumni.email}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {alumni.program}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Class of {alumni.graduationYear}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={alumni.status === "active" ? "default" : "secondary"} className="text-xs">
                          {alumni.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Program Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Program Distribution</CardTitle>
                <CardDescription>Alumni by program type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programStats.map((program) => (
                    <div key={program.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{program.name}</span>
                        <span className="text-sm text-gray-600">{program.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${program.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/alumni/new">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <UserPlus className="h-5 w-5 mb-2" />
                      <div className="font-medium">Add Alumni</div>
                      <div className="text-xs text-gray-500">Create new profile</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin/alumni">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <Database className="h-5 w-5 mb-2" />
                      <div className="font-medium">Manage Alumni</div>
                      <div className="text-xs text-gray-500">Edit existing profiles</div>
                    </div>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <TrendingUp className="h-5 w-5 mb-2" />
                    <div className="font-medium">Export Data</div>
                    <div className="text-xs text-gray-500">Download reports</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <MapPin className="h-5 w-5 mb-2" />
                    <div className="font-medium">View Map</div>
                    <div className="text-xs text-gray-500">Geographic overview</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
