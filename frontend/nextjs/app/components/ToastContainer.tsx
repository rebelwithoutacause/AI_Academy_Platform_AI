'use client'

import React from 'react'
import { useToast, Toast } from '../contexts/ToastContext'

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToast()

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-600 text-white border-green-600 dark:border-green-700'
      case 'error':
        return 'bg-red-500 dark:bg-red-600 text-white border-red-600 dark:border-red-700'
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-600 text-white border-yellow-600 dark:border-yellow-700'
      case 'info':
        return 'bg-blue-500 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-700'
      default:
        return 'bg-gray-500 dark:bg-gray-600 text-white border-gray-600 dark:border-gray-700'
    }
  }

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📝'
    }
  }

  return (
    <div
      className={`
        flex items-center justify-between
        min-w-[300px] max-w-[400px]
        p-4 rounded-lg shadow-lg border-l-4
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right hover:scale-105
        ${getToastStyles(toast.type)}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-lg flex-shrink-0" aria-hidden="true">
          {getToastIcon(toast.type)}
        </span>
        <p className="text-sm font-medium leading-5 break-words">
          {toast.message}
        </p>
      </div>

      <div className="flex items-center space-x-2 ml-3">
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="px-3 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, clearAllToasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <>
      {/* Desktop positioning - bottom right */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 hidden sm:block">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
        {toasts.length > 1 && (
          <div className="flex justify-end mt-2">
            <button
              onClick={clearAllToasts}
              className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Mobile positioning */}
      <div className="fixed bottom-4 left-4 right-4 z-50 space-y-2 sm:hidden">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
        {toasts.length > 1 && (
          <div className="flex justify-center mt-2">
            <button
              onClick={clearAllToasts}
              className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </>
  )
}