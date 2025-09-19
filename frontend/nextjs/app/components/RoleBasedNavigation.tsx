'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { User } from '../lib/types'

interface NavigationProps {
  user: User | null
  onLogout: () => void
}

const menuItems = {
  owner: [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Admin Panel', path: '/admin', icon: '👑' },
    { name: 'Tool List', path: '/tools', icon: '🛠️' },
    { name: 'Add Tool', path: '/tools/add', icon: '➕' },
    { name: 'User Profile', path: '/profile/personal', icon: '👤' }
  ],
  frontend: [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Tool List', path: '/tools', icon: '🛠️' },
    { name: 'Add Tool', path: '/tools/add', icon: '➕' },
    { name: 'User Profile', path: '/profile/personal', icon: '👤' }
  ],
  backend: [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Tool List', path: '/tools', icon: '🛠️' },
    { name: 'Add Tool', path: '/tools/add', icon: '➕' },
    { name: 'User Profile', path: '/profile/personal', icon: '👤' }
  ],
  pm: [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Tool List', path: '/tools', icon: '🛠️' },
    { name: 'User Profile', path: '/profile/personal', icon: '👤' },
    { name: 'Reports', path: '/reports/summary', icon: '📈' }
  ],
  qa: [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Tool List', path: '/tools', icon: '🛠️' },
    { name: 'User Profile', path: '/profile/personal', icon: '👤' }
  ],
  designer: [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Tool List', path: '/tools', icon: '🛠️' },
    { name: 'Add Tool', path: '/tools/add', icon: '➕' },
    { name: 'User Profile', path: '/profile/personal', icon: '👤' }
  ]
}

export default function RoleBasedNavigation({ user, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false)
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false)
  const [profileButtonPosition, setProfileButtonPosition] = useState({ top: 0, left: 0 })
  const [settingsButtonPosition, setSettingsButtonPosition] = useState({ top: 0, left: 0 })
  const [reportsButtonPosition, setReportsButtonPosition] = useState({ top: 0, left: 0 })
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const reportsButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setProfileDropdownOpen(false)
        setSettingsDropdownOpen(false)
        setReportsDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const isActivePath = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      frontend: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      backend: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      pm: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      qa: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      designer: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    }
    return colors[role as keyof typeof colors] || colors.qa
  }

  const updateButtonPosition = (buttonRef: React.RefObject<HTMLButtonElement>, setPosition: (pos: { top: number, left: number }) => void) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
  }


  // Don't render navbar if no user is authenticated
  if (!user) {
    return null
  }

  return (
    <>
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors sticky top-0 z-[60]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 overflow-hidden">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Tools Platform
              </span>
            </div>
          </div>

          {/* Centered Main Navigation */}
          <div className="flex-1 flex justify-center items-center">
            {user && (
              <div className="hidden md:flex md:space-x-4">
                <Link
                  href="/"
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm border ${
                    isActivePath('/')
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                  }`}
                >
                  <span className="mr-2">📊</span>
                  Dashboard
                </Link>
{user.role === 'owner' && (
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm border ${
                      isActivePath('/admin')
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                    }`}
                  >
                    <span className="mr-2">👑</span>
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/tools"
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm border ${
                    isActivePath('/tools')
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                  }`}
                >
                  <span className="mr-2">🛠️</span>
                  Tools
                </Link>
                <div className="relative dropdown-container">
                  <button
                    ref={profileButtonRef}
                    type="button"
                    onClick={() => {
                      console.log('Profile clicked, current:', profileDropdownOpen)
                      updateButtonPosition(profileButtonRef, setProfileButtonPosition)
                      setProfileDropdownOpen(!profileDropdownOpen)
                    }}
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm border ${
                      isActivePath('/profile')
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                    }`}
                  >
                    <span className="mr-2">👤</span>
                    Profile
                  </button>
                </div>
                <div className="relative dropdown-container">
                  <button
                    ref={settingsButtonRef}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Settings clicked, current:', settingsDropdownOpen)
                      updateButtonPosition(settingsButtonRef, setSettingsButtonPosition)
                      setSettingsDropdownOpen(!settingsDropdownOpen)
                    }}
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm border ${
                      isActivePath('/settings')
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                    }`}
                  >
                    <span className="mr-2">⚙️</span>
                    Settings
                  </button>
                </div>
                <div className="relative dropdown-container">
                  <button
                    ref={reportsButtonRef}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Reports clicked, current:', reportsDropdownOpen)
                      updateButtonPosition(reportsButtonRef, setReportsButtonPosition)
                      setReportsDropdownOpen(!reportsDropdownOpen)
                    }}
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm border ${
                      isActivePath('/reports')
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                    }`}
                  >
                    <span className="mr-2">📈</span>
                    Reports
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Info and Mobile Menu Button */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <>
                {/* Theme Toggle */}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>

                {/* User Info */}
                <div className="hidden sm:flex sm:items-center sm:space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role_display}
                  </span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <button
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? (
                      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle for non-logged users */}
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Please login to access the platform
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm border ${
                  isActivePath('/')
                    ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                }`}
              >
                <span className="mr-3">📊</span>
                Dashboard
              </Link>
{user.role === 'owner' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm border ${
                    isActivePath('/admin')
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                  }`}
                >
                  <span className="mr-3">👑</span>
                  Admin Panel
                </Link>
              )}
              <Link
                href="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm border ${
                  isActivePath('/tools')
                    ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                }`}
              >
                <span className="mr-3">🛠️</span>
                Tool List
              </Link>
              <Link
                href="/profile/personal"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm border ${
                  isActivePath('/profile')
                    ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                }`}
              >
                <span className="mr-3">👤</span>
                Profile
              </Link>
              <Link
                href="/settings/general"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm border ${
                  isActivePath('/settings')
                    ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                }`}
              >
                <span className="mr-3">⚙️</span>
                Settings
              </Link>
              <Link
                href="/reports/summary"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm border ${
                  isActivePath('/reports')
                    ? 'bg-blue-600 text-white border-blue-700 shadow-lg hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md font-semibold'
                }`}
              >
                <span className="mr-3">📈</span>
                Reports
              </Link>


              {/* Mobile User Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role_display}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    {/* Portal-based dropdowns */}
    {profileDropdownOpen && typeof window !== 'undefined' && createPortal(
      <div
        className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-600 z-[99999]"
        style={{
          top: profileButtonPosition.top + 4,
          left: profileButtonPosition.left,
          zIndex: 99999
        }}
      >
        <Link
          href="/profile/personal"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setProfileDropdownOpen(false)}
        >
          <span className="mr-2">👤</span>
          Personal Info
        </Link>
      </div>,
      document.body
    )}
    {settingsDropdownOpen && typeof window !== 'undefined' && createPortal(
      <div
        className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-600 z-[99999]"
        style={{
          top: settingsButtonPosition.top + 4,
          left: settingsButtonPosition.left,
          zIndex: 99999
        }}
      >
        <Link
          href="/settings/general"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
          onClick={() => setSettingsDropdownOpen(false)}
        >
          <span className="mr-2">🔧</span>
          General Settings
        </Link>
        <Link
          href="/settings/notifications"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
          onClick={() => setSettingsDropdownOpen(false)}
        >
          <span className="mr-2">🔔</span>
          Notifications
        </Link>
      </div>,
      document.body
    )}
    {reportsDropdownOpen && typeof window !== 'undefined' && createPortal(
      <div
        className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-600 z-[99999]"
        style={{
          top: reportsButtonPosition.top + 4,
          left: reportsButtonPosition.left,
          zIndex: 99999
        }}
      >
        <Link
          href="/reports/summary"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
          onClick={() => setReportsDropdownOpen(false)}
        >
          <span className="mr-2">📊</span>
          Summary Report
        </Link>
        <Link
          href="/reports/analytics"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
          onClick={() => setReportsDropdownOpen(false)}
        >
          <span className="mr-2">📈</span>
          Analytics
        </Link>
      </div>,
      document.body
    )}
    </>
  )
}