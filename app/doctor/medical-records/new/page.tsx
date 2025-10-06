"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FileText, User } from "lucide-react"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Patient {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string
  phone_number: string
  address: string
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string
  preferred_location: string | null
  created_at: string
  updated_at: string
  users: {
    name: string
    email: string
  }
}

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location: string | null
  created_at: string
  updated_at: string
  patients?: {
    user_id: number
    users?: {
      name: string
    }
  }
}

export default function CreateMedicalRecordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const patientName = searchParams.get('patientName') || ""
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)

  const [formData, setFormData] = useState({
    patientId: patientId || "",
    diagnosis: "",
    treatmentPlan: "",
    prescriptions: "",
  })

  useEffect(() => {
    const fetchPatientsWithAppointments = async () => {
      try {
        setLoadingPatients(true)
        
        // Fetch appointments to get patients who have appointments with the doctor
        const appointmentResponse = await DoctorService.getAppointmentSchedule()
        console.log("Appointment response:", appointmentResponse)
        
        // Handle both response formats
        let appointmentsData: Appointment[] = []
        if (Array.isArray(appointmentResponse)) {
          appointmentsData = appointmentResponse
        } else if (appointmentResponse && Array.isArray(appointmentResponse.data)) {
          appointmentsData = appointmentResponse.data
        }
        
        // Extract unique patient IDs from appointments
        const patientIds = Array.from(new Set(appointmentsData.map(apt => apt.patient_id)))
        
        // Fetch detailed patient information
        const patientResponse = await DoctorService.getAllPatients()
        console.log("Patient response:", patientResponse)
        
        // Handle both response formats
        let allPatientsData: Patient[] = []
        if (Array.isArray(patientResponse)) {
          allPatientsData = patientResponse
        } else if (patientResponse && Array.isArray(patientResponse.data)) {
          allPatientsData = patientResponse.data
        }
        
        // Filter patients to only include those who have appointments with the doctor
        const patientsWithAppointments = allPatientsData.filter(patient => 
          patientIds.includes(patient.id)
        )
        
        setPatients(patientsWithAppointments)
        
        // If patientId is provided in URL, set it in form data
        if (patientId) {
          setFormData(prev => ({
            ...prev,
            patientId: patientId
          }))
        }
      } catch (err: any) {
        console.error("Error fetching patients:", err)
        setError("Failed to load patients. Please try again later.")
      } finally {
        setLoadingPatients(false)
      }
    }

    fetchPatientsWithAppointments()
  }, [patientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientId) {
      setError("Please select a patient")
      return
    }
    
    if (!formData.diagnosis.trim()) {
      setError("Diagnosis is required")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await DoctorService.createMedicalRecord(Number(formData.patientId), {
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
        throw new Error("Failed to create medical record")
      }
    } catch (err: any) {
      console.error("Error creating medical record:", err)
      setError(err.message || "Failed to create medical record. Please try again later.")
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

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      patientId: value
    }))
  }

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === Number(patientId))
    return patient ? patient.users.name : "Unknown Patient"
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
            <h1 className="text-3xl font-bold text-balance">Create Medical Record</h1>
            <p className="text-muted-foreground mt-1">Create a new medical record for a patient</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Medical Record</CardTitle>
            <CardDescription>
              Fill in the details below to create a new medical record for patients who have appointments with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Medical Record Created Successfully</h3>
                <p className="text-muted-foreground">Redirecting to medical records page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  {loadingPatients ? (
                    <p className="text-muted-foreground">Loading patients with appointments...</p>
                  ) : (
                    <Select 
                      value={formData.patientId} 
                      onValueChange={handleSelectChange}
                      disabled={!!patientId} // Disable if patientId was provided in URL
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient with appointment" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.users.name} (ID: {patient.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Only patients who have appointments with you are shown
                  </p>
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
                  <Button type="submit" disabled={isSubmitting || loadingPatients}>
                    {isSubmitting ? "Creating..." : "Create Medical Record"}
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