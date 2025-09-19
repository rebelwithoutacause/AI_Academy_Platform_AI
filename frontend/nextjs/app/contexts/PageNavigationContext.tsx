'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PageInfo {
  name: string
  path: string
  isSubsection?: boolean
  parentPath?: string
}

interface PageNavigationContextType {
  currentPageIndex: number
  currentPage: PageInfo
  totalPages: number
  navigateToPrevious: () => void
  navigateToNext: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

const pages: PageInfo[] = [
  { name: 'Dashboard', path: '/' },
  { name: 'AI Tools', path: '/tools' }
]

// Profile subsections (handled separately via dropdown)
const profilePages: PageInfo[] = [
  { name: 'Profile: Personal Information', path: '/profile/personal', isSubsection: true, parentPath: '/profile' },
  { name: 'Profile: Profile Picture', path: '/profile/picture', isSubsection: true, parentPath: '/profile' },
  { name: 'Profile: Privacy Settings', path: '/profile/privacy', isSubsection: true, parentPath: '/profile' }
]

const PageNavigationContext = createContext<PageNavigationContextType | undefined>(undefined)

export function PageNavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  // Update current page index based on pathname
  useEffect(() => {
    const pageIndex = pages.findIndex(page => page.path === pathname)

    // For profile subsections, don't update the main navigation index
    // They are handled separately via dropdown
    const isProfileSubsection = profilePages.some(page => page.path === pathname)

    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex)
    } else if (!isProfileSubsection) {
      // If not a profile subsection and no match found, stay on current page
      // This prevents navigation issues when on profile pages
    }
  }, [pathname])

  const navigateToPrevious = () => {
    if (currentPageIndex > 0) {
      const previousPage = pages[currentPageIndex - 1]
      router.push(previousPage.path)
    }
  }

  const navigateToNext = () => {
    if (currentPageIndex < pages.length - 1) {
      const nextPage = pages[currentPageIndex + 1]
      router.push(nextPage.path)
    }
  }

  const canGoNext = currentPageIndex < pages.length - 1
  const canGoPrevious = currentPageIndex > 0

  return (
    <PageNavigationContext.Provider value={{
      currentPageIndex,
      currentPage: pages[currentPageIndex],
      totalPages: pages.length,
      navigateToPrevious,
      navigateToNext,
      canGoNext,
      canGoPrevious
    }}>
      {children}
    </PageNavigationContext.Provider>
  )
}

export function usePageNavigation() {
  const context = useContext(PageNavigationContext)
  if (context === undefined) {
    throw new Error('usePageNavigation must be used within a PageNavigationProvider')
  }
  return context
}