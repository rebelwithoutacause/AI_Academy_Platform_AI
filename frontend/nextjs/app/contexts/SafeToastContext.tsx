'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number, action?: Toast['action']) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const SafeToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((
    message: string,
    type: ToastType = 'success',
    duration: number = 4000,
    action?: Toast['action']
  ): string => {
    const id = `toast-${++toastIdRef.current}`
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      action
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <SafeToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      clearAllToasts
    }}>
      {children}
    </SafeToastContext.Provider>
  )
}

// This hook NEVER throws errors - guaranteed safe implementation
export function useToast(): ToastContextType {
  console.log('SafeToastContext useToast called - this is the NEW implementation')
  const context = useContext(SafeToastContext)

  // SAFE FALLBACK - no errors ever thrown
  if (!context) {
    console.warn('useToast: SafeToastContext not found, using fallback')
    return {
      toasts: [],
      addToast: (message: string, type: ToastType = 'success') => {
        console.log(`[SAFE TOAST ${type.toUpperCase()}]: ${message}`)
        return `fallback-${Date.now()}`
      },
      removeToast: (id: string) => {
        console.log(`Safe toast removed: ${id}`)
      },
      clearAllToasts: () => {
        console.log('All safe toasts cleared')
      }
    }
  }

  return context
}