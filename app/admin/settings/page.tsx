"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Activity, Users, Calendar, FileText, Settings, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { AdminService } from "@/lib/services/admin-service"

interface SystemSettings {
  systemName: string
  supportEmail: string
  maxAppointmentsPerDay: string
  enableNotifications: boolean
  enableEmailAlerts: boolean
  enableSMSAlerts: boolean
  maintenanceMode: boolean
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: "Lifeline Healthcare System",
    supportEmail: "support@lifeline.com",
    maxAppointmentsPerDay: "50",
    enableNotifications: true,
    enableEmailAlerts: true,
    enableSMSAlerts: false,
    maintenanceMode: false,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        // In a real implementation, you would fetch settings from an API
        // For now, we'll use the default settings
        // If there were real API endpoints, you would call them here
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast.error("Failed to fetch settings")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSettings()
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real implementation, you would save settings to an API
      // For now, we'll just simulate a save operation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">System Settings</h1>
            <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAppointments">Max Appointments Per Day</Label>
              <Input
                id="maxAppointments"
                type="number"
                value={settings.maxAppointmentsPerDay}
                onChange={(e) => setSettings({ ...settings, maxAppointmentsPerDay: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications to users</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Send email notifications</p>
              </div>
              <Switch
                checked={settings.enableEmailAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, enableEmailAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Send SMS notifications</p>
              </div>
              <Switch
                checked={settings.enableSMSAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, enableSMSAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>System-wide maintenance options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable system access</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}