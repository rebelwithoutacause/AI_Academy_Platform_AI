// Centralized user configuration for consistent authentication across all pages

export interface DemoUser {
  id: number
  name: string
  email: string
  role: string
  role_display: string
  token: string
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'ivan.ivanov@company.com': {
    id: 1,
    name: 'Ivan Ivanov',
    email: 'ivan.ivanov@company.com',
    role: 'owner',
    role_display: 'Owner',
    token: 'mock-token-ivan'
  },
  'ana.petkova@company.com': {
    id: 2,
    name: 'Ana Petkova',
    email: 'ana.petkova@company.com',
    role: 'user',
    role_display: 'Product Manager',
    token: 'mock-token-ana'
  },
  'stefan.nikolov@company.com': {
    id: 3,
    name: 'Stefan Nikolov',
    email: 'stefan.nikolov@company.com',
    role: 'user',
    role_display: 'UI/UX Designer',
    token: 'mock-token-stefan'
  },
  'peter.georgiev@company.com': {
    id: 4,
    name: 'Peter Georgiev',
    email: 'peter.georgiev@company.com',
    role: 'user',
    role_display: 'Data Analyst',
    token: 'mock-token-peter'
  }
}

// Get user by email
export function getDemoUserByEmail(email: string): DemoUser | null {
  return DEMO_USERS[email] || null
}

// Get user by token
export function getDemoUserByToken(token: string): DemoUser | null {
  return Object.values(DEMO_USERS).find(user => user.token === token) || null
}

// Validate login credentials
export function validateDemoLogin(email: string, password: string): DemoUser | null {
  if (password !== 'password') return null
  return getDemoUserByEmail(email)
}

// Convert demo user to app user format
export function convertToAppUser(demoUser: DemoUser) {
  return {
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email,
    role: demoUser.role,
    role_display: demoUser.role_display,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
}