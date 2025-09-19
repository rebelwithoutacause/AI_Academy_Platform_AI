import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginForm from '../../../app/components/LoginForm'

// Mock the onLogin function
const mockOnLogin = jest.fn()

describe('LoginForm Component', () => {
  beforeEach(() => {
    mockOnLogin.mockClear()
  })

  test('renders login form with all elements', () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the AI Tools Platform')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('displays demo accounts section', () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    expect(screen.getByText('Demo Accounts')).toBeInTheDocument()
    expect(screen.getByText('Use these accounts to test the platform:')).toBeInTheDocument()
    expect(screen.getByText('ivan@admin.local')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  test('shows password prominently in demo section', () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    expect(screen.getByText(/default password for all accounts/i)).toBeInTheDocument()
    expect(screen.getByText('password')).toBeInTheDocument()
  })

  test('validates email format', async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  test('requires password field', async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  test('calls onLogin with correct credentials', async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  test('use account button fills form correctly', async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    const useAccountButtons = screen.getAllByText('Use Account')
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    fireEvent.click(useAccountButtons[0]) // Click first "Use Account" button

    await waitFor(() => {
      expect(emailInput.value).toBe('ivan@admin.local')
      expect(passwordInput.value).toBe('password')
    })
  })

  test('displays error message when login fails', async () => {
    const mockOnLoginWithError = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
    render(<LoginForm onLogin={mockOnLoginWithError} />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})