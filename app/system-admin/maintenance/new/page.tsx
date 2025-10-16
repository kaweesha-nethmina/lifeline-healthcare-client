"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Wrench, Database, HardDrive } from "lucide-react"
import { SystemAdminService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function SystemMaintenancePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    maintenanceType: "",
    details: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await SystemAdminService.performMaintenance({
        maintenance_type: formData.maintenanceType,
        details: formData.details,
      })
      
      if (response) {
        setSuccess(true)
        // Reset form
        setFormData({
          maintenanceType: "",
          details: "",
        })
        
        // Redirect to system admin dashboard after 2 seconds
        setTimeout(() => {
          router.push("/system-admin/dashboard")
        }, 2000)
      }
    } catch (err) {
      console.error("Error performing system maintenance:", err)
      setError(err instanceof Error ? err.message : "Failed to perform system maintenance. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="system_admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">System Maintenance</h1>
          <p className="text-muted-foreground mt-1">Perform system maintenance tasks</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">System maintenance performed successfully!</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Details</CardTitle>
            <CardDescription>Enter the details for the maintenance task</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maintenanceType">Maintenance Type</Label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maintenanceType"
                    placeholder="Enter maintenance type (e.g., backup, update, cleanup)"
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <div className="relative">
                  <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="details"
                    placeholder="Enter maintenance details"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="pl-10"
                    rows={4}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Perform Maintenance"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/system-admin/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}