export interface User {
  id: number
  name: string
  email: string
  role: string
  role_display: string
  role_color: string
  phone?: string
  department?: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  two_fa_enabled?: boolean
  two_fa_method?: 'email' | 'telegram' | 'totp'
  two_fa_secret?: string
  telegram_chat_id?: string
}

export interface Category {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Role {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Tag {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Tool {
  id: number
  name: string
  link: string
  tool_url?: string
  documentation?: string
  docs_url?: string
  description: string
  usage?: string
  examples?: string
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced'
  level?: string
  video_links?: string[]
  rating?: number
  images?: string[]
  created_by: number | User
  created_at: string
  updated_at: string
  createdBy?: User
  categories: Category[]
  roles: Role[]
  tags: Tag[]
  usage_count?: number
  category?: string
}

export interface ToolFilters {
  search?: string
  category?: string
  role?: string
  tag?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  min_rating?: number
  has_videos?: boolean
  sort_by?: 'created_at' | 'name' | 'rating' | 'difficulty_level'
  sort_order?: 'asc' | 'desc'
  per_page?: number
}

export interface CreateToolData {
  name: string
  link: string
  documentation?: string
  description: string
  usage: string
  examples?: string
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced'
  video_links?: string[]
  rating?: number
  images?: string[]
  categories?: number[]
  roles?: number[]
  tags?: string[]
}

export interface FilterOptions {
  categories: Category[]
  roles: Role[]
  tags: Tag[]
  difficulty_levels: string[]
  sort_options: { value: string; label: string }[]
}