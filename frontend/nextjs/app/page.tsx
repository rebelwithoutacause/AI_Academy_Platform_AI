'use client'

import { useState, useEffect } from 'react'
import RoleBasedNavigation from './components/RoleBasedNavigation'
import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import GlobalPageNavigation from './components/GlobalPageNavigation'
import { useAuth } from './hooks/useAuth'

export default function Home() {
  const { user, loading, login, logout } = useAuth()


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Explicitly check if user is null or undefined
  const isAuthenticated = user !== null && user !== undefined

  return (
    <main>
      {isAuthenticated ? (
        <>
          <RoleBasedNavigation user={user} onLogout={logout} />
          <div className="container mx-auto px-4 py-8">
            <Dashboard user={user} />
          </div>
          <GlobalPageNavigation />
        </>
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <LoginForm onLogin={login} />
          </div>
        </div>
      )}
    </main>
  )
}