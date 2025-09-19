'use client'

import ThemeToggle from '../../components/ThemeToggle'
import GlobalPageNavigation from '../../components/GlobalPageNavigation'

export default function ProfilePicturePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border dark:border-gray-600">
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Theme</div>
        <ThemeToggle />
      </div>

      {/* Multi Dropdown Navigation */}

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Profile: Profile Picture</h1>

          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 flex items-center justify-center">
                <span className="text-4xl text-gray-400 dark:text-gray-500">👤</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors mb-2">
                Upload New Picture
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Remove Picture
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Display Preferences</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Show profile picture in navigation</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Display picture in team directory</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Allow picture in exported reports</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h2 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">Image Guidelines</h2>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Maximum file size: 5MB</li>
                  <li>• Recommended size: 400x400 pixels</li>
                  <li>• Supported formats: JPG, PNG, GIF</li>
                  <li>• Keep it professional</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Page Navigation */}
      <GlobalPageNavigation />
    </div>
  )
}