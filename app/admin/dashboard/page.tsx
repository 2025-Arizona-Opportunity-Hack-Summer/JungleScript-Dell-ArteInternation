"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Upload, TrendingUp, Map as MapIcon } from "lucide-react"

import Link from "next/link"
import { useAlumniStore } from "@/lib/alumni-store"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const { alumni, loading, fetchAlumni } = useAlumniStore()

  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  const totalAlumni = alumni.length
  const newAlumniLast30Days = alumni.filter((a) => {
    if (!a.lastUpdated) return false
    const lastUpdated = new Date(a.lastUpdated)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastUpdated > thirtyDaysAgo
  }).length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const newAlumniThisMonth = alumni.filter((a) => {
    if (!a.lastUpdated) return false
    return new Date(a.lastUpdated) >= startOfMonth
  }).length

  const totalAlumniAtStartOfMonth = totalAlumni - newAlumniThisMonth
  const percentageChange =
    totalAlumniAtStartOfMonth > 0 ? (newAlumniThisMonth / totalAlumniAtStartOfMonth) * 100 : 0

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(now.getDate() - 60)

  const newAlumniPrevious30Days = alumni.filter((a) => {
    if (!a.lastUpdated) return false
    const updatedDate = new Date(a.lastUpdated)
    return updatedDate >= sixtyDaysAgo && updatedDate < thirtyDaysAgo
  }).length

  const thirtyDayTrend = newAlumniLast30Days - newAlumniPrevious30Days

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(now.getDate() - 90)
  const oneEightyDaysAgo = new Date()
  oneEightyDaysAgo.setDate(now.getDate() - 180)

  const activeUsersLast90Days = alumni.filter((a) => {
    if (!a.lastUpdated) return false
    return new Date(a.lastUpdated) >= ninetyDaysAgo
  }).length

  const activeUsersPrevious90Days = alumni.filter((a) => {
    if (!a.lastUpdated) return false
    const updatedDate = new Date(a.lastUpdated)
    return updatedDate >= oneEightyDaysAgo && updatedDate < ninetyDaysAgo
  }).length

  const activeUsersTrend = activeUsersLast90Days - activeUsersPrevious90Days

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
        <CardTitle className="text-xs md:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="text-xl md:text-3xl font-bold">{loading ? "..." : value}</div>
        <p className="hidden md:block text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="hidden md:flex items-center pt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of the Dell'Arte Alumni Network</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-8 mb-8 md:mb-12">
          <StatCard
            title="Total Alumni"
            value={loading ? "..." : totalAlumni}
            description="Registered in the network"
            icon={Users}
            trend={
              percentageChange === 0
                ? "0% from last month"
                : `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}% from last month`
            }
          />
          <StatCard
            title="New Alumni (30 Days)"
            value={loading ? "..." : newAlumniLast30Days}
            description="Recently joined"
            icon={UserPlus}
            trend={
              thirtyDayTrend >= 0
                ? `+${thirtyDayTrend} from previous 30 days`
                : `${thirtyDayTrend} from previous 30 days`
            }
          />
          <StatCard
            title="Active Users"
            value={loading ? "..." : activeUsersLast90Days}
            description="Updated profile in last 90 days"
            icon={TrendingUp}
            trend={
              activeUsersTrend >= 0
                ? `+${activeUsersTrend} from previous 90 days`
                : `${activeUsersTrend} from previous 90 days`
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-8">
            <Link href="/admin/alumni" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary-200">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-2 md:p-8">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mb-2 md:mb-6 group-hover:bg-primary/90 transition-colors">
                    <UserPlus className="h-5 w-5 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Manage Alumni</h3>
                  <p className="hidden md:block text-gray-600 text-xs md:text-sm">Create & manage profiles</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/map" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-blue-200">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-2 md:p-8">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2 md:mb-6 group-hover:bg-blue-700 transition-colors">
  <MapIcon className="h-5 w-5 md:h-8 md:w-8 text-white" />
</div>
                  <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">View Alumni Map</h3>
                  <p className="hidden md:block text-gray-600 text-xs md:text-sm">Explore the alumni network visually</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/import" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-green-200">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-2 md:p-8">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center mb-2 md:mb-6 group-hover:bg-green-700 transition-colors">
                    <Upload className="h-5 w-5 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Import Data</h3>
                  <p className="hidden md:block text-gray-600 text-xs md:text-sm">Bulk upload alumni data</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
