'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tool, ToolFilters, User, Category, Role } from '../lib/types'
import api from '../lib/api'
import { useToast } from '../contexts/SafeToastContext'
import RoleBasedNavigation from '../components/RoleBasedNavigation'

interface AdminTool extends Tool {
  status: 'pending' | 'approved' | 'rejected'
  submitted_by?: User
}

interface AdminFilters extends ToolFilters {
  status?: 'pending' | 'approved' | 'rejected'
  submitted_by?: string
}

export default function AdminPanel() {
  const { addToast } = useToast()
  const router = useRouter()
  const [tools, setTools] = useState<AdminTool[]>([])
  const [filters, setFilters] = useState<AdminFilters>({})
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedTool, setSelectedTool] = useState<AdminTool | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (authChecked && currentUser) {
      if (currentUser.role !== 'owner') {
        addToast('Access denied. Admin privileges required.', 'error', 5000)
        router.push('/')
        return
      }
      loadData()
    }
  }, [authChecked, currentUser])

  useEffect(() => {
    if (authChecked && currentUser?.role === 'owner') {
      loadTools()
    }
  }, [filters, authChecked, currentUser])

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
      setAuthChecked(true)
    } catch (err) {
      addToast('Please login to access Admin Panel', 'error', 4000)
      router.push('/')
    }
  }

  const loadData = async () => {
    try {
      // Load categories and roles for filters
      const [categoriesRes, rolesRes] = await Promise.all([
        api.getCategories(),
        api.getRoles()
      ])
      setCategories(categoriesRes)
      setRoles(rolesRes)
    } catch (err) {
      console.error('Failed to load filter data:', err)
      // Set default data if API fails
      setCategories([
        { id: 1, name: 'Development' },
        { id: 2, name: 'Testing' },
        { id: 3, name: 'Design' },
        { id: 4, name: 'Database' }
      ])
      setRoles([
        { id: 1, name: 'Frontend' },
        { id: 2, name: 'Backend' },
        { id: 3, name: 'Designer' }
      ])
    }
  }

  const loadTools = async () => {
    setLoading(true)
    try {
      // For demo purposes, we'll create mock data with different statuses
      const mockTools: AdminTool[] = [
        {
          id: 1,
          name: 'React Component Generator',
          link: 'https://react-generator.com',
          description: 'Generate React components with TypeScript support',
          usage: 'Select component type and configure props',
          difficulty_level: 'Intermediate',
          images: [],
          created_by: 2,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          categories: [{ id: 1, name: 'Development' }],
          roles: [{ id: 1, name: 'Frontend' }],
          tags: [{ id: 1, name: 'React' }],
          status: 'pending',
          submitted_by: { id: 2, name: 'Elena Petrova', email: 'elena@frontend.local', role: 'frontend', role_display: 'Frontend Developer', role_color: 'blue' }
        },
        {
          id: 2,
          name: 'API Testing Tool',
          link: 'https://api-tester.com',
          description: 'Test REST APIs with automated validation',
          usage: 'Enter API endpoint and test parameters',
          difficulty_level: 'Beginner',
          images: [],
          created_by: 3,
          created_at: '2024-01-14T15:30:00Z',
          updated_at: '2024-01-14T15:30:00Z',
          categories: [{ id: 2, name: 'Testing' }],
          roles: [{ id: 2, name: 'Backend' }],
          tags: [{ id: 2, name: 'API' }],
          status: 'approved',
          submitted_by: { id: 3, name: 'Alex Chen', email: 'alex@backend.local', role: 'backend', role_display: 'Backend Developer', role_color: 'purple' }
        },
        {
          id: 3,
          name: 'Color Palette Generator',
          link: 'https://color-gen.com',
          description: 'Generate beautiful color palettes for design',
          usage: 'Select base color and palette size',
          difficulty_level: 'Beginner',
          images: [],
          created_by: 4,
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
          categories: [{ id: 3, name: 'Design' }],
          roles: [{ id: 3, name: 'Designer' }],
          tags: [{ id: 3, name: 'Colors' }],
          status: 'rejected',
          submitted_by: { id: 4, name: 'Maya Singh', email: 'maya@designer.local', role: 'designer', role_display: 'UI/UX Designer', role_color: 'pink' }
        },
        {
          id: 4,
          name: 'Database Schema Validator',
          link: 'https://db-validator.com',
          description: 'Validate database schemas and relationships',
          usage: 'Upload schema file or enter SQL',
          difficulty_level: 'Advanced',
          images: [],
          created_by: 3,
          created_at: '2024-01-12T14:20:00Z',
          updated_at: '2024-01-12T14:20:00Z',
          categories: [{ id: 4, name: 'Database' }],
          roles: [{ id: 2, name: 'Backend' }],
          tags: [{ id: 4, name: 'Database' }],
          status: 'pending',
          submitted_by: { id: 3, name: 'Alex Chen', email: 'alex@backend.local', role: 'backend', role_display: 'Backend Developer', role_color: 'purple' }
        }
      ]

      // Apply filters
      let filteredTools = mockTools

      if (filters.status) {
        filteredTools = filteredTools.filter(tool => tool.status === filters.status)
      }

      if (filters.category) {
        filteredTools = filteredTools.filter(tool =>
          tool.categories.some(cat => cat.name.toLowerCase().includes(filters.category!.toLowerCase()))
        )
      }

      if (filters.role) {
        filteredTools = filteredTools.filter(tool =>
          tool.roles.some(role => role.name.toLowerCase().includes(filters.role!.toLowerCase()))
        )
      }

      if (filters.search) {
        filteredTools = filteredTools.filter(tool =>
          tool.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          tool.description.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }

      setTools(filteredTools)
    } catch (err) {
      addToast('Failed to load tools', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (toolId: number) => {
    try {
      // Mock API call
      setTools(prev => prev.map(tool =>
        tool.id === toolId ? { ...tool, status: 'approved' as const } : tool
      ))
      addToast('Tool approved successfully', 'success', 3000)
    } catch (err) {
      addToast('Failed to approve tool', 'error')
    }
  }

  const handleReject = async (toolId: number) => {
    try {
      // Mock API call
      setTools(prev => prev.map(tool =>
        tool.id === toolId ? { ...tool, status: 'rejected' as const } : tool
      ))
      addToast('Tool rejected', 'info', 3000)
    } catch (err) {
      addToast('Failed to reject tool', 'error')
    }
  }

  const handleDelete = async (toolId: number) => {
    if (!confirm('Are you sure you want to permanently delete this tool?')) return

    try {
      // Mock API call
      setTools(prev => prev.filter(tool => tool.id !== toolId))
      addToast('Tool deleted permanently', 'success', 3000)
    } catch (err) {
      addToast('Failed to delete tool', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/'
  }

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

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <RoleBasedNavigation user={currentUser} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-800 dark:to-blue-800 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">👑 Admin Panel</h1>
          <p className="text-green-100 dark:text-green-200">
            Manage tools, approve submissions, and oversee platform content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tools.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tools.filter(t => t.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tools.filter(t => t.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tools.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search tools..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Design">Design</option>
                <option value="Database">Database</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={filters.role || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Designer">Designer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tools Management</h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No tools match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {tools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tool.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {tool.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tool.categories.map(cat => (
                            <span key={cat.id} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {tool.submitted_by?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {tool.submitted_by?.role_display || 'Unknown role'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(tool.status)}`}>
                          {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {tool.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(tool.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(tool.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedTool(tool)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id)}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tool Detail Modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTool.name}</h2>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">{selectedTool.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usage</h3>
                  <p className="text-gray-600 dark:text-gray-300">{selectedTool.usage}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Link</h3>
                  <a href={selectedTool.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {selectedTool.link}
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadge(selectedTool.status)}`}>
                    {selectedTool.status.charAt(0).toUpperCase() + selectedTool.status.slice(1)}
                  </span>
                </div>

                <div className="flex gap-4 pt-4">
                  {selectedTool.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedTool.id)
                          setSelectedTool(null)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedTool.id)
                          setSelectedTool(null)
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedTool(null)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}