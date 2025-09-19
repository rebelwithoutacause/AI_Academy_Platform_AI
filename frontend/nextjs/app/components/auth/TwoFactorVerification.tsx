'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Loader2, Mail, MessageCircle, Smartphone, RefreshCw } from 'lucide-react'

interface TwoFactorVerificationProps {
  method: string
  email: string
  onVerify: (code: string, rememberDevice?: boolean) => void
  onResend?: () => void
  loading?: boolean
  error?: string
  showRememberDevice?: boolean
}

export function TwoFactorVerification({
  method,
  email,
  onVerify,
  onResend,
  loading = false,
  error,
  showRememberDevice = false
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-format 6-digit code
  const handleCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setCode(digits)

    // Auto-submit when 6 digits are entered (for TOTP)
    if (digits.length === 6 && method === 'totp') {
      handleSubmit(digits)
    }
  }

  const handleSubmit = (codeToSubmit: string = code) => {
    if (codeToSubmit.length === 6) {
      onVerify(codeToSubmit, rememberDevice)
    }
  }

  const handleResend = () => {
    if (onResend && resendCooldown === 0) {
      onResend()
      setResendCooldown(30) // 30 second cooldown
    }
  }

  // Get method-specific UI content
  const getMethodConfig = () => {
    switch (method) {
      case 'email':
        return {
          icon: <Mail className="w-6 h-6" />,
          emoji: '📧',
          title: 'Email Verification',
          description: `We've sent a 6-digit code to ${email}`,
          placeholder: '000000',
          helpText: 'Check your email inbox and enter the verification code'
        }
      case 'telegram':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          emoji: '📱',
          title: 'Telegram Verification',
          description: 'Check your Telegram app for the verification code',
          placeholder: '000000',
          helpText: 'Open Telegram and enter the 6-digit code we sent you'
        }
      case 'totp':
        return {
          icon: <Smartphone className="w-6 h-6" />,
          emoji: '🔐',
          title: 'Authenticator App',
          description: 'Enter the code from your authenticator app',
          placeholder: '000000',
          helpText: 'Open Google Authenticator, Authy, or similar app'
        }
      default:
        return {
          icon: <Smartphone className="w-6 h-6" />,
          emoji: '🔐',
          title: '2-Factor Authentication',
          description: 'Enter your verification code',
          placeholder: '000000',
          helpText: 'Enter the 6-digit verification code'
        }
    }
  }

  const config = getMethodConfig()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="text-4xl mb-2">{config.emoji}</div>
        <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
          {config.description}
        </CardDescription>
        <Badge variant="outline" className="mx-auto w-fit">
          {method.toUpperCase()} Authentication
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            ref={inputRef}
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={config.placeholder}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
            disabled={loading}
            autoComplete="one-time-code"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {config.helpText}
          </p>
        </div>

        {showRememberDevice && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember-device"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Label htmlFor="remember-device" className="text-sm text-gray-700 dark:text-gray-300">
              Remember this device for 30 days
            </Label>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          {onResend && method !== 'totp' && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="w-full"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Code'
              }
            </Button>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Code expires in 5 minutes</p>
          {method === 'totp' && (
            <p>Codes refresh every 30 seconds</p>
          )}
        </div>

        {method === 'totp' && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Tip:</strong> Your code will be verified automatically when you enter all 6 digits
            </p>
          </div>
        )}

        {method === 'email' && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              📮 <strong>Can't find the email?</strong> Check your spam folder or click resend
            </p>
          </div>
        )}

        {method === 'telegram' && (
          <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
            <p className="text-purple-800 dark:text-purple-200 text-sm">
              💬 <strong>Telegram tip:</strong> Make sure notifications are enabled for our bot
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}