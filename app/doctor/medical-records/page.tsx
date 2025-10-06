"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Settings, Search, Activity, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"

interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at: string
}

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
}

export default function DoctorMedicalRecordsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecordsAndPatients = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

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
        
        // Fetch medical records for all patients who have appointments with the doctor
        const allRecords: MedicalRecord[] = []
        
        for (const patientId of patientIds) {
          try {
            // Fetch medical records for this patient
            const recordResponse = await DoctorService.getPatientMedicalRecords(patientId)
            console.log(`Medical records for patient ${patientId}:`, recordResponse)
            
            // Handle both response formats
            let recordsData: MedicalRecord[] = []
            if (Array.isArray(recordResponse)) {
              recordsData = recordResponse
            } else if (recordResponse && Array.isArray(recordResponse.data)) {
              recordsData = recordResponse.data
            }
            
            allRecords.push(...recordsData)
          } catch (err) {
            console.error(`Error fetching records for patient ${patientId}:`, err)
            // Continue with other patients even if one fails
          }
        }
        
        setRecords(allRecords)
      } catch (err: any) {
        console.error("Error fetching medical records:", err)
        setError("Failed to load medical records. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecordsAndPatients()
  }, [user])

  // Get patient name by ID
  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.users.name : "Unknown Patient"
  }

  const filteredRecords = records.filter(
    (record) =>
      getPatientName(record.patient_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient_id.toString().includes(searchQuery.toLowerCase()) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
              <p className="text-muted-foreground mt-1">Loading medical records...</p>
            </div>
            <Button asChild>
              <Link href="/doctor/medical-records/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Record
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
            </div>
            <Button asChild>
              <Link href="/doctor/medical-records/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Record
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Records</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
            <p className="text-muted-foreground mt-1">View and manage patient medical records</p>
          </div>
          <Button asChild>
            <Link href="/doctor/medical-records/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Record
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, ID, or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Records List */}
        {filteredRecords.length > 0 ? (
          <div className="grid gap-4">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{record.diagnosis || "Medical Record"}</CardTitle>
                      <CardDescription>
                        {getPatientName(record.patient_id)} (ID: {record.patient_id}) • {formatDate(record.record_date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Record</Badge>
                      <Badge variant="default">Completed</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                      <p className="text-sm">{record.diagnosis || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Treatment Plan</p>
                      <p className="text-sm">{record.treatment_plan || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Prescriptions</p>
                      <p className="text-sm">{record.prescriptions || "None"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Recorded Date</p>
                      <p className="text-sm">{formatDate(record.record_date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" asChild>
                      <Link href={`/doctor/medical-records/${record.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/doctor/patients/${record.patient_id}`}>View Patient</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Medical Records Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "Medical records will appear here once created"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/doctor/medical-records/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Record
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}