"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Theater } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Mock authentication
    if (email === "admin@dellarte.edu" && password === "admin123") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "1",
          email,
          role: "admin",
          firstName: "Admin",
          lastName: "User",
        }),
      )
      router.push("/alumni/map")
    } else if (email === "alumni@dellarte.edu" && password === "alumni123") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "2",
          email,
          role: "alumni",
          firstName: "John",
          lastName: "Doe",
        }),
      )
      router.push("/alumni/map")
    } else if (email && password) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "3",
          email,
          role: "alumni",
          firstName: "Jane",
          lastName: "Smith",
        }),
      )
      router.push("/alumni/map")
    } else {
      setError("Please enter valid credentials")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Theater className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Dell'Arte Alumni</CardTitle>
          <CardDescription>Sign in to access your alumni network</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent mb-2"
                onClick={() => {
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: "demo",
                      email: "demo@dellarte.edu",
                      role: "alumni",
                      firstName: "Demo",
                      lastName: "User",
                    }),
                  )
                  router.push("/alumni/map")
                }}
              >
                Skip Login (Demo)
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: "admin",
                      email: "admin@dellarte.edu",
                      role: "admin",
                      firstName: "Admin",
                      lastName: "User",
                    }),
                  )
                  router.push("/admin/dashboard")
                }}
              >
                Skip to Admin Dashboard
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-red-600 hover:underline">
                Register here
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-600">Admin: admin@dellarte.edu / admin123</p>
            <p className="text-xs text-gray-600">Alumni: alumni@dellarte.edu / alumni123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
