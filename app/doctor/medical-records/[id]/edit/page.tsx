"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText, User } from "lucide-react"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at: string
  patients?: {
    user_id: number
    users?: {
      name: string
    }
  }
}

export default function EditMedicalRecordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get('id')
  
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    diagnosis: "",
    treatmentPlan: "",
    prescriptions: "",
  })

  useEffect(() => {
    const fetchRecord = async () => {
      if (!user || !recordId) {
        if (!recordId) {
          setError("Record ID is required")
        }
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await DoctorService.getMedicalRecordById(Number(recordId))
        let recordData = response && response.data ? response.data : null
        
        if (recordData) {
          setRecord(recordData)
          setFormData({
            diagnosis: recordData.diagnosis || "",
            treatmentPlan: recordData.treatment_plan || "",
            prescriptions: recordData.prescriptions || "",
          })
        } else {
          setError("Medical record not found")
        }
      } catch (err: any) {
        console.error("Error fetching medical record:", err)
        setError("Failed to load medical record. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [user, recordId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recordId) {
      setError("Record ID is required")
      return
    }
    
    if (!formData.diagnosis.trim()) {
      setError("Diagnosis is required")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await DoctorService.updateMedicalRecord(Number(recordId), {
        diagnosis: formData.diagnosis,
        treatment_plan: formData.treatmentPlan,
        prescriptions: formData.prescriptions,
      })

      if (response && response.data) {
        setSuccess(true)
        // Redirect to medical records page after a short delay
        setTimeout(() => {
          router.push("/doctor/medical-records")
        }, 1500)
      } else {
        throw new Error("Failed to update medical record")
      }
    } catch (err: any) {
      console.error("Error updating medical record:", err)
      setError(err.message || "Failed to update medical record. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/doctor/medical-records">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Edit Medical Record</h1>
              <p className="text-muted-foreground mt-1">Loading record details...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !record) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/doctor/medical-records">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Edit Medical Record</h1>
            </div>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Record</h3>
              <p className="text-muted-foreground text-center mb-4">{error || "Medical record not found"}</p>
              <Button asChild>
                <Link href="/doctor/medical-records">Back to Records</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/doctor/medical-records">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">Edit Medical Record</h1>
            <p className="text-muted-foreground mt-1">
              Editing record for {record.patients?.users?.name || "Patient"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Medical Record</CardTitle>
            <CardDescription>
              Update the details below for this medical record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Medical Record Updated Successfully</h3>
                <p className="text-muted-foreground">Redirecting to medical records page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{record.patients?.users?.name || "Patient"}</p>
                        <p className="text-sm text-muted-foreground">ID: {record.patient_id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      placeholder="Enter diagnosis"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                  <Textarea
                    id="treatmentPlan"
                    name="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={handleInputChange}
                    placeholder="Describe the treatment plan"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prescriptions">Prescriptions</Label>
                  <Textarea
                    id="prescriptions"
                    name="prescriptions"
                    value={formData.prescriptions}
                    onChange={handleInputChange}
                    placeholder="List any prescriptions"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Medical Record"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/doctor/medical-records">Cancel</Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}