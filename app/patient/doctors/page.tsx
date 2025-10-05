"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, Stethoscope, Calendar, Phone, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { PatientService } from "@/lib/services"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Doctor {
  id: number
  user_id: number
  name: string
  email: string
  profile_picture_url?: string | null
  specialty: string | null
  qualification: string | null
  schedule: string | null
}

export default function DoctorsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await PatientService.getAllDoctors()
        // The API returns the data directly, not wrapped in a data property
        let doctorsData: Doctor[] = []
        
        if (Array.isArray(response)) {
          doctorsData = response
        } else if (response && Array.isArray(response.data)) {
          // Fallback for wrapped response
          doctorsData = response.data
        }
        
        // Filter out any invalid doctor entries
        const validDoctors = doctorsData.filter(
          (doctor): doctor is Doctor => 
            typeof doctor.id === 'number' && 
            typeof doctor.user_id === 'number'
        )
        
        setDoctors(validDoctors)
        setFilteredDoctors(validDoctors)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Failed to load doctors. Please try again later.")
        // Fallback to mock data if API fails
        setDoctors(mockDoctors)
        setFilteredDoctors(mockDoctors)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    // Filter doctors based on search query
    const filtered = doctors.filter(
      (doctor) =>
        (doctor.name && doctor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doctor.qualification && doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredDoctors(filtered)
  }, [searchQuery, doctors])

  const handleBookAppointment = (doctorId: number) => {
    // Navigate to appointment booking page with doctor ID
    router.push(`/patient/appointments/book?doctorId=${doctorId}`)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Mock data for fallback - matching the updated API response format
  const mockDoctors = [
    {
      id: 1,
      user_id: 2,
      name: "Dr. John Doe",
      email: "johndoe@example.com",
      profile_picture_url: null,
      specialty: "Cardiology",
      qualification: "MD, Board Certified",
      schedule: "Monday-Friday: 9AM-5PM"
    },
    {
      id: 2,
      user_id: 3,
      name: "Dr. Jane Smith",
      email: "janesmith@example.com",
      profile_picture_url: null,
      specialty: "General Physician",
      qualification: "MD, Internal Medicine",
      schedule: "Tuesday-Thursday: 10AM-6PM"
    },
    {
      id: 3,
      user_id: 4,
      name: "Dr. Robert Johnson",
      email: "robertjohnson@example.com",
      profile_picture_url: null,
      specialty: "Dermatology",
      qualification: "MD, Dermatology Specialist",
      schedule: "Monday-Wednesday-Friday: 8AM-4PM"
    }
  ]

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Find a Doctor</h1>
            <p className="text-muted-foreground mt-1">Loading doctors...</p>
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
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Find a Doctor</h1>
            <p className="text-muted-foreground mt-1">Browse and book appointments with healthcare professionals</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 mb-4">
                <User className="h-16 w-16 text-red-500/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Doctors</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Find a Doctor</h1>
          <p className="text-muted-foreground mt-1">Browse and book appointments with healthcare professionals</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty or qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={doctor.profile_picture_url || "/placeholder.svg"} alt={doctor.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {doctor.name ? getInitials(doctor.name) : "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty || "Specialty not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.qualification || "Qualification not specified"}</span>
                    </div>
                    {doctor.schedule && (
                      <div className="text-sm">
                        <span className="font-medium">Schedule:</span> {doctor.schedule}
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search criteria" : "No doctors available at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}