'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ClockContextType {
  currentTime: Date
}

const ClockContext = createContext<ClockContextType | undefined>(undefined)

export const useClockContext = () => {
  const context = useContext(ClockContext)
  if (context === undefined) {
    throw new Error('useClockContext must be used within a ClockProvider')
  }
  return context
}

interface ClockProviderProps {
  children: ReactNode
}

export const ClockProvider: React.FC<ClockProviderProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update immediately on mount to sync with current time
    setCurrentTime(new Date())

    // Set up interval to update every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const value = {
    currentTime
  }

  return (
    <ClockContext.Provider value={value}>
      {children}
    </ClockContext.Provider>
  )
}