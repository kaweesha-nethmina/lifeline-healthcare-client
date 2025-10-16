"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Activity, FileText, User, Search, Download, Eye } from "lucide-react"
import { PatientService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"

interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  doctor_name?: string
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at?: string
  doctors?: {
    user_id: number
    users?: {
      name: string
    }
  }
}

export default function MedicalRecordsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await PatientService.getMedicalRecords()
        console.log("Medical records response:", response);
        
        // Handle both response formats
        let recordsData: MedicalRecord[] = []
        if (Array.isArray(response)) {
          recordsData = response
        } else if (response && Array.isArray(response.data)) {
          recordsData = response.data
        }
        
        setMedicalRecords(recordsData)
      } catch (err) {
        console.error("Error fetching medical records:", err)
        setError("Failed to load medical records. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMedicalRecords()
  }, [user])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get doctor name from record
  const getDoctorName = (record: MedicalRecord) => {
    // First try to get from doctors.users.name
    if (record.doctors && record.doctors.users && record.doctors.users.name) {
      return record.doctors.users.name
    }
    // Fallback to doctor_name if available
    if (record.doctor_name) {
      return record.doctor_name
    }
    // Default fallback
    return "Doctor"
  }

  // Filter records based on search query
  const filteredRecords = medicalRecords.filter(
    (record) =>
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDoctorName(record).toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.treatment_plan.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
            <p className="text-muted-foreground mt-1">Loading your health history...</p>
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
            <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
            <p className="text-muted-foreground mt-1">Access your complete health history and documents</p>
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
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
          <p className="text-muted-foreground mt-1">Access your complete health history and documents</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Medical Records */}
        {filteredRecords.length > 0 ? (
          <div className="grid gap-4">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{record.diagnosis || "Medical Record"}</CardTitle>
                      <CardDescription>
                        {getDoctorName(record)} • {formatDate(record.record_date)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Record</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
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
              <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "Your medical records will appear here"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}