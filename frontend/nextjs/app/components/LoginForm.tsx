'use client'

import { useState } from 'react'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('login') // 'login', '2fa', 'success'
  const [selected2FA, setSelected2FA] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [pendingUser, setPendingUser] = useState<any>(null)

  const mockCode = "123456"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First validate credentials with Laravel API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials')
      }

      // Store user data temporarily and move to 2FA step
      setPendingUser(data.user)
      setStep('2fa')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!selected2FA) {
        throw new Error('Please select a 2FA method')
      }

      if (!twoFACode) {
        throw new Error('Please enter 2FA code')
      }

      if (twoFACode !== mockCode) {
        throw new Error('Invalid 2FA code. Try: 123456')
      }

      // 2FA successful, proceed with actual login
      await onLogin(email, password)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid 2FA code')
      setLoading(false)
    }
  }

  const reset = () => {
    setEmail('')
    setPassword('')
    setStep('login')
    setSelected2FA('')
    setTwoFACode('')
    setPendingUser(null)
    setError('')
    setLoading(false)
  }

  const get2FAMethodName = (method: string) => {
    switch(method) {
      case 'email': return 'Email'
      case 'telegram': return 'Telegram'
      case 'googleauth': return 'Google Auth'
      default: return method
    }
  }


  const sampleUsers = [
    { name: 'Ivan Ivanov', email: 'ivan.ivanov@company.com', role: 'Owner • Admin', color: 'green' },
    { name: 'Elena Petrova', email: 'elena.petrova@company.com', role: 'Frontend Developer', color: 'blue' },
    { name: 'Peter Georgiev', email: 'peter.georgiev@company.com', role: 'Backend Developer', color: 'purple' },
    { name: 'Maria Dimitrova', email: 'maria.dimitrova@company.com', role: 'Project Manager', color: 'orange' },
    { name: 'Stefan Nikolov', email: 'stefan.nikolov@company.com', role: 'QA Engineer', color: 'red' },
    { name: 'Anna Petrova', email: 'anna.petrova@company.com', role: 'Designer', color: 'pink' },
  ]

  const getRoleColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      pink: 'bg-pink-100 text-pink-800 border-pink-300',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-300'
  }


  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700 transition-colors">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'login' && 'Welcome Back'}
              {step === '2fa' && '🔐 Two-Factor Authentication'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {step === 'login' && 'Sign in to access the AI Tools Platform'}
              {step === '2fa' && `Hello ${pendingUser?.name}! Please complete 2FA verification`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {step === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Choose your 2FA method:
                </label>

                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selected2FA === 'email'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="2fa"
                      value="email"
                      checked={selected2FA === 'email'}
                      onChange={(e) => setSelected2FA(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-2xl mr-3">📧</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Email</span>
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selected2FA === 'telegram'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="2fa"
                      value="telegram"
                      checked={selected2FA === 'telegram'}
                      onChange={(e) => setSelected2FA(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-2xl mr-3">✈️</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Telegram</span>
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selected2FA === 'googleauth'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="2fa"
                      value="googleauth"
                      checked={selected2FA === 'googleauth'}
                      onChange={(e) => setSelected2FA(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-2xl mr-3">🔒</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Google Auth</span>
                  </label>
                </div>
              </div>

              {selected2FA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    2FA Code
                  </label>
                  <input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    placeholder="Enter 2FA code"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mock code: "123456"
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify 2FA'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Demo Accounts */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
            {step === 'login' ? 'Demo Accounts' : '2FA Information'}
          </h3>
          {step === 'login' ? (
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">Use these accounts to test the platform:</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔐 2FA Test Code</h4>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Use code: <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded font-bold">123456</code>
                </p>
              </div>
              <div className="text-blue-700 dark:text-blue-300 text-sm">
                <p className="mb-2">✅ <strong>Email 📧:</strong> Mock email verification</p>
                <p className="mb-2">✅ <strong>Telegram ✈️:</strong> Mock Telegram bot</p>
                <p>✅ <strong>Google Auth 🔒:</strong> Mock authenticator app</p>
              </div>
            </div>
          )}
          {step === 'login' && (
            <>
              <div className="space-y-3">
                {sampleUsers.map((user, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border border-blue-200 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.email}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 border ${getRoleColorClass(user.color)}`}>
                          {user.role}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(user.email)
                          setPassword('password')
                        }}
                        className="text-xs bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 px-3 py-1 rounded transition-colors"
                      >
                        Use Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                  🔑 Default password for all accounts: <code className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded font-bold">password</code>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}