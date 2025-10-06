"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  HeartPulse,
  FileText
} from "lucide-react"
import { NurseService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import type { ApiResponse } from "@/lib/api"
import Link from "next/link"
import { MedicalRecordsModal } from "@/components/modals/medical-records-modal"
import { VitalsModal } from "@/components/modals/vitals-modal"

// Interface matching actual API response structure
interface ActualNursePatient {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  address: string | null
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    email: string
    name: string
    role: string
    profile_picture_url: string | null
    created_at: string
    updated_at: string
  }
  users?: {
    name: string
    email: string
  }
}

// Type guard to check if response has data property
function isApiResponse<T>(response: T | ApiResponse<T>): response is ApiResponse<T> {
  return (response as ApiResponse<T>).data !== undefined
}

export default function NursePatientsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<ActualNursePatient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<ActualNursePatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<ActualNursePatient | null>(null)
  const [isMedicalRecordsModalOpen, setIsMedicalRecordsModalOpen] = useState(false)
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false)

  // Fetch patients when component mounts
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await NurseService.getAllPatients()
        const patientsData = isApiResponse(response) ? response.data : response
        if (patientsData && Array.isArray(patientsData)) {
          setPatients(patientsData)
          setFilteredPatients(patientsData)
        }
      } catch (err) {
        console.error("Error fetching patients:", err)
        setError("Failed to load patients. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [user])

  // Filter patients based on search query
  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        (patient.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.users?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.phone_number && patient.phone_number.includes(searchQuery)) ||
        (patient.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredPatients(filtered)
  }, [searchQuery, patients])

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString()
  }

  // Handle opening medical records modal
  const handleViewMedicalRecords = (patient: ActualNursePatient) => {
    setSelectedPatient(patient)
    setIsMedicalRecordsModalOpen(true)
  }

  // Handle opening vitals modal
  const handleViewVitals = (patient: ActualNursePatient) => {
    setSelectedPatient(patient)
    setIsVitalsModalOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
            <p className="text-muted-foreground mt-1">View and manage all patients</p>
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
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
            <p className="text-muted-foreground mt-1">View and manage all patients</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Patients</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="nurse">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all patients</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients Grid */}
        {filteredPatients.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {patient.user?.name || patient.users?.name || "Unknown Patient"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Patient ID: {patient.id}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.phone_number || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{patient.address || "Not specified"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">DOB:</span> {formatDate(patient.date_of_birth)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewMedicalRecords(patient)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Records
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewVitals(patient)}
                    >
                      <HeartPulse className="h-4 w-4 mr-2" />
                      Vitals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search criteria" : "No patients available at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Medical Records Modal */}
      <MedicalRecordsModal
        isOpen={isMedicalRecordsModalOpen}
        onClose={() => {
          setIsMedicalRecordsModalOpen(false)
          setSelectedPatient(null)
        }}
        patientId={selectedPatient?.id || null}
        patientName={selectedPatient?.user?.name || selectedPatient?.users?.name || null}
      />
      
      {/* Vitals Modal */}
      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => {
          setIsVitalsModalOpen(false)
          setSelectedPatient(null)
        }}
        patientId={selectedPatient?.id || null}
        patientName={selectedPatient?.user?.name || selectedPatient?.users?.name || null}
      />
    </DashboardLayout>
  )
}