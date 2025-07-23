"use client"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto p-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-md mb-8 animate-pulse"></div>
        
        <div className="glass-card border-0 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md mb-6 animate-pulse"></div>
          
          <div className="space-y-4 mb-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}