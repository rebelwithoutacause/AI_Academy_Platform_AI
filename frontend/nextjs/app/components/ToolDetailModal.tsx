'use client'

import { Tool } from '../lib/types'

interface ToolDetailModalProps {
  tool: Tool
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  canManage: boolean
}

export default function ToolDetailModal({ tool, onClose, onEdit, onDelete, canManage }: ToolDetailModalProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const createdBy = tool.created_by && typeof tool.created_by === 'object'
    ? tool.created_by
    : tool.createdBy

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{tool.name}</h2>
                {tool.difficulty_level && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(tool.difficulty_level)}`}>
                    {tool.difficulty_level}
                  </span>
                )}
                {tool.rating && parseFloat(tool.rating.toString()) > 0 && (
                  <span className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    ★ {parseFloat(tool.rating.toString()).toFixed(1)}
                  </span>
                )}
              </div>

              {createdBy && (
                <p className="text-sm text-gray-500">
                  Created by {createdBy.name} on {new Date(tool.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {canManage && onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
              {canManage && onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{tool.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h3>
                <p className="text-gray-700 whitespace-pre-line">{tool.usage}</p>
              </div>

              {tool.examples && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Examples</h3>
                  <p className="text-gray-700 whitespace-pre-line">{tool.examples}</p>
                </div>
              )}

              {/* Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Links</h3>
                <div className="space-y-2">
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    🔗 Official Website
                  </a>
                  {tool.documentation && (
                    <a
                      href={tool.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      📚 Documentation
                    </a>
                  )}
                </div>
              </div>

              {/* Video Links */}
              {tool.video_links && tool.video_links.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h3>
                  <div className="space-y-2">
                    {tool.video_links.map((video, index) => (
                      <a
                        key={index}
                        href={video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-red-600 hover:text-red-800"
                      >
                        📹 Video Tutorial {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Images */}
              {tool.images && tool.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Screenshots</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tool.images.map((image, index) => (
                      <img
                        key={index}
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${image}`}
                        alt={`${tool.name} screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded border cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/storage/${image}`, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {tool.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles */}
              {tool.roles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tool.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Created:</strong> {new Date(tool.created_at).toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(tool.updated_at).toLocaleString()}</p>
                  {createdBy && (
                    <p><strong>Creator:</strong> {createdBy.name} ({createdBy.email})</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}