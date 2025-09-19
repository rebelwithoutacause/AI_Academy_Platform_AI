'use client'

import { useToast } from '../contexts/ToastContext'

export default function ToastDemo() {
  const { addToast, clearAllToasts } = useToast()

  const showSuccessToast = () => {
    addToast('Operation completed successfully!', 'success')
  }

  const showErrorToast = () => {
    addToast('Something went wrong. Please try again.', 'error')
  }

  const showWarningToast = () => {
    addToast('Please review your input before proceeding.', 'warning')
  }

  const showInfoToast = () => {
    addToast('New features are available in this update.', 'info')
  }

  const showToastWithAction = () => {
    addToast(
      'File uploaded successfully',
      'success',
      0, // Don't auto-dismiss
      {
        label: 'View File',
        onClick: () => {
          addToast('Opening file viewer...', 'info')
        }
      }
    )
  }

  const showMultipleToasts = () => {
    addToast('First notification', 'info')
    setTimeout(() => addToast('Second notification', 'success'), 500)
    setTimeout(() => addToast('Third notification', 'warning'), 1000)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="mr-2">🔔</span>
        Toast Notifications Demo
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
        >
          Show Success
        </button>

        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm"
        >
          Show Error
        </button>

        <button
          onClick={showWarningToast}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors text-sm"
        >
          Show Warning
        </button>

        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
        >
          Show Info
        </button>

        <button
          onClick={showToastWithAction}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors text-sm"
        >
          With Action
        </button>

        <button
          onClick={showMultipleToasts}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors text-sm"
        >
          Multiple
        </button>

        <button
          onClick={clearAllToasts}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm col-span-2"
        >
          Clear All
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Click the buttons above to test different types of toast notifications:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Success toasts appear with a green background</li>
          <li>Error toasts appear with a red background</li>
          <li>Warning toasts appear with a yellow background</li>
          <li>Info toasts appear with a blue background</li>
          <li>Toasts auto-dismiss after 4 seconds (unless they have actions)</li>
          <li>Multiple toasts stack vertically</li>
          <li>Toasts are responsive and adapt to mobile/desktop</li>
        </ul>
      </div>
    </div>
  )
}