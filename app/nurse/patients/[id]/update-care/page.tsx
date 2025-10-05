"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Activity, Pill } from "lucide-react"
import { NurseService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export default function UpdatePatientCarePage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const patientName = searchParams.get('patientName') || "Patient"
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    vitalSigns: "",
    medicationAdministered: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!patientId) {
      setError("Patient ID is required")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const patientIdNum = parseInt(patientId)
      
      // Add vitals if provided
      if (formData.vitalSigns.trim()) {
        const vitalsResponse = await NurseService.addVitals(patientIdNum, formData.vitalSigns)
        console.log("Vitals added:", vitalsResponse)
      }
      
      // Add care record if medication or notes provided
      if (formData.medicationAdministered.trim() || formData.notes.trim()) {
        const careResponse = await NurseService.addCareRecord(patientIdNum, {
          care_details: "", // This page doesn't collect care_details specifically
          medication_administered: formData.medicationAdministered,
          notes: formData.notes,
        })
        console.log("Care record added:", careResponse)
      }
      
      setSuccess(true)
      // Reset form
      setFormData({
        vitalSigns: "",
        medicationAdministered: "",
        notes: "",
      })
      
      // Redirect to patient care records page after 2 seconds
      setTimeout(() => {
        router.push(`/nurse/patients/${patientId}`)
      }, 2000)
    } catch (err) {
      console.error("Error updating patient care:", err)
      setError(err instanceof Error ? err.message : "Failed to update patient care information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="nurse">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Update Patient Care</h1>
          <p className="text-muted-foreground mt-1">Update care information for {patientName}</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">Patient care information updated successfully!</p>
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
            <CardTitle>Care Information</CardTitle>
            <CardDescription>Update the patient's care details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vitalSigns">Vital Signs</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="vitalSigns"
                    placeholder="Enter vital signs (e.g., BP: 120/80, HR: 72)"
                    value={formData.vitalSigns}
                    onChange={(e) => setFormData({ ...formData, vitalSigns: e.target.value })}
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicationAdministered">Medication Administered</Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="medicationAdministered"
                    placeholder="Enter medications administered"
                    value={formData.medicationAdministered}
                    onChange={(e) => setFormData({ ...formData, medicationAdministered: e.target.value })}
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about patient care"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Care Info"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
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