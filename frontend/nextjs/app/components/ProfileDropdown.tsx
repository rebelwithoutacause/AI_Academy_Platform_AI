'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileSection {
  name: string
  path: string
}

const profileSections: ProfileSection[] = [
  { name: 'Personal Information', path: '/profile/personal' },
  { name: 'Profile Picture', path: '/profile/picture' },
  { name: 'Privacy Settings', path: '/profile/privacy' }
]

export default function ProfileDropdown() {
  // Disabled - using MultiDropdownNavigation instead to avoid conflicts
  return null
}