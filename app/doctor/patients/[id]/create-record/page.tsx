"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, User, Pill } from "lucide-react"
import { DoctorService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export default function CreateMedicalRecordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const patientName = searchParams.get('patientName') || "Patient"
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    diagnosis: "",
    treatmentPlan: "",
    prescriptions: "",
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
      const response = await DoctorService.createMedicalRecord(parseInt(patientId), {
        diagnosis: formData.diagnosis,
        treatment_plan: formData.treatmentPlan,
        prescriptions: formData.prescriptions,
      })
      
      if (response) {
        setSuccess(true)
        // Reset form
        setFormData({
          diagnosis: "",
          treatmentPlan: "",
          prescriptions: "",
        })
        
        // Redirect to patient records page after 2 seconds
        setTimeout(() => {
          router.push(`/doctor/patients/${patientId}`)
        }, 2000)
      }
    } catch (err) {
      console.error("Error creating medical record:", err)
      setError(err instanceof Error ? err.message : "Failed to create medical record. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Create Medical Record</h1>
          <p className="text-muted-foreground mt-1">Create a new medical record for {patientName}</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">Medical record created successfully!</p>
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
            <CardTitle>Medical Record Details</CardTitle>
            <CardDescription>Fill in the patient's medical information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="pl-10"
                    rows={3}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="treatmentPlan"
                    placeholder="Enter treatment plan"
                    value={formData.treatmentPlan}
                    onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                    className="pl-10"
                    rows={4}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prescriptions">Prescriptions</Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="prescriptions"
                    placeholder="Enter prescriptions"
                    value={formData.prescriptions}
                    onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Medical Record"}
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