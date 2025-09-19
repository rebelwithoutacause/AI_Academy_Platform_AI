import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../../../app/page'

// Mock the fetch function
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  test('complete login flow works correctly', async () => {
    // Mock successful login API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'owner',
          role_display: 'Owner',
          role_color: 'green',
        },
        token: 'mock-token-123',
        message: 'Login successful',
      }),
    } as Response)

    render(<Home />)

    // Should show login form initially
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()

    // Fill in login form
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(loginButton)

    // Wait for login to complete and dashboard to show
    await waitFor(() => {
      expect(screen.getByText(/welcome, test user/i)).toBeInTheDocument()
    })

    // Check that token was stored
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-token-123')

    // Check that user info is displayed
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  test('handles login failure correctly', async () => {
    // Mock failed login API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    } as Response)

    render(<Home />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Should still show login form
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()

    // Token should not be stored
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
  })

  test('logout flow works correctly', async () => {
    // Mock user token exists
    mockLocalStorage.getItem.mockReturnValue('existing-token')

    // Mock user API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'owner',
        role_display: 'Owner',
        role_color: 'green',
      }),
    } as Response)

    render(<Home />)

    // Should show dashboard for authenticated user
    await waitFor(() => {
      expect(screen.getByText(/welcome, test user/i)).toBeInTheDocument()
    })

    // Mock logout API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out successfully' }),
    } as Response)

    // Click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    // Should return to login form
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    // Token should be removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
  })

  test('auto-login with stored token works', async () => {
    // Mock stored token
    mockLocalStorage.getItem.mockReturnValue('stored-token')

    // Mock user API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: 'Auto Login User',
        email: 'auto@example.com',
        role: 'pm',
        role_display: 'Project Manager',
        role_color: 'orange',
      }),
    } as Response)

    render(<Home />)

    // Should automatically log in and show dashboard
    await waitFor(() => {
      expect(screen.getByText(/welcome, auto login user/i)).toBeInTheDocument()
    })

    expect(screen.getByText('auto@example.com')).toBeInTheDocument()
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
  })
})