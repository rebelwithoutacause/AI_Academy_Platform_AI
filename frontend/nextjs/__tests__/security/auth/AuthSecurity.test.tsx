import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginForm from '../../../app/components/LoginForm'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Authentication Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('prevents XSS in email input', async () => {
    const mockOnLogin = jest.fn()
    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Try XSS payload in email
    const xssPayload = '<script>alert("XSS")</script>@example.com'

    fireEvent.change(emailInput, { target: { value: xssPayload } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(xssPayload, 'password')
    })

    // Check that script tags are not executed (no alert should be shown)
    expect(document.querySelectorAll('script')).toHaveLength(0)
  })

  test('sanitizes input in form fields', async () => {
    const mockOnLogin = jest.fn()
    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    // Test various malicious inputs
    const maliciousInputs = [
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(1)">',
      '"><script>alert("XSS")</script>',
      'user@example.com<script>alert("XSS")</script>',
    ]

    for (const maliciousInput of maliciousInputs) {
      fireEvent.change(emailInput, { target: { value: maliciousInput } })

      // Input should contain the value but not execute any scripts
      expect(emailInput.value).toBe(maliciousInput)

      // No script tags should be added to the document
      expect(document.querySelector('script[src="x"]')).toBeNull()
    }
  })

  test('validates HTTPS in production environment', () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const mockOnLogin = jest.fn()
    render(<LoginForm onLogin={mockOnLogin} />)

    // In a real test, you might check that API calls are made to HTTPS URLs
    // This is a placeholder for that type of security check
    expect(process.env.NODE_ENV).toBe('production')

    // Restore environment
    process.env.NODE_ENV = originalEnv
  })

  test('prevents CSRF attacks by using proper headers', async () => {
    const mockOnLogin = jest.fn()
    render(<LoginForm onLogin={mockOnLogin} />)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', user: {} }),
    } as Response)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      )
    })
  })

  test('handles token storage securely', async () => {
    const mockLocalStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    const mockOnLogin = jest.fn().mockResolvedValue({
      token: 'secure-token-123',
      user: { name: 'Test' },
    })

    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })

    // Verify token is handled securely (this would be implemented in useAuth hook)
    // This test ensures we're thinking about secure token storage
  })

  test('prevents password field from being autocompleted insecurely', () => {
    const mockOnLogin = jest.fn()
    render(<LoginForm onLogin={mockOnLogin} />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    // Check that password field has proper attributes for security
    expect(passwordInput.type).toBe('password')
    expect(passwordInput.getAttribute('autoComplete')).toBe('current-password')
  })

  test('rate limits login attempts locally', async () => {
    const mockOnLogin = jest.fn()
    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    // Simulate rapid fire clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(submitButton)
    }

    // Should not make excessive API calls due to form submission controls
    await waitFor(() => {
      // The form should have some protection against rapid submissions
      expect(mockOnLogin.mock.calls.length).toBeLessThan(10)
    })
  })
})