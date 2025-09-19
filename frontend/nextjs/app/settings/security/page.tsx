'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { TwoFactorSettings } from '../../components/profile/TwoFactorSettings'
import {
  Shield,
  Key,
  Clock,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { User } from '../../lib/types'

export default function SecurityPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Security logs
  const [securityLogs, setSecurityLogs] = useState<any[]>([])

  useEffect(() => {
    fetchUserData()
    fetchSecurityLogs()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (err) {
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSecurityLogs = async () => {
    try {
      const response = await fetch('/api/auth/security-logs')
      if (response.ok) {
        const logs = await response.json()
        setSecurityLogs(logs.slice(0, 10)) // Show last 10 events
      }
    } catch (err) {
      // Security logs are optional
      console.warn('Could not fetch security logs:', err)
    }
  }

  const handleUserUpdate = async (updates: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setSuccess('Profile updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setChangingPassword(false)
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      setChangingPassword(false)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        setSuccess('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Failed to change password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading security settings...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load user data. Please refresh the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and authentication settings
        </p>
      </div>

      {/* Global Messages */}
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

      <div className="grid gap-6">
        {/* Password Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Password
            </CardTitle>
            <CardDescription>
              Change your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <TwoFactorSettings user={user} onUpdate={handleUserUpdate} />

        {/* Security Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Security Activity
            </CardTitle>
            <CardDescription>
              Monitor recent login attempts and security events on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityLogs.length > 0 ? (
              <div className="space-y-3">
                {securityLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === 'login_success' ? 'bg-green-500' :
                        log.type === 'login_failed' ? 'bg-red-500' :
                        log.type === '2fa_enabled' ? 'bg-blue-500' :
                        log.type === '2fa_disabled' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{log.description || log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.ip_address && `IP: ${log.ip_address} • `}
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      log.type === 'login_success' ? 'default' :
                      log.type === 'login_failed' ? 'destructive' :
                      'secondary'
                    }>
                      {log.type?.replace('_', ' ').toUpperCase() || 'ACTIVITY'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent security activity found</p>
                <p className="text-sm">Security events will appear here when they occur</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Status
            </CardTitle>
            <CardDescription>
              Overview of your account security configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Password Protection</span>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${user.two_fa_enabled ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span>Two-Factor Authentication</span>
                </div>
                <Badge variant={user.two_fa_enabled ? 'default' : 'secondary'}>
                  {user.two_fa_enabled ? `Enabled (${user.two_fa_method?.toUpperCase()})` : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Secure Connection</span>
                </div>
                <Badge variant="default">HTTPS Enabled</Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Security Score:</strong> {user.two_fa_enabled ? '95' : '75'}/100
              </p>
              {!user.two_fa_enabled && (
                <p className="text-orange-600">
                  💡 Enable two-factor authentication to improve your security score
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}