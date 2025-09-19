'use client'

import { useState } from 'react'
import { Tool, User } from '../lib/types'

interface ToolsTableProps {
  tools: Tool[]
}

export default function ToolsTable({ tools }: ToolsTableProps) {
  const [sortField, setSortField] = useState<keyof Tool>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof Tool) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTools = [...tools].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })


  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const SortIcon = ({ field }: { field: keyof Tool }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Tool Name <SortIcon field="name" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('difficulty_level')}
              >
                Difficulty <SortIcon field="difficulty_level" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                Rating <SortIcon field="rating" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Created <SortIcon field="created_at" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Links
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTools.map((tool) => (
              <tr key={tool.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {tool.description.substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tool.difficulty_level && (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(tool.difficulty_level)}`}>
                      {tool.difficulty_level}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tool.rating && parseFloat(tool.rating.toString()) > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-900">
                        {parseFloat(tool.rating.toString()).toFixed(1)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {tool.categories.slice(0, 2).map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                      >
                        {category.name}
                      </span>
                    ))}
                    {tool.categories.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{tool.categories.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {tool.roles.slice(0, 2).map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded"
                      >
                        {role.name}
                      </span>
                    ))}
                    {tool.roles.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{tool.roles.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tool.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="space-y-1">
                    {/* Official Website Link */}
                    {tool.tool_url ? (
                      <div className="flex items-center">
                        <span className="mr-1 text-xs" aria-label="Official Website">🌐</span>
                        <a
                          href={tool.tool_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors text-xs"
                        >
                          Website
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-1 text-xs text-gray-400" aria-label="Official Website">🌐</span>
                        <span className="text-xs text-gray-400">N/A</span>
                      </div>
                    )}

                    {/* Documentation Link */}
                    {tool.docs_url ? (
                      <div className="flex items-center">
                        <span className="mr-1 text-xs" aria-label="Documentation">📄</span>
                        <a
                          href={tool.docs_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors text-xs"
                        >
                          Docs
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-1 text-xs text-gray-400" aria-label="Documentation">📄</span>
                        <span className="text-xs text-gray-400">N/A</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No tools found</div>
        </div>
      )}
    </div>
  )
}