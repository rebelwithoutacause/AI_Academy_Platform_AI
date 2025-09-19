'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Pagination from './Pagination'
import { useToast } from '../contexts/SafeToastContext'
import { useClockContext } from '../contexts/ClockContext'

interface User {
  id: number
  name: string
  email: string
  role: string
  role_display?: string
  role_color?: string
}

interface DashboardProps {
  user: User
}

interface DashboardData {
  greeting: string
  role_access: string
  current_time: string
  user: User
  totalTools: number
  totalUsers: number
  recentActivities: Array<{
    id: number
    activity: string
    time: string
  }>
  popularTools: Array<{
    id: number
    name: string
    category: string
    uses: number
  }>
}

export default function Dashboard({ user }: DashboardProps) {
  const { addToast } = useToast()
  const { currentTime } = useClockContext()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToolsPreview, setShowToolsPreview] = useState(false)
  const [toolsPreview, setToolsPreview] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [toolsPreviewPage, setToolsPreviewPage] = useState(1)
  const itemsPerPage = 3
  const toolsPerPage = 4
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
    // Show welcome toast
    const hasShownWelcome = sessionStorage.getItem('dashboard_welcome_shown')
    if (!hasShownWelcome) {
      setTimeout(() => {
        addToast(`Welcome back, ${user.name}! 👋`, 'info', 6000)
        sessionStorage.setItem('dashboard_welcome_shown', 'true')
      }, 1000)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      let actualToolsCount = 7 // fallback

      // Get actual tools count from tools API
      try {
        const toolsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tools`)
        console.log('Tools API response status:', toolsResponse.status)
        if (toolsResponse.ok) {
          const toolsData = await toolsResponse.json()
          console.log('Tools API data:', { total: toolsData.total, dataLength: toolsData.data?.length })
          actualToolsCount = toolsData.total || toolsData.data?.length || 7
        }
      } catch (toolsError) {
        console.log('Tools API error:', toolsError)
        console.log('Tools API not available for count, using fallback')
      }

      console.log('Final actualToolsCount:', actualToolsCount)

      if (token) {
        // Try real API call first
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            // Override totalTools with actual count
            data.totalTools = actualToolsCount
            console.log('Dashboard API succeeded, setting data with totalTools:', data.totalTools)
            setDashboardData(data)
            setLoading(false)
            return
          }
        } catch (apiError) {
          console.log('Dashboard API not available, using mock data')
        }
      }

      // Fallback to mock data with actual tools count
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockData = {
        totalTools: actualToolsCount,
        totalUsers: 8,
        recentActivities: [
          { id: 1, activity: 'New tool "Claude.AI" added', time: '2 hours ago' },
          { id: 2, activity: 'Tool "GitHub Copilot" updated', time: '4 hours ago' },
          { id: 3, activity: 'Tool "Docker" rating improved', time: '1 day ago' }
        ],
        popularTools: [
          { id: 1, name: 'GitHub', category: 'Development', uses: 1567 },
          { id: 2, name: 'Claude.AI', category: 'AI Assistant', uses: 1250 },
          { id: 3, name: 'ChatGPT', category: 'AI Assistant', uses: 980 }
        ]
      }
      console.log('Setting dashboard data with totalTools:', mockData.totalTools)
      setDashboardData(mockData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIToolsClick = async () => {
    console.log('AI Tools button clicked - showing preview')
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Try real API call first
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools?per_page=12`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            const tools = data.data || data
            setToolsPreview(tools)
            setToolsPreviewPage(1)
            setShowToolsPreview(true)
            return
          }
        } catch (apiError) {
          console.log('Tools API not available, using mock data')
        }
      }

      // Fallback to mock tools data
      const mockTools = [
        {
          id: 1,
          name: 'Claude.AI',
          description: 'An AI assistant developed by Anthropic that can help with writing, analysis, math, coding, and creative tasks.',
          category: 'AI Assistant',
          usage_count: 1250,
          created_by: 1,
          created_at: '2024-01-15',
          official_link: 'https://claude.ai',
          documentation: 'https://docs.anthropic.com/claude',
          rating: 5,
          mock_input: 'What\'s the weather like today?',
          mock_output: 'I don\'t have access to real-time weather data, but I can help you find weather information.',
          comments_count: 45
        },
        {
          id: 2,
          name: 'ChatGPT',
          description: 'An AI chatbot that can engage in conversation, answer questions, and assist with various tasks.',
          category: 'AI Assistant',
          usage_count: 980,
          created_by: 2,
          created_at: '2024-01-10',
          official_link: 'https://chat.openai.com',
          documentation: 'https://platform.openai.com/docs',
          rating: 5,
          mock_input: 'What\'s the weather like today?',
          mock_output: 'The weather is sunny with a high of 75°F.',
          comments_count: 67
        },
        {
          id: 3,
          name: 'GetMocha',
          description: 'A feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple.',
          category: 'Testing',
          usage_count: 567,
          created_by: 1,
          created_at: '2024-01-05',
          official_link: 'https://mochajs.org',
          documentation: 'https://mochajs.org/#getting-started',
          rating: 4,
          mock_input: 'describe("Array", function() { it("should return -1 when value not present", function() { }); });',
          mock_output: 'Test suite executed successfully with 1 passing test.',
          comments_count: 23
        },
        {
          id: 4,
          name: 'GitHub Copilot',
          description: 'An AI-powered code completion tool that assists developers by suggesting code snippets and entire functions in real-time.',
          category: 'Development',
          usage_count: 834,
          created_by: 3,
          created_at: '2024-01-08',
          official_link: 'https://github.com/features/copilot',
          documentation: 'https://docs.github.com/en/copilot',
          rating: 5,
          mock_input: 'function calculateSum(a, b)',
          mock_output: 'return a + b;',
          comments_count: 89
        },
        {
          id: 5,
          name: 'GitHub',
          description: 'A platform for version control and collaboration using Git, hosting millions of repositories.',
          category: 'Development',
          usage_count: 1567,
          created_by: 4,
          created_at: '2024-01-12',
          official_link: 'https://github.com',
          documentation: 'https://docs.github.com',
          rating: 5,
          mock_input: 'git push origin main',
          mock_output: 'Enumerating objects: 3, done. To github.com:user/repo.git',
          comments_count: 156
        },
        {
          id: 6,
          name: 'Docker',
          description: 'A platform for developing, shipping, and running applications using containerization technology.',
          category: 'DevOps',
          usage_count: 743,
          created_by: 5,
          created_at: '2024-01-06',
          official_link: 'https://docker.com',
          documentation: 'https://docs.docker.com',
          rating: 4,
          mock_input: 'docker run -p 3000:3000 my-app',
          mock_output: 'Container started successfully on port 3000.',
          comments_count: 92
        },
        {
          id: 7,
          name: 'Developer Tools',
          description: 'Browser-based debugging and development tools for web applications, including console, network, and performance analysis.',
          category: 'Development',
          usage_count: 892,
          created_by: 6,
          created_at: '2024-01-09',
          official_link: 'https://developer.chrome.com/docs/devtools',
          documentation: 'https://developer.chrome.com/docs/devtools',
          rating: 5,
          mock_input: 'console.log("Debug message")',
          mock_output: 'Debug message (logged to console)',
          comments_count: 34
        }
      ]
      setToolsPreview(mockTools)
      setToolsPreviewPage(1)
      setShowToolsPreview(true)
    } catch (error) {
      console.error('Failed to fetch tools preview:', error)
      // Fallback to navigation
      router.push('/tools')
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getTotalPages = () => {
    const currentUser = dashboardData?.user || user
    const allActions = getRoleActions(currentUser.role)
    return Math.ceil(allActions.length / itemsPerPage)
  }

  const getPaginatedActions = () => {
    const currentUser = dashboardData?.user || user
    const allActions = getRoleActions(currentUser.role)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return allActions.slice(startIndex, endIndex)
  }

  const handleToolsPreviewPreviousPage = () => {
    if (toolsPreviewPage > 1) {
      setToolsPreviewPage(toolsPreviewPage - 1)
    }
  }

  const handleToolsPreviewNextPage = () => {
    if (toolsPreviewPage < getToolsPreviewTotalPages()) {
      setToolsPreviewPage(toolsPreviewPage + 1)
    }
  }

  const handleActionClick = (actionTitle: string) => {
    switch (actionTitle) {
      case '👑 Admin Panel':
        router.push('/admin')
        break
      case '📊 Analytics':
        router.push('/reports/analytics')
        break
      case '⚙️ System Config':
        router.push('/settings')
        break
      case '🎨 UI Components':
      case '🎨 Design Tools':
        addToast('UI Components showcase coming soon!', 'info', 3000)
        break
      case '📱 Design System':
        addToast('Design System documentation coming soon!', 'info', 3000)
        break
      case '🔧 Dev Tools':
      case '🔧 API Docs':
        addToast('Development tools coming soon!', 'info', 3000)
        break
      case '🗄️ Database':
        addToast('Database management coming soon!', 'info', 3000)
        break
      case '🚀 Deploy':
        addToast('Deployment tools coming soon!', 'info', 3000)
        break
      case '📋 Project Board':
        addToast('Project Board coming soon!', 'info', 3000)
        break
      case '📈 Reports':
        router.push('/reports')
        break
      case '👥 Team Management':
        addToast('Team Management coming soon!', 'info', 3000)
        break
      case '🐛 Bug Tracker':
        addToast('Bug Tracker coming soon!', 'info', 3000)
        break
      case '🧪 Test Suites':
        addToast('Test Suites coming soon!', 'info', 3000)
        break
      case '📝 Test Cases':
        addToast('Test Cases coming soon!', 'info', 3000)
        break
      case '🖼️ Prototypes':
        addToast('Prototypes viewer coming soon!', 'info', 3000)
        break
      case '🎭 User Research':
        addToast('User Research tools coming soon!', 'info', 3000)
        break
      default:
        addToast('Feature coming soon!', 'info', 3000)
    }
  }

  const getToolsPreviewTotalPages = () => {
    return Math.ceil(toolsPreview.length / toolsPerPage)
  }

  const getPaginatedToolsPreview = () => {
    const startIndex = (toolsPreviewPage - 1) * toolsPerPage
    const endIndex = startIndex + toolsPerPage
    return toolsPreview.slice(startIndex, endIndex)
  }

  const getRoleColorClass = (role: string) => {
    const colorMap: Record<string, string> = {
      owner: 'bg-green-100 text-green-800 border-green-200',
      frontend: 'bg-blue-100 text-blue-800 border-blue-200',
      backend: 'bg-purple-100 text-purple-800 border-purple-200',
      pm: 'bg-orange-100 text-orange-800 border-orange-200',
      qa: 'bg-red-100 text-red-800 border-red-200',
      designer: 'bg-pink-100 text-pink-800 border-pink-200',
    }
    return colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRoleActions = (role: string) => {
    const actions: Record<string, Array<{title: string, description: string, icon: string, color: string}>> = {
      owner: [
        { title: '👑 Admin Panel', description: 'Manage users and system settings', icon: '👑', color: 'bg-green-500 hover:bg-green-600' },
        { title: '📊 Analytics', description: 'View platform usage statistics', icon: '📊', color: 'bg-blue-500 hover:bg-blue-600' },
        { title: '⚙️ System Config', description: 'Configure platform settings', icon: '⚙️', color: 'bg-gray-500 hover:bg-gray-600' },
      ],
      frontend: [
        { title: '🎨 UI Components', description: 'Browse and test UI elements', icon: '🎨', color: 'bg-blue-500 hover:bg-blue-600' },
        { title: '📱 Design System', description: 'Access design tokens and guidelines', icon: '📱', color: 'bg-indigo-500 hover:bg-indigo-600' },
        { title: '🔧 Dev Tools', description: 'Frontend development utilities', icon: '🔧', color: 'bg-cyan-500 hover:bg-cyan-600' },
      ],
      backend: [
        { title: '🔧 API Docs', description: 'Browse API endpoints and schemas', icon: '🔧', color: 'bg-purple-500 hover:bg-purple-600' },
        { title: '🗄️ Database', description: 'Manage database and migrations', icon: '🗄️', color: 'bg-gray-700 hover:bg-gray-800' },
        { title: '🚀 Deploy', description: 'Deployment and server tools', icon: '🚀', color: 'bg-green-600 hover:bg-green-700' },
      ],
      pm: [
        { title: '📋 Project Board', description: 'Track tasks and milestones', icon: '📋', color: 'bg-orange-500 hover:bg-orange-600' },
        { title: '📈 Reports', description: 'Generate progress reports', icon: '📈', color: 'bg-blue-600 hover:bg-blue-700' },
        { title: '👥 Team Management', description: 'Manage team and resources', icon: '👥', color: 'bg-purple-600 hover:bg-purple-700' },
      ],
      qa: [
        { title: '🐛 Bug Tracker', description: 'Report and track issues', icon: '🐛', color: 'bg-red-500 hover:bg-red-600' },
        { title: '🧪 Test Suites', description: 'Run automated tests', icon: '🧪', color: 'bg-yellow-500 hover:bg-yellow-600' },
        { title: '📝 Test Cases', description: 'Manage test documentation', icon: '📝', color: 'bg-indigo-500 hover:bg-indigo-600' },
      ],
      designer: [
        { title: '🎨 Design Tools', description: 'Access design software and assets', icon: '🎨', color: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' },
        { title: '🖼️ Prototypes', description: 'View and create prototypes', icon: '🖼️', color: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600' },
        { title: '🎭 User Research', description: 'Conduct UX research and testing', icon: '🎭', color: 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600' },
      ],
    }
    return actions[role] || []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const currentUser = dashboardData?.user || user

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              {dashboardData?.greeting || `Your role: ${currentUser.role_display || currentUser.role}`}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-sm text-blue-100 dark:text-blue-200">Current Time</div>
              <div className="text-lg font-semibold">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>


      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tools</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.totalTools || 7}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">👤</span>
            User Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
              <span className="text-gray-900 dark:text-white">{currentUser.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span className="text-gray-900 dark:text-white">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-700 dark:text-gray-300">Role:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColorClass(currentUser.role)}`}>
                {currentUser.role_display || currentUser.role}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span>
              <span className="text-gray-900 dark:text-white">#{currentUser.id}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm">🛠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Added new tool</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Completed project review</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm">👥</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Team meeting</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            System Information
          </h3>
          <div className={`p-4 rounded-lg border ${getRoleColorClass(currentUser.role)}`}>
            <div className="font-medium mb-2">
              {currentUser.role_display || currentUser.role} Access
            </div>
            <div className="text-sm">
              {dashboardData?.role_access || 'You have access to role-specific features.'}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Platform Status:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
              <span className="text-gray-900 dark:text-white">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-2">⚡</span>
          Role-Based Quick Actions
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
          {getPaginatedActions().map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.title)}
              className={`p-4 text-left text-white rounded-lg border transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${action.color}`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{action.icon}</span>
                <div className="font-medium">{action.title}</div>
              </div>
              <div className="text-sm opacity-90">{action.description}</div>
            </button>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={getTotalPages()}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          totalItems={getRoleActions(currentUser.role).length}
          itemsPerPage={itemsPerPage}
        />
      </div>


      {/* AI Tools Preview Modal */}
      {showToolsPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🤖 Available AI Tools</h2>
                <button
                  onClick={() => setShowToolsPreview(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6 min-h-[300px]">
                {getPaginatedToolsPreview().map((tool: any) => (
                  <div key={tool.id} className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                      {tool.difficulty_level && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          tool.difficulty_level === 'Beginner' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' :
                          tool.difficulty_level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                          'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                        }`}>
                          {tool.difficulty_level}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{tool.description}</p>
                    <div className="flex gap-2">
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                      >
                        Use Tool
                      </a>
                      {tool.documentation && (
                        <a
                          href={tool.documentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-600 dark:bg-gray-500 text-white text-sm rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        >
                          Docs
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={toolsPreviewPage}
                totalPages={getToolsPreviewTotalPages()}
                onPreviousPage={handleToolsPreviewPreviousPage}
                onNextPage={handleToolsPreviewNextPage}
                totalItems={toolsPreview.length}
                itemsPerPage={toolsPerPage}
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowToolsPreview(false)
                    router.push('/tools')
                  }}
                  className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  View All Tools
                </button>
                <button
                  onClick={() => setShowToolsPreview(false)}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}