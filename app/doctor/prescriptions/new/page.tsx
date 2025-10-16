"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pill, FileText, Hash } from "lucide-react"
import { PrescriptionService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export default function CreatePrescriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const medicalRecordId = searchParams.get('medicalRecordId')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    pharmacyId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!medicalRecordId) {
      setError("Medical Record ID is required")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await PrescriptionService.createPrescription({
        medical_record_id: parseInt(medicalRecordId),
        medication: formData.medication,
        dosage: formData.dosage,
        pharmacy_id: parseInt(formData.pharmacyId),
      })
      
      if (response) {
        setSuccess(true)
        // Reset form
        setFormData({
          medication: "",
          dosage: "",
          pharmacyId: "",
        })
        
        // Redirect to prescriptions page after 2 seconds
        setTimeout(() => {
          router.push("/doctor/prescriptions")
        }, 2000)
      }
    } catch (err) {
      console.error("Error creating prescription:", err)
      setError(err instanceof Error ? err.message : "Failed to create prescription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Create Prescription</h1>
          <p className="text-muted-foreground mt-1">Create a new prescription for the patient</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">Prescription created successfully!</p>
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
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>Enter the prescription information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="medication"
                    placeholder="Enter medication name"
                    value={formData.medication}
                    onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                    className="pl-10"
                    rows={2}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="dosage"
                    placeholder="Enter dosage instructions (e.g., 500mg twice daily)"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="pl-10"
                    rows={2}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pharmacyId">Pharmacy ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pharmacyId"
                    type="number"
                    placeholder="Enter pharmacy ID"
                    value={formData.pharmacyId}
                    onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Prescription"}
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