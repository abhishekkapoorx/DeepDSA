'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Globe, Shield, Database, Bell, Palette, Server } from 'lucide-react'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Platform Settings
    siteName: 'LeetCode Clone',
    siteDescription: 'Master coding interviews with our comprehensive problem set',
    allowRegistration: true,
    maintenanceMode: false,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 24, // hours
    requireEmailVerification: true,
    twoFactorAuth: false,
    
    // Problem Settings
    defaultDifficulty: 'MEDIUM',
    autoPublish: false,
    allowGuestView: true,
    maxProblemsPerUser: 0, // 0 = unlimited
    
    // Notification Settings
    emailNotifications: true,
    webhookNotifications: false,
    slackIntegration: false,
    
    // System Settings
    cacheEnabled: true,
    rateLimitEnabled: true,
    debugMode: false,
    logLevel: 'INFO'
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Here you would typically save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">Configure your platform settings</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Platform Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Platform Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Default Problem Difficulty
                </label>
                <select
                  value={settings.defaultDifficulty}
                  onChange={(e) => updateSetting('defaultDifficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => updateSetting('allowRegistration', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Allow new user registration</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Maintenance mode</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowGuestView}
                    onChange={(e) => updateSetting('allowGuestView', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Allow guests to view problems</span>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Require email verification</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Enable two-factor authentication</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                  className="rounded border-border mr-2"
                />
                <span className="text-sm text-foreground">Email notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.webhookNotifications}
                  onChange={(e) => updateSetting('webhookNotifications', e.target.checked)}
                  className="rounded border-border mr-2"
                />
                <span className="text-sm text-foreground">Webhook notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.slackIntegration}
                  onChange={(e) => updateSetting('slackIntegration', e.target.checked)}
                  className="rounded border-border mr-2"
                />
                <span className="text-sm text-foreground">Slack integration</span>
              </label>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              System Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Log Level
                </label>
                <select
                  value={settings.logLevel}
                  onChange={(e) => updateSetting('logLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ERROR">Error</option>
                  <option value="WARN">Warning</option>
                  <option value="INFO">Info</option>
                  <option value="DEBUG">Debug</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Problems Per User (0 = unlimited)
                </label>
                <input
                  type="number"
                  value={settings.maxProblemsPerUser}
                  onChange={(e) => updateSetting('maxProblemsPerUser', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled}
                    onChange={(e) => updateSetting('cacheEnabled', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Enable caching</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.rateLimitEnabled}
                    onChange={(e) => updateSetting('rateLimitEnabled', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Enable rate limiting</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.debugMode}
                    onChange={(e) => updateSetting('debugMode', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Debug mode</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoPublish}
                    onChange={(e) => updateSetting('autoPublish', e.target.checked)}
                    className="rounded border-border mr-2"
                  />
                  <span className="text-sm text-foreground">Auto-publish new problems</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage