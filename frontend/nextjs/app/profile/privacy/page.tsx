'use client'

import ThemeToggle from '../../components/ThemeToggle'
import GlobalPageNavigation from '../../components/GlobalPageNavigation'

export default function ProfilePrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Profile: Privacy Settings</h1>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Visibility Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Visibility</label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option>Public - Visible to everyone</option>
                    <option>Team Only - Visible to team members</option>
                    <option>Private - Only visible to me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-700 dark:text-gray-300">Show email address</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">Show phone number</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-700 dark:text-gray-300">Show department</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Activity Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">Show my activity in team feed</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Allow others to see when I'm online</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">Include me in team statistics</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">Data Export & Deletion</h2>
              <div className="space-y-3">
                <button className="px-4 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors">
                  Export My Data
                </button>
                <button className="px-4 py-2 border border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors ml-3">
                  Delete Account
                </button>
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