const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }


  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token')

    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getTools(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/tools?${queryString}` : '/api/tools'

    return this.request(endpoint)
  }

  async getCurrentUser() {
    return this.request('/api/user')
  }

  async getTool(id: string) {
    return this.request(`/api/tools/${id}`)
  }

  async createTool(toolData: any) {
    return this.request('/api/tools', {
      method: 'POST',
      body: JSON.stringify(toolData),
    })
  }

  async updateTool(id: string, toolData: any) {
    return this.request(`/api/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toolData),
    })
  }

  async deleteTool(id: string) {
    return this.request(`/api/tools/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadImages(images: FileList) {
    const token = localStorage.getItem('auth_token')
    const formData = new FormData()
    Array.from(images).forEach(image => {
      formData.append('images[]', image)
    })

    return fetch(`${this.baseURL}/api/tools/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
      return response.json()
    })
  }

  async deleteImage(toolId: string, imageUrl: string) {
    return this.request('/api/tools/images', {
      method: 'DELETE',
      body: JSON.stringify({ tool_id: toolId, image_url: imageUrl }),
    })
  }

  // Helper methods
  async getCategories() {
    return this.request('/api/categories')
  }

  async getRoles() {
    return this.request('/api/roles')
  }

  async createCategory(name: string) {
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async createRole(name: string) {
    return this.request('/api/roles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

}

export const api = new ApiClient(API_BASE_URL)
export default api