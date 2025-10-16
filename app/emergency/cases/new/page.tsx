"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, User, Hash, AlertTriangle } from "lucide-react"
import { EmergencyService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function LogEmergencyCasePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    patientId: "",
    emergencyType: "",
    resourceId: "",
    caseStatus: "pending",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await EmergencyService.logEmergencyCase({
        patient_id: parseInt(formData.patientId),
        emergency_type: formData.emergencyType,
        resource_id: parseInt(formData.resourceId),
        case_status: formData.caseStatus,
      })
      
      if (response) {
        setSuccess(true)
        // Reset form
        setFormData({
          patientId: "",
          emergencyType: "",
          resourceId: "",
          caseStatus: "pending",
        })
        
        // Redirect to emergency dashboard after 2 seconds
        setTimeout(() => {
          router.push("/emergency/dashboard")
        }, 2000)
      }
    } catch (err) {
      console.error("Error logging emergency case:", err)
      setError(err instanceof Error ? err.message : "Failed to log emergency case. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="emergency_services">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Log Emergency Case</h1>
          <p className="text-muted-foreground mt-1">Create a new emergency case record</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">Emergency case logged successfully!</p>
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
            <CardTitle>Emergency Case Details</CardTitle>
            <CardDescription>Enter the details for the emergency case</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patientId"
                    type="number"
                    placeholder="Enter patient ID"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyType">Emergency Type</Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.emergencyType} 
                    onValueChange={(value) => setFormData({ ...formData, emergencyType: value })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select emergency type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambulance">Ambulance</SelectItem>
                      <SelectItem value="emergency_room">Emergency Room</SelectItem>
                      <SelectItem value="icu">ICU Admission</SelectItem>
                      <SelectItem value="surgery">Emergency Surgery</SelectItem>
                      <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                      <SelectItem value="trauma">Trauma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resourceId">Resource ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resourceId"
                    type="number"
                    placeholder="Enter resource ID"
                    value={formData.resourceId}
                    onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="caseStatus">Case Status</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.caseStatus} 
                    onValueChange={(value) => setFormData({ ...formData, caseStatus: value })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select case status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="under_care">Under Care</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging..." : "Log Emergency Case"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/emergency/dashboard")}
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