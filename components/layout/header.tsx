"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { UserButton, useUser, UserProfile } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Theater, LayoutDashboard, Users, Mail, Upload, Map, UserCircle, Menu, Settings } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@clerk/nextjs"

export default function Header() {
  const { user, isLoaded } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as string | undefined
      setIsAdmin(userRole === "admin")
    }
  }, [isLoaded, user])

  if (!isLoaded) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-200 p-2 rounded-md">
            <Theater className="h-6 w-6 text-gray-400" />
          </div>
          <span className="font-semibold">Dell'Arte Alumni</span>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </header>
    )
  }

  if (!user) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <div className="bg-red-600 p-2 rounded-md">
              <Theater className="h-6 w-6 text-white" />
            </div>
            <span className="ml-2 font-semibold">Dell'Arte Alumni</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-red-600 hover:bg-red-700">Sign Up</Button>
          </Link>
        </div>
      </header>
    )
  }

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/alumni", label: "Alumni", icon: Users },
    { href: "/admin/communications", label: "Communications", icon: Mail },
    { href: "/admin/import", label: "Import", icon: Upload },
    { href: "/map", label: "Map", icon: Map },
  ]

  const alumniNavItems = [
    { href: "/map", label: "Map", icon: Map },
    { href: "/alumni/profile", label: "My Profile", icon: UserCircle },
  ]

  const navItems = isAdmin ? adminNavItems : alumniNavItems

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Link href={isAdmin ? "/admin/dashboard" : "/map"} className="flex items-center">
            <div className="bg-red-600 p-2 rounded-md">
              <Theater className="h-6 w-6 text-white" />
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-2">
          {isAdmin &&
            adminNavItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-4 p-4">
                {isAdmin &&
                  adminNavItems.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <Button variant="ghost" className="w-full justify-start space-x-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <UserCircle className="h-8 w-8" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.primaryEmailAddress?.toString()}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/alumni/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton>
              <DropdownMenuItem>
                <span>Sign out</span>
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
