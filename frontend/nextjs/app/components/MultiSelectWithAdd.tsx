'use client'

import { useState } from 'react'
import api from '../lib/api'

interface Option {
  id: number
  name: string
}

interface MultiSelectWithAddProps {
  label: string
  options: Option[]
  selectedValues: number[]
  onSelectionChange: (values: number[]) => void
  onNewOptionAdded: (option: Option) => void
  createFunction: (name: string) => Promise<Option>
  placeholder?: string
}

export default function MultiSelectWithAdd({
  label,
  options,
  selectedValues,
  onSelectionChange,
  onNewOptionAdded,
  createFunction,
  placeholder = "Select options..."
}: MultiSelectWithAddProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOptionName, setNewOptionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleOptionToggle = (optionId: number) => {
    if (selectedValues.includes(optionId)) {
      // Remove from selection
      onSelectionChange(selectedValues.filter(id => id !== optionId))
    } else {
      // Add to selection
      onSelectionChange([...selectedValues, optionId])
    }
  }

  const handleCreateNew = async () => {
    if (!newOptionName.trim()) {
      setError('Name is required')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const newOption = await createFunction(newOptionName.trim())
      onNewOptionAdded(newOption)
      setNewOptionName('')
      setShowAddForm(false)

      // Auto-select the newly created option
      onSelectionChange([...selectedValues, newOption.id])
    } catch (err: any) {
      setError(err.response?.data?.errors?.name?.[0] || err.message || 'Failed to create')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setNewOptionName('')
    setError('')
  }

  const selectedOptions = options.filter(option => selectedValues.includes(option.id))

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          + Add New
        </button>
      </div>

      {/* Selected items display */}
      {selectedOptions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
            >
              {option.name}
              <button
                type="button"
                onClick={() => handleOptionToggle(option.id)}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Options list with checkboxes */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-32 overflow-y-auto bg-white dark:bg-gray-700">
        {options.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No options available
          </div>
        ) : (
          options.map(option => (
            <label
              key={option.id}
              className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={() => handleOptionToggle(option.id)}
                className="mr-2 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {option.name}
              </span>
            </label>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder={`Enter new ${label.toLowerCase().slice(0, -1)} name`}
              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateNew()}
            />
            <button
              type="button"
              onClick={handleCreateNew}
              disabled={isCreating}
              className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white rounded text-sm hover:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Click to select/deselect options
      </div>
    </div>
  )
}