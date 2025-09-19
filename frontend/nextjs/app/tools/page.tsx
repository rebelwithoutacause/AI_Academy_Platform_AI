'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tool, ToolFilters, User } from '../lib/types'
import api from '../lib/api'
import ToolCard from '../components/ToolCard'
import ToolForm from '../components/ToolForm'
import ToolsFilter from '../components/ToolsFilter'
import ToolsTable from '../components/ToolsTable'
import ToolDetailModal from '../components/ToolDetailModal'
import RoleBasedNavigation from '../components/RoleBasedNavigation'
import { useToast } from '../contexts/ToastContext'

export default function ToolsPage() {
  const { addToast } = useToast()
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [filters, setFilters] = useState<ToolFilters>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | undefined>()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards')
  const [selectedTool, setSelectedTool] = useState<Tool | undefined>()
  const [totalItems, setTotalItems] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (authChecked) {
      loadTools()
    }
  }, [filters, authChecked])

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
      setAuthChecked(true)
    } catch (err) {
      console.log('User not authenticated, redirecting to home page')
      addToast('Please login to access AI Tools', 'error', 4000)
      router.push('/')
      return
    }
  }

  const loadTools = async () => {
    setLoading(true)
    try {
      const paginationParams = {
        ...filters
      }
      const response = await api.getTools(paginationParams)

      // Handle response
      if (response.data && Array.isArray(response.data)) {
        setTools(response.data)
        setTotalItems(response.total || response.data.length)
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated response
        setTools(response)
        setTotalItems(response.length)
      }
    } catch (err: any) {
      console.log('Tools API not available, using mock data')
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
          rating: 5.0,
          mock_input: 'What\'s the weather like today?',
          mock_output: 'I don\'t have access to real-time weather data, but I can help you find weather information.',
          comments_count: 45,
          categories: [{ id: 1, name: 'AI Assistant' }],
          roles: [{ id: 1, name: 'Developer' }, { id: 2, name: 'Writer' }],
          tags: [{ id: 1, name: 'AI' }, { id: 2, name: 'Assistant' }, { id: 3, name: 'Anthropic' }]
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
          rating: 5.0,
          mock_input: 'What\'s the weather like today?',
          mock_output: 'The weather is sunny with a high of 75°F.',
          comments_count: 67,
          categories: [{ id: 1, name: 'AI Assistant' }],
          roles: [{ id: 1, name: 'Developer' }, { id: 3, name: 'Content Creator' }],
          tags: [{ id: 1, name: 'AI' }, { id: 4, name: 'OpenAI' }, { id: 5, name: 'Chatbot' }]
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
          rating: 4.0,
          mock_input: 'describe("Array", function() { it("should return -1 when value not present", function() { }); });',
          mock_output: 'Test suite executed successfully with 1 passing test.',
          comments_count: 23,
          categories: [{ id: 2, name: 'Testing' }],
          roles: [{ id: 1, name: 'Developer' }, { id: 4, name: 'QA Engineer' }],
          tags: [{ id: 6, name: 'JavaScript' }, { id: 7, name: 'Testing' }, { id: 8, name: 'Node.js' }]
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
          rating: 5.0,
          mock_input: 'function calculateSum(a, b)',
          mock_output: 'return a + b;',
          comments_count: 89,
          categories: [{ id: 3, name: 'Development' }],
          roles: [{ id: 1, name: 'Developer' }],
          tags: [{ id: 1, name: 'AI' }, { id: 9, name: 'Code Completion' }, { id: 10, name: 'GitHub' }]
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
          rating: 5.0,
          mock_input: 'git push origin main',
          mock_output: 'Enumerating objects: 3, done. To github.com:user/repo.git',
          comments_count: 156,
          categories: [{ id: 3, name: 'Development' }],
          roles: [{ id: 1, name: 'Developer' }, { id: 5, name: 'DevOps Engineer' }],
          tags: [{ id: 10, name: 'GitHub' }, { id: 11, name: 'Git' }, { id: 12, name: 'Version Control' }]
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
          rating: 4.0,
          mock_input: 'docker run -p 3000:3000 my-app',
          mock_output: 'Container started successfully on port 3000.',
          comments_count: 92,
          categories: [{ id: 4, name: 'DevOps' }],
          roles: [{ id: 5, name: 'DevOps Engineer' }, { id: 1, name: 'Developer' }],
          tags: [{ id: 13, name: 'Docker' }, { id: 14, name: 'Containerization' }, { id: 15, name: 'Deployment' }]
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
          rating: 5.0,
          mock_input: 'console.log("Debug message")',
          mock_output: 'Debug message (logged to console)',
          comments_count: 34,
          categories: [{ id: 3, name: 'Development' }],
          roles: [{ id: 1, name: 'Developer' }, { id: 6, name: 'Frontend Developer' }],
          tags: [{ id: 16, name: 'Debugging' }, { id: 17, name: 'Browser' }, { id: 18, name: 'Web Development' }]
        }
      ]
      setTools(mockTools)
      setTotalItems(mockTools.length)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTool(undefined)
    loadTools()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTool(undefined)
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setShowForm(true)
  }

  const handleDelete = async (tool: Tool) => {
    if (!confirm(`Are you sure you want to delete "${tool.name}"?`)) return

    try {
      await api.deleteTool(tool.id.toString())
      addToast(
        `Tool "${tool.name}" deleted successfully`,
        'success',
        6000,
        {
          label: 'Undo',
          onClick: () => {
            addToast('Undo functionality would restore the tool here', 'info')
          }
        }
      )
      loadTools()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete tool'
      addToast(errorMessage, 'error')
    }
  }

  const handleAddNew = () => {
    setEditingTool(undefined)
    setShowForm(true)
  }

  const handleView = (tool: Tool) => {
    setSelectedTool(tool)
  }

  const handleCloseDetail = () => {
    setSelectedTool(undefined)
  }

  const handleDetailEdit = () => {
    if (selectedTool) {
      setEditingTool(selectedTool)
      setSelectedTool(undefined)
      setShowForm(true)
    }
  }

  const handleDetailDelete = async () => {
    if (selectedTool && confirm(`Are you sure you want to delete "${selectedTool.name}"?`)) {
      try {
        await api.deleteTool(selectedTool.id.toString())
        addToast(`Tool "${selectedTool.name}" deleted successfully`, 'success')
        setSelectedTool(undefined)
        loadTools()
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to delete tool'
        addToast(errorMessage, 'error')
      }
    }
  }

  const handleFilterChange = (newFilters: ToolFilters) => {
    setFilters(newFilters)
  }

  const handleLogout = () => {
    // Clear auth tokens and redirect
    localStorage.removeItem('auth_token')
    window.location.href = '/'
  }

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render content if user is not authenticated (they should be redirected)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Role-Based Navigation */}
      <RoleBasedNavigation user={currentUser} onLogout={handleLogout} />



      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold mb-2">🛠️ Developer Tools</h1>
              <p className="text-blue-100 dark:text-blue-200">
                Discover and share tools that make development easier
              </p>
              <div className="mt-3 flex gap-6 text-sm">
                <div>
                  <span className="text-blue-100 dark:text-blue-200">Total Tools:</span>
                  <span className="ml-1 font-semibold">{totalItems}</span>
                </div>
              </div>
            </div>
            {currentUser && (
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium backdrop-blur-sm border border-white/20"
              >
                ➕ Add New Tool
              </button>
            )}
          </div>
        </div>

        <div className="mb-8">
          <ToolsFilter filters={filters} onFiltersChange={handleFilterChange} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : !Array.isArray(tools) || tools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              {Object.keys(filters).length > 0 ? 'No tools match your filters' : 'No tools available yet'}
            </div>
            {currentUser && (
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                Be the first to add a tool!
              </button>
            )}
          </div>
        ) : (
          <>
            {/* View Toggle */}
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {totalItems} tools
              </div>
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setViewType('cards')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'cards'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  📄 Cards
                </button>
                <button
                  onClick={() => setViewType('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'table'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  📊 Table
                </button>
              </div>
            </div>

            {viewType === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.isArray(tools) && tools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                  />
                ))}
              </div>
            ) : (
              <div className="mb-8">
                <ToolsTable
                  tools={tools}
                />
              </div>
            )}
          </>
        )}


      </div>

      {showForm && (
        <ToolForm
          tool={editingTool}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {selectedTool && (
        <ToolDetailModal
          tool={selectedTool}
          onClose={handleCloseDetail}
          onEdit={handleDetailEdit}
          onDelete={handleDetailDelete}
          canManage={currentUser?.id === selectedTool.created_by}
        />
      )}

    </div>
  )
}