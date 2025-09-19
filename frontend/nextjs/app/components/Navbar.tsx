'use client'

import Link from 'next/link'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface NavbarProps {
  user: User | null
  onLogout: () => void
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Tools Platform
              </span>
            </div>

            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/tools" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Tools
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Welcome, </span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Please login to access the platform
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}