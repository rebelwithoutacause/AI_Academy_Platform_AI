'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tool {
  id: number
  name: string
  description: string
  link: string
  documentation?: string
  difficulty_level?: string
  rating?: number
}

export default function PublicToolsPreview() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPublicTools()
  }, [])

  const fetchPublicTools = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('Fetching from:', `${apiUrl}/api/tools?per_page=6`)

      const response = await fetch(`${apiUrl}/api/tools?per_page=6`)
      if (response.ok) {
        const data = await response.json()
        const toolsData = data.data || data
        setTools(toolsData)
      } else {
        console.error('API response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🤖 Available AI Tools
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Discover powerful AI tools and services to enhance your productivity
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool) => (
          <div key={tool.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
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

            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{tool.description}</p>

            {tool.rating && parseFloat(tool.rating.toString()) > 0 && (
              <div className="mb-3">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                  {parseFloat(tool.rating.toString()).toFixed(1)}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded text-center hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                Use Tool
              </a>
              {tool.documentation && (
                <a
                  href={tool.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white text-sm rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Docs
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push('/tools')}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          View All AI Tools
        </button>
      </div>
    </div>
  )
}