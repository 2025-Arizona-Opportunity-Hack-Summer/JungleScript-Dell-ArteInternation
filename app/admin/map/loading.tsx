import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/layout/header"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar skeleton */}
        <div className="w-full md:w-1/3 md:max-w-md bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="p-4">
            <Skeleton className="h-4 w-32 mb-4" />

            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Map skeleton */}
        <div className="flex-1 relative">
          <Skeleton className="absolute inset-0" />
        </div>
      </main>
    </div>
  )
}
