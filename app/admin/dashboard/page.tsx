"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Mail, Upload, TrendingUp } from "lucide-react"
import Header from "@/components/layout/header"
import Link from "next/link"

// Mock data - in real implementation this would come from Supabase
const mockStats = {
  totalAlumni: 247,
  newAlumniLast30Days: 12,
  activeUsers: 189,
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
  }: {
    title: string
    value: number | string
    description: string
    icon: any
    trend?: string
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{loading ? "..." : value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center pt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Overview of the Dell'Arte Alumni Network</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard
              title="Total Alumni"
              value={stats.totalAlumni}
              description="Registered in the network"
              icon={Users}
              trend="+2.5% from last month"
            />
            <StatCard
              title="New Alumni (30 Days)"
              value={stats.newAlumniLast30Days}
              description="Recently joined"
              icon={UserPlus}
              trend="+12 this month"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              description="Logged in last 90 days"
              icon={TrendingUp}
              trend="76% of total alumni"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-64">
              <Link href="/admin/alumni" className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-red-200">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-700 transition-colors">
                      <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Add New Alumni</h3>
                    <p className="text-gray-600 text-sm">Create new alumni profiles and manage existing ones</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/communications" className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Send Bulk Email</h3>
                    <p className="text-gray-600 text-sm">Communicate with alumni through targeted email campaigns</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/import" className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-green-200">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-700 transition-colors">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Data</h3>
                    <p className="text-gray-600 text-sm">Bulk upload alumni data from JSON files</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
