'use client'

import { useState, useEffect } from 'react'
import { User } from '../lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      // Call Laravel API to verify token and get user data
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        localStorage.setItem('current_user_data', JSON.stringify(userData))
        setUser(userData)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token')
        localStorage.removeItem('current_user_data')
        setUser(null)
      }

      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user_data')
      setUser(null)
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Call Laravel API for authentication
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials')
      }

      // Store authentication token and user data
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('current_user_data', JSON.stringify(data.user))
      setUser(data.user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Call Laravel API to logout (invalidate token)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      }

      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user_data')
      setUser(null)
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user_data')
      setUser(null)
    }
  }

  return { user, loading, login, logout, checkAuth }
}