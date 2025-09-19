'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Loader2,
  Mail,
  MessageCircle,
  Smartphone,
  QrCode,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react'
import { User } from '../../lib/types'

interface TwoFactorSettingsProps {
  user: User
  onUpdate: (updates: Partial<User>) => Promise<void>
}

interface TOTPSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export function TwoFactorSettings({ user, onUpdate }: TwoFactorSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 2FA Enable/Disable
  const [twoFAEnabled, setTwoFAEnabled] = useState(user.two_fa_enabled || false)
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'telegram' | 'totp'>(
    user.two_fa_method || 'email'
  )

  // Telegram setup
  const [telegramChatId, setTelegramChatId] = useState(user.telegram_chat_id || '')

  // TOTP setup
  const [totpSetup, setTotpSetup] = useState<TOTPSetup | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  const handle2FAToggle = async (enabled: boolean) => {
    if (!enabled) {
      // Disable 2FA
      setLoading(true)
      try {
        const response = await fetch('/api/2fa/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          setTwoFAEnabled(false)
          setSuccess('Two-factor authentication disabled')
          await onUpdate({
            two_fa_enabled: false,
            two_fa_method: undefined,
            two_fa_secret: undefined
          })
        } else {
          throw new Error('Failed to disable 2FA')
        }
      } catch (err) {
        setError('Failed to disable 2FA')
      }
      setLoading(false)
    } else {
      // Enable 2FA - show setup
      setShowSetup(true)
    }
  }

  const handleEnable2FA = async () => {
    setLoading(true)
    setError('')

    try {
      const payload: any = {
        method: selectedMethod
      }

      if (selectedMethod === 'telegram') {
        if (!telegramChatId) {
          throw new Error('Telegram Chat ID is required')
        }
        payload.telegramChatId = telegramChatId
      }

      if (selectedMethod === 'totp') {
        if (!verificationCode) {
          throw new Error('Verification code is required')
        }
        payload.totpToken = verificationCode
        payload.secret = totpSetup?.secret
      }

      const response = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        setTwoFAEnabled(true)
        setShowSetup(false)
        setSuccess(`Two-factor authentication enabled via ${selectedMethod}`)

        await onUpdate({
          two_fa_enabled: true,
          two_fa_method: selectedMethod,
          ...(selectedMethod === 'telegram' && { telegram_chat_id: telegramChatId }),
          ...(selectedMethod === 'totp' && { two_fa_secret: totpSetup?.secret })
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to enable 2FA')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA')
    }

    setLoading(false)
  }

  const setupTOTP = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/2fa/setup/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setTotpSetup(data)
      } else {
        throw new Error('Failed to setup TOTP')
      }
    } catch (err) {
      setError('Failed to setup TOTP')
    }
    setLoading(false)
  }

  const copySecret = async () => {
    if (totpSetup?.secret) {
      await navigator.clipboard.writeText(totpSetup.secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const sendTestCode = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/2fa/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setSuccess('Test code sent!')
      } else {
        throw new Error('Failed to send test code')
      }
    } catch (err) {
      setError('Failed to send test code')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (selectedMethod === 'totp' && showSetup && !totpSetup) {
      setupTOTP()
    }
  }, [selectedMethod, showSetup, totpSetup])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {twoFAEnabled ? (
              <ShieldCheck className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <h3 className="font-medium">
                Two-Factor Authentication is {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </h3>
              {twoFAEnabled && user.two_fa_method && (
                <p className="text-sm text-muted-foreground">
                  Method: <Badge variant="outline">{user.two_fa_method.toUpperCase()}</Badge>
                </p>
              )}
            </div>
          </div>
          <Switch
            checked={twoFAEnabled}
            onCheckedChange={handle2FAToggle}
            disabled={loading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* Setup Process */}
        {showSetup && !twoFAEnabled && (
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-medium">Enable Two-Factor Authentication</h3>

            <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="telegram" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Telegram
                </TabsTrigger>
                <TabsTrigger value="totp" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Authenticator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Verification codes will be sent to your email: <strong>{user.email}</strong>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="telegram" className="space-y-4">
                <Alert>
                  <MessageCircle className="h-4 w-4" />
                  <AlertDescription>
                    You'll need to provide your Telegram Chat ID to receive codes via Telegram.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="telegram-chat-id">Telegram Chat ID</Label>
                  <Input
                    id="telegram-chat-id"
                    placeholder="Enter your Telegram Chat ID"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    To get your Chat ID, message @userinfobot on Telegram
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="totp" className="space-y-4">
                {totpSetup ? (
                  <div className="space-y-4">
                    <Alert>
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                      </AlertDescription>
                    </Alert>

                    <div className="flex flex-col items-center space-y-4">
                      {/* QR Code */}
                      <div className="p-4 border rounded-lg bg-white">
                        <img
                          src={totpSetup.qrCode}
                          alt="TOTP QR Code"
                          className="w-48 h-48"
                        />
                      </div>

                      {/* Manual Entry */}
                      <div className="w-full">
                        <Label>Manual Entry Key</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={totpSetup.secret}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copySecret}
                          >
                            {copiedSecret ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Verification */}
                      <div className="w-full space-y-2">
                        <Label htmlFor="totp-code">Verification Code</Label>
                        <Input
                          id="totp-code"
                          placeholder="Enter 6-digit code from your app"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Setting up TOTP...</span>
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button
                onClick={handleEnable2FA}
                disabled={
                  loading ||
                  (selectedMethod === 'telegram' && !telegramChatId) ||
                  (selectedMethod === 'totp' && (!verificationCode || verificationCode.length !== 6))
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Enable 2FA'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSetup(false)
                  setTotpSetup(null)
                  setVerificationCode('')
                  setError('')
                  setSuccess('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Test 2FA (when enabled) */}
        {twoFAEnabled && user.two_fa_method && user.two_fa_method !== 'totp' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Test Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send a test verification code to ensure 2FA is working correctly.
            </p>
            <Button onClick={sendTestCode} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test Code'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}