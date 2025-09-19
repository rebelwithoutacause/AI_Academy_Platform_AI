'use client'

import { useTheme } from '../contexts/ThemeContext'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200 dark:bg-gray-600"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Switch */}
      <span
        className={`inline-block w-5 h-5 transform transition-transform duration-200 rounded-full bg-white shadow-lg ${
          theme === 'dark' ? 'translate-x-3' : '-translate-x-3'
        }`}
      />

      {/* Icons */}
      <span className="absolute left-1 text-xs">
        {theme === 'light' ? '☀️' : '🌙'}
      </span>
      <span className="absolute right-1 text-xs">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  )
}

// Alternative button style with text labels
export function ThemeToggleWithText() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
        <div className="px-3 py-1 bg-gray-200 rounded-md animate-pulse h-7 w-16"></div>
        <div className="px-3 py-1 bg-gray-200 rounded-md animate-pulse h-7 w-16"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          theme === 'light'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-gray-800 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        🌙 Dark
      </button>
    </div>
  )
}