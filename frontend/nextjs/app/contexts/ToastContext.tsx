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

const ToastContext = createContext<ToastContextType | undefined>(undefined)

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
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      clearAllToasts
    }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)

  if (!context) {
    // Safe fallback implementation - never throws
    console.warn('[SAFE TOAST] Context not found, using fallback implementation')
    return {
      toasts: [],
      addToast: (message: string, type: ToastType = 'success', duration?: number) => {
        console.log(`[SAFE TOAST ${type.toUpperCase()}]: ${message}`)
        return `safe-toast-${Date.now()}`
      },
      removeToast: (id: string) => {
        console.log(`[SAFE TOAST] Removed: ${id}`)
      },
      clearAllToasts: () => {
        console.log('[SAFE TOAST] All cleared')
      }
    }
  }

  return context
}

// Cache breaker comment: Updated at 2025-09-17T06:16:50.000Z