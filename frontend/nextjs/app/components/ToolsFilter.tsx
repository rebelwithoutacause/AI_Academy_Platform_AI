'use client'

import { useState, useEffect } from 'react'
import { ToolFilters, Category, Role } from '../lib/types'
import api from '../lib/api'

interface ToolsFilterProps {
  filters: ToolFilters
  onFiltersChange: (filters: ToolFilters) => void
}

export default function ToolsFilter({ filters, onFiltersChange }: ToolsFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      const [categoriesData, rolesData] = await Promise.all([
        api.getCategories(),
        api.getRoles(),
      ])
      setCategories(categoriesData)
      setRoles(rolesData)
    } catch (err) {
      console.error('Failed to load filter options:', err)
    }
  }

  const handleFilterChange = (key: keyof ToolFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value)

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Tools
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="min-w-40">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <select
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tag
          </label>
          <input
            type="text"
            placeholder="Filter by tag..."
            value={filters.tag || ''}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.role && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Role: {filters.role}
              <button
                onClick={() => handleFilterChange('role', '')}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.tag && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
              Tag: {filters.tag}
              <button
                onClick={() => handleFilterChange('tag', '')}
                className="ml-2 text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}