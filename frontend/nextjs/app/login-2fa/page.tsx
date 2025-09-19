'use client'

import { useState } from 'react'
import { users, defaultPassword, mockCode } from '../../data/users'

export default function Login2FA() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selected2FA, setSelected2FA] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [step, setStep] = useState('login') // 'login', '2fa', 'success'
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    // Find user by email
    const user = users.find(u => u.email === email)

    if (!user) {
      setError('Email not found')
      return
    }

    if (password !== defaultPassword) {
      setError('Invalid password')
      return
    }

    // Login successful, move to 2FA step
    setSelectedUser(user)
    setStep('2fa')
  }

  const handle2FA = (e) => {
    e.preventDefault()
    setError('')

    if (!selected2FA) {
      setError('Please select a 2FA method')
      return
    }

    if (!twoFACode) {
      setError('Please enter 2FA code')
      return
    }

    if (twoFACode !== mockCode) {
      setError('Invalid 2FA code. Try: 123456')
      return
    }

    // 2FA successful
    setStep('success')
  }

  const reset = () => {
    setEmail('')
    setPassword('')
    setSelectedUser(null)
    setSelected2FA('')
    setTwoFACode('')
    setStep('login')
    setError('')
  }

  const get2FAMethodName = (method) => {
    switch(method) {
      case 'email': return 'Email'
      case 'telegram': return 'Telegram'
      case 'googleauth': return 'Google Auth'
      default: return method
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔐 Secure Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'login' && 'Enter your credentials'}
            {step === '2fa' && 'Choose your 2FA method'}
            {step === 'success' && 'Login successful!'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-200 text-sm">❌ {error}</p>
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Try: tedd@example.com, john@example.com, or alice@example.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password: "password"
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        )}

        {step === '2fa' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Hello <strong>{selectedUser?.name}</strong>! Please choose your 2FA method:
              </p>
            </div>

            <form onSubmit={handle2FA} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  2FA Method
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Verify 2FA
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                Welcome, {selectedUser?.name}!
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                You logged in successfully using <strong>{get2FAMethodName(selected2FA)}</strong> 2FA.
              </p>
            </div>

            <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4">
              <p className="text-green-700 dark:text-green-200 text-sm">
                ✅ Authentication completed successfully!
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Login Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}