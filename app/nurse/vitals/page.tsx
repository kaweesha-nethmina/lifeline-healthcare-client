"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  HeartPulse, 
  Search, 
  User, 
  Plus,
  History
} from "lucide-react"
import { NurseService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import type { ApiResponse } from "@/lib/api"

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

interface VitalsRecord {
  id: number
  patient_id: number
  nurse_id: number
  vital_signs: string
  recorded_at: string
  created_at: string
  updated_at: string
}

// Type guard to check if response has data property
function isApiResponse<T>(response: T | ApiResponse<T>): response is ApiResponse<T> {
  return (response as ApiResponse<T>).data !== undefined
}

// Type guard to check if object has required properties
function isVitalsRecord(obj: any): obj is VitalsRecord {
  return obj && typeof obj === 'object' && 'id' in obj && 'vital_signs' in obj
}

export default function NurseVitalsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<ActualNursePatient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<ActualNursePatient | null>(null)
  const [vitalsRecords, setVitalsRecords] = useState<VitalsRecord[]>([])
  const [bp, setBp] = useState("")
  const [hr, setHr] = useState("")
  const [temp, setTemp] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  const filteredPatients = patients.filter(
    (patient) =>
      (patient.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Fetch vitals for selected patient
  useEffect(() => {
    const fetchVitals = async () => {
      if (!selectedPatient) {
        setVitalsRecords([])
        return
      }
      
      try {
        const response = await NurseService.getPatientVitals(selectedPatient.id)
        const vitalsData = isApiResponse(response) ? response.data : response
        if (vitalsData && Array.isArray(vitalsData)) {
          setVitalsRecords(vitalsData)
        }
      } catch (err) {
        console.error("Error fetching vitals:", err)
        setError("Failed to load vitals records. Please try again later.")
      }
    }

    fetchVitals()
  }, [selectedPatient])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Combine vitals into a single string
  const combineVitals = () => {
    const parts = []
    if (bp.trim()) parts.push(`BP: ${bp.trim()}`)
    if (hr.trim()) parts.push(`HR: ${hr.trim()}`)
    if (temp.trim()) parts.push(`Temp: ${temp.trim()}°F`)
    return parts.join(", ")
  }

  // Handle adding new vitals
  const handleAddVitals = async () => {
    if (!selectedPatient) return
    
    const combinedVitals = combineVitals()
    if (!combinedVitals) {
      setError("Please enter at least one vital sign")
      return
    }
    
    try {
      setSaving(true)
      const response = await NurseService.addVitals(selectedPatient.id, combinedVitals)
      const newVitalRecord = isApiResponse(response) ? response.data : response
      
      if (newVitalRecord && isVitalsRecord(newVitalRecord)) {
        setVitalsRecords(prev => [newVitalRecord, ...prev])
        // Clear the input fields
        setBp("")
        setHr("")
        setTemp("")
      }
    } catch (err) {
      console.error("Error adding vitals:", err)
      setError("Failed to add vitals. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Patient Vitals</h1>
            <p className="text-muted-foreground mt-1">Record and view patient vital signs</p>
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
            <h1 className="text-3xl font-bold text-balance">Patient Vitals</h1>
            <p className="text-muted-foreground mt-1">Record and view patient vital signs</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HeartPulse className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Vitals</h3>
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
          <h1 className="text-3xl font-bold text-balance">Patient Vitals</h1>
          <p className="text-muted-foreground mt-1">Record and view patient vital signs</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
                <CardDescription>Choose a patient to record or view vitals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Patient List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <Button
                        key={patient.id}
                        variant={selectedPatient?.id === patient.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {patient.user?.name || patient.users?.name || "Unknown Patient"}
                      </Button>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No patients found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Vitals Form */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Vitals</CardTitle>
                  <CardDescription>Record new vital signs for {selectedPatient.user?.name || selectedPatient.users?.name || "Unknown Patient"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Pressure (BP)</label>
                      <Input
                        placeholder="e.g., 120/80"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Heart Rate (HR)</label>
                      <Input
                        placeholder="e.g., 72"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Temperature (Temp)</label>
                      <Input
                        placeholder="e.g., 98.6"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddVitals}
                    disabled={saving || (!bp.trim() && !hr.trim() && !temp.trim())}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {saving ? "Recording..." : "Record Vitals"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Vitals History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedPatient ? `${selectedPatient.user?.name || selectedPatient.users?.name || "Unknown Patient"}'s Vitals History` : "Vitals History"}
                </CardTitle>
                <CardDescription>
                  {selectedPatient 
                    ? "Previous vital signs recorded for this patient" 
                    : "Select a patient to view vitals history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  vitalsRecords.length > 0 ? (
                    <div className="space-y-4">
                      {vitalsRecords.map((record) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{record.vital_signs}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Recorded on {formatDate(record.recorded_at)}
                              </p>
                            </div>
                            <History className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <HeartPulse className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Vitals Recorded</h3>
                      <p className="text-muted-foreground text-center">
                        No vital signs have been recorded for {selectedPatient.user?.name || selectedPatient.users?.name || "this patient"} yet
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Patient</h3>
                    <p className="text-muted-foreground text-center">
                      Choose a patient from the list to view their vitals history
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}