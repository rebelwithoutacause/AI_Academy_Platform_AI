'use client'

import { useState } from 'react'
import { Tool } from '../lib/types'
import { mockComments } from '../../data/comments'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(mockComments[tool.id] || [])
  const [isAddingComment, setIsAddingComment] = useState(false)

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: "Current User",
        avatar: "👤",
        comment: newComment.trim(),
        timestamp: "Just now",
        likes: 0
      }
      setComments([comment, ...comments])
      setNewComment('')
      setIsAddingComment(false)
    }
  }

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {tool.description}
            </p>
          </div>
          {(tool.difficulty_level || tool.level) && (
            <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(tool.difficulty_level || tool.level)}`}>
              {tool.difficulty_level || tool.level}
            </span>
          )}
        </div>

        {/* Rating */}
        {(tool.rating !== undefined && tool.rating !== null) && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= parseFloat(tool.rating.toString())
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                ({parseFloat(tool.rating.toString()).toFixed(1)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tags and Categories - This section will grow to fill available space */}
      <div className="p-6 space-y-3 flex-grow">
        {tool.categories.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Categories
            </h4>
            <div className="flex flex-wrap gap-1">
              {tool.categories.slice(0, 3).map((category) => (
                <span
                  key={category.id || category}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                >
                  {category.name || category}
                </span>
              ))}
              {tool.categories.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{tool.categories.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {tool.roles.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Roles
            </h4>
            <div className="flex flex-wrap gap-1">
              {tool.roles.slice(0, 3).map((role) => (
                <span
                  key={role.id || role}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md"
                >
                  {role.name || role}
                </span>
              ))}
              {tool.roles.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{tool.roles.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {tool.tags && tool.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id || tag}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                >
                  {tag.name || tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">{comments.length} Comments</span>
            <span className={`transform transition-transform ${showComments ? 'rotate-180' : ''}`}>
              ⬇️
            </span>
          </button>
          {!isAddingComment && (
            <button
              onClick={() => setIsAddingComment(true)}
              className="text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded transition-colors"
            >
              Add Comment
            </button>
          )}
        </div>

        {isAddingComment && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this tool..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => {
                  setIsAddingComment(false)
                  setNewComment('')
                }}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>
        )}

        {showComments && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{comment.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.user}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.comment}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>👍</span>
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Links Section - Always at bottom */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 mt-auto">
        <div className="space-y-2">
          {/* Official Website Link */}
          {(tool.link || tool.tool_url || tool.official_link) ? (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-blue-600 dark:text-blue-400" aria-label="Official Website">🌐</span>
              <a
                href={tool.link || tool.tool_url || tool.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors"
              >
                Official Website
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-gray-400" aria-label="Official Website">🌐</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Official Website: Not available
              </span>
            </div>
          )}

          {/* Documentation Link */}
          {(tool.docs_url || tool.documentation) ? (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-blue-600 dark:text-blue-400" aria-label="Documentation">📄</span>
              <a
                href={tool.docs_url || tool.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors"
              >
                Documentation
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-gray-400" aria-label="Documentation">📄</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Documentation: Not available
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}