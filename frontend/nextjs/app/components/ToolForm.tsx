'use client'

import { useState, useEffect } from 'react'
import { Tool, Category, Role, CreateToolData } from '../lib/types'
import api from '../lib/api'
import MultiSelectWithAdd from './MultiSelectWithAdd'
import { useToast } from '../contexts/ToastContext'

interface ToolFormProps {
  tool?: Tool
  onSuccess: () => void
  onCancel: () => void
}

export default function ToolForm({ tool, onSuccess, onCancel }: ToolFormProps) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState<CreateToolData>({
    name: tool?.name || '',
    link: tool?.link || '',
    documentation: tool?.documentation || '',
    description: tool?.description || '',
    usage: tool?.usage || '',
    examples: tool?.examples || '',
    difficulty_level: tool?.difficulty_level || undefined,
    video_links: tool?.video_links || [],
    rating: tool?.rating || 0,
    images: tool?.images || [],
    categories: tool?.categories.map(c => c.id) || [],
    roles: tool?.roles.map(r => r.id) || [],
    tags: tool?.tags.map(t => t.name) || [],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

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
      console.error('Failed to load options:', err)
    }
  }

  const handleNewCategory = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory])
  }

  const handleNewRole = (newRole: Role) => {
    setRoles(prev => [...prev, newRole])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Convert rating to number for proper handling
    const processedValue = name === 'rating' ? (value ? parseFloat(value) : 0) : value
    setFormData(prev => ({ ...prev, [name]: processedValue }))
  }

  const handleCategoriesChange = (values: number[]) => {
    setFormData(prev => ({ ...prev, categories: values }))
  }

  const handleRolesChange = (values: number[]) => {
    setFormData(prev => ({ ...prev, roles: values }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleVideoLinksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const links = e.target.value.split('\n').map(link => link.trim()).filter(link => link)
    setFormData(prev => ({ ...prev, video_links: links }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files)
  }

  const uploadImages = async (): Promise<string[]> => {
    if (!selectedFiles || selectedFiles.length === 0) return []

    setUploading(true)
    try {
      const response = await api.uploadImages(selectedFiles)
      return response.images || response.urls || []
    } catch (err) {
      throw new Error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!tool) return

    try {
      await api.deleteImage(tool.id.toString(), imageUrl)
      setFormData(prev => ({
        ...prev,
        images: prev.images?.filter(img => img !== imageUrl) || []
      }))
    } catch (err) {
      setError('Failed to delete image')
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {}

    if (!formData.name.trim()) {
      errors.name = ['Tool name is required']
    }

    if (!formData.link.trim()) {
      errors.link = ['Tool link is required']
    } else {
      try {
        new URL(formData.link)
      } catch {
        errors.link = ['Please enter a valid URL']
      }
    }

    if (!formData.description.trim()) {
      errors.description = ['Description is required']
    }

    if (!formData.usage.trim()) {
      errors.usage = ['Usage instructions are required']
    }

    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      errors.rating = ['Rating must be between 0 and 5']
    }

    if (formData.video_links && formData.video_links.length > 0) {
      const invalidUrls = formData.video_links.filter(url => {
        try {
          new URL(url)
          return false
        } catch {
          return true
        }
      })
      if (invalidUrls.length > 0) {
        errors.video_links = ['All video links must be valid URLs']
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationErrors({})

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const uploadedUrls = await uploadImages()
      const submitData = {
        ...formData,
        images: [...(formData.images || []), ...uploadedUrls],
      }

      if (tool) {
        await api.updateTool(tool.id.toString(), submitData)
        addToast(`Tool "${formData.name}" updated successfully!`, 'success')
      } else {
        await api.createTool(submitData)
        addToast(`Tool "${formData.name}" added successfully!`, 'success')
      }

      onSuccess()
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors)
        addToast('Please fix the form errors', 'error')
      } else {
        const errorMessage = err.message || 'Failed to save tool'
        setError(errorMessage)
        addToast(errorMessage, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">{tool ? '✏️' : '➕'}</span>
              {tool ? 'Edit Tool' : 'Add New Tool'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              <p className="font-medium mb-2 flex items-center">
                <span className="mr-2">❌</span>
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  errors.map((error, index) => (
                    <li key={`${field}-${index}`}>{error}</li>
                  ))
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  validationErrors.name
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link *
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documentation
              </label>
              <input
                type="text"
                name="documentation"
                value={formData.documentation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usage Instructions *
              </label>
              <textarea
                name="usage"
                value={formData.usage}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Examples
              </label>
              <textarea
                name="examples"
                value={formData.examples}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <MultiSelectWithAdd
              label="Categories"
              options={categories}
              selectedValues={formData.categories || []}
              onSelectionChange={handleCategoriesChange}
              onNewOptionAdded={handleNewCategory}
              createFunction={api.createCategory}
              placeholder="Select categories..."
            />

            <MultiSelectWithAdd
              label="Roles"
              options={roles}
              selectedValues={formData.roles || []}
              onSelectionChange={handleRolesChange}
              onNewOptionAdded={handleNewRole}
              createFunction={api.createRole}
              placeholder="Select roles..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={handleTagsChange}
                placeholder="react, javascript, frontend"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select difficulty...</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Links (one per line)
              </label>
              <textarea
                value={formData.video_links?.join('\n') || ''}
                onChange={handleVideoLinksChange}
                placeholder="https://youtube.com/watch?v=example1&#10;https://vimeo.com/example2"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating (0-5)
              </label>
              <div className="flex items-center gap-4">
                {/* Star Rating Component */}
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className={`w-8 h-8 ${
                        star <= (formData.rating || 0)
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
                      } transition-colors`}
                    >
                      <svg
                        className="w-full h-full"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {formData.rating ? `${formData.rating}/5` : 'No rating'}
                  </span>
                </div>
                {/* Numeric Input for Precise Values */}
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || ''}
                  onChange={handleInputChange}
                  placeholder="4.4"
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click stars for whole numbers or use the input field for decimal ratings (e.g., 4.4)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images (max 5)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.images && formData.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="flex gap-2 flex-wrap">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${image}`}
                        alt="Tool screenshot"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="mr-2">{tool ? '💾' : '✨'}</span>
                    {tool ? 'Update Tool' : 'Create Tool'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}