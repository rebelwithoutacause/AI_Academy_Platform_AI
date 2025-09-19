'use client'

import ThemeToggle from '../../components/ThemeToggle'
import GlobalPageNavigation from '../../components/GlobalPageNavigation'

export default function ReportsSummaryPage() {
  const handleExportSummary = () => {
    // Create mock summary data
    const summaryData = {
      report_type: 'Summary Report',
      generated_at: new Date().toISOString(),
      total_tools: 24,
      active_users: 157,
      usage_hours: 1247,
      monthly_growth: 3,
      weekly_user_growth: 12,
      weekly_usage_growth: 89,
      recent_activity: [
        { activity: 'New tool "Code Generator" added', timestamp: '2 hours ago' },
        { activity: 'User John updated profile', timestamp: '5 hours ago' },
        { activity: 'Weekly report generated', timestamp: '1 day ago' }
      ]
    }

    // Convert to CSV format
    const csvContent = [
      'Report Type,Generated At,Total Tools,Active Users,Usage Hours,Monthly Growth,Weekly User Growth,Weekly Usage Growth',
      `"${summaryData.report_type}","${summaryData.generated_at}",${summaryData.total_tools},${summaryData.active_users},${summaryData.usage_hours},${summaryData.monthly_growth},${summaryData.weekly_user_growth},${summaryData.weekly_usage_growth}`,
      '',
      'Recent Activity,Timestamp',
      ...summaryData.recent_activity.map(item => `"${item.activity}","${item.timestamp}"`)
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `summary-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRefreshData = () => {
    // Mock refresh functionality
    alert('Data refreshed successfully!')
    window.location.reload()
  }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Reports: Summary</h1>

          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h3 className="text-lg font-semibent text-blue-900 dark:text-blue-100">Total Tools</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">24</p>
                <p className="text-sm text-blue-700 dark:text-blue-200">+3 this month</p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <h3 className="text-lg font-semibent text-green-900 dark:text-green-100">Active Users</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-300">157</p>
                <p className="text-sm text-green-700 dark:text-green-200">+12 this week</p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <h3 className="text-lg font-semibent text-purple-900 dark:text-purple-100">Usage Hours</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">1,247</p>
                <p className="text-sm text-purple-700 dark:text-purple-200">+89 this week</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">New tool "Code Generator" added</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">User John updated profile</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Weekly report generated</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleExportSummary}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Export Summary
              </button>
              <button
                onClick={handleRefreshData}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                Refresh Data
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