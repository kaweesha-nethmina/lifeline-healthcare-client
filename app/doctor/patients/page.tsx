"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Settings, Search, User, Activity, Eye } from "lucide-react"
import Link from "next/link"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  profile_picture_url?: string | null
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch basic patient list
        const response = await DoctorService.getAllPatients()
        console.log("Patient response:", response)
        
        // Handle both response formats
        let patientsData: Patient[] = []
        if (Array.isArray(response)) {
          patientsData = response
        } else if (response && Array.isArray(response.data)) {
          patientsData = response.data
        }
        
        // For each patient, fetch detailed information to get profile picture
        const patientsWithDetails = await Promise.all(
          patientsData.map(async (patient) => {
            try {
              const detailResponse = await DoctorService.getPatientDetails(patient.id)
              console.log(`Patient ${patient.id} details:`, detailResponse)
              
              // Handle both response formats
              let patientDetails = null
              if (detailResponse && detailResponse.data) {
                patientDetails = detailResponse.data
              } else if (detailResponse && typeof detailResponse === 'object' && 'id' in detailResponse) {
                patientDetails = detailResponse as any
              }
              
              if (patientDetails) {
                return {
                  ...patient,
                  profile_picture_url: patientDetails.profile_picture_url
                }
              }
              return patient
            } catch (err) {
              console.error(`Error fetching details for patient ${patient.id}:`, err)
              return patient
            }
          })
        )
        
        setPatients(patientsWithDetails)
      } catch (err: any) {
        console.error("Error fetching patients:", err)
        setError("Failed to load patients. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [user])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toString().includes(searchQuery.toLowerCase()) ||
      (patient.medical_history && patient.medical_history.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Calculate age from date of birth
  const calculateAge = (dob: string | null) => {
    if (!dob) return "N/A"
    
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get patient profile picture URL
  const getPatientProfilePicture = (patient: Patient) => {
    return patient.profile_picture_url || null
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Patients</h1>
              <p className="text-muted-foreground mt-1">Loading your patients...</p>
            </div>
            <Button asChild>
              <Link href="/doctor/patients/new">Add Patient</Link>
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
              <h1 className="text-3xl font-bold text-balance">Patients</h1>
            </div>
            <Button asChild>
              <Link href="/doctor/patients/new">Add Patient</Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
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
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Patients</h1>
            <p className="text-muted-foreground mt-1">Manage your patient records and information</p>
          </div>
          <Button asChild>
            <Link href="/doctor/patients/new">Add Patient</Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients List */}
        {filteredPatients.length > 0 ? (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={getPatientProfilePicture(patient) || "/placeholder.svg"} 
                          alt={patient.users.name} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {getInitials(patient.users.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{patient.users.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {patient.id} • {patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} years` : "Age: N/A"} • {patient.gender}
                          </p>
                        </div>
                        <Badge variant="secondary">active</Badge>
                      </div>
                      <div className="grid gap-2 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Condition:</span>
                          <span className="font-medium">
                            {patient.medical_history || "No conditions recorded"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Last Visit:</span>
                          <span className="font-medium">
                            {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/doctor/patients/${patient.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
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
                {searchQuery ? "Try adjusting your search" : "Your patient list will appear here"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}