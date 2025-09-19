'use client'

import ThemeToggle from '../../components/ThemeToggle'
import GlobalPageNavigation from '../../components/GlobalPageNavigation'

export default function ReportsAnalyticsPage() {
  const handleExportAnalytics = () => {
    // Create mock analytics data
    const analyticsData = {
      report_type: 'Analytics Report',
      generated_at: new Date().toISOString(),
      tool_usage_analytics: {
        most_used_tool: 'AI Assistant (47 uses)',
        peak_usage_time: '2:00 PM - 4:00 PM',
        average_session_duration: '23 minutes'
      },
      user_engagement: {
        daily_active_users: 89,
        feature_adoption: 74,
        user_retention: 92
      },
      performance_metrics: {
        average_load_time: '1.2s',
        error_rate: '0.3%'
      }
    }

    // Convert to CSV format
    const csvContent = [
      'Report Type,Generated At',
      `"${analyticsData.report_type}","${analyticsData.generated_at}"`,
      '',
      'Tool Usage Analytics',
      'Most Used Tool,Peak Usage Time,Average Session Duration',
      `"${analyticsData.tool_usage_analytics.most_used_tool}","${analyticsData.tool_usage_analytics.peak_usage_time}","${analyticsData.tool_usage_analytics.average_session_duration}"`,
      '',
      'User Engagement Metrics',
      'Daily Active Users (%),Feature Adoption (%),User Retention (%)',
      `${analyticsData.user_engagement.daily_active_users},${analyticsData.user_engagement.feature_adoption},${analyticsData.user_engagement.user_retention}`,
      '',
      'Performance Metrics',
      'Average Load Time,Error Rate',
      `"${analyticsData.performance_metrics.average_load_time}","${analyticsData.performance_metrics.error_rate}"`
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGenerateReport = () => {
    // Mock report generation functionality
    alert('Full analytics report generated and downloaded!')
    handleExportAnalytics()
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Reports: Analytics</h1>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">Tool Usage Analytics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Most Used Tool</span>
                  <span className="font-medium text-gray-900 dark:text-white">AI Assistant (47 uses)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Peak Usage Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">2:00 PM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Average Session Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">23 minutes</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">User Engagement</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Daily Active Users</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{width: '89%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Feature Adoption</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">74%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-green-600 dark:bg-green-400 h-2 rounded-full" style={{width: '74%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">User Retention</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">Performance Metrics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Average Load Time</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">1.2s</div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Error Rate</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">0.3%</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleExportAnalytics}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Export Analytics
              </button>
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                Generate Report
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