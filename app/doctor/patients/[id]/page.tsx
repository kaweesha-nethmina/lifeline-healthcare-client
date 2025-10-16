"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, FileText, Settings, Activity, ArrowLeft, Phone, Mail, MapPin, HeartPulse } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DoctorService, PatientDetails } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const response = await DoctorService.getPatientDetails(Number(params.id))
        console.log("Patient details response:", response)

        // Handle both response formats
        let patientData: PatientDetails | null = null
        if (response && response.data) {
          patientData = response.data
        } else if (response && typeof response === 'object' && 'id' in response) {
          // Direct response format
          patientData = response as PatientDetails
        }

        if (patientData) {
          setPatient(patientData)
        } else {
          setError("Patient not found")
        }
      } catch (err: any) {
        console.error("Error fetching patient details:", err)
        setError("Failed to load patient details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientDetails()
  }, [user, params])

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/doctor/patients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Patient Details</h1>
              <p className="text-muted-foreground mt-1">Loading patient information...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !patient) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/doctor/patients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Patient Details</h1>
            </div>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Patient</h3>
              <p className="text-muted-foreground text-center mb-4">{error || "Patient not found"}</p>
              <Button onClick={() => router.push("/doctor/patients")}>Back to Patients</Button>
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
            <Link href="/doctor/patients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-balance">Patient Details</h1>
            <p className="text-muted-foreground mt-1">Complete patient information and medical history</p>
          </div>
          <Button asChild>
            <Link href={`/doctor/patients/${patient.id}/create-record`}>Create Record</Link>
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={patient.profile_picture_url || "/placeholder.svg"} alt={patient.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{patient.name}</h2>
                    <p className="text-muted-foreground">
                      ID: {patient.id} • {patient.age ? `${patient.age} years` : "Age not specified"} • {patient.gender}
                    </p>
                  </div>
                  <Badge>Active Patient</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone_number || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.address || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>DOB: {patient.date_of_birth || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{patient.emergency_contact || "Not provided"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{patient.insurance_details || "Not provided"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{patient.medical_history || "No medical history recorded"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="records">All Records</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {patient.medical_records && patient.medical_records.length > 0 ? (
              patient.medical_records.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                        <CardDescription>{new Date(record.record_date).toLocaleDateString()}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Doctor: {record.doctor_name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Treatment Plan</p>
                      <p className="text-sm">{record.treatment_plan || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Prescriptions</p>
                      <p className="text-sm">{record.prescriptions || "None"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Medical History</h3>
                  <p className="text-muted-foreground text-center">No medical records found for this patient</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            {patient.vital_signs && patient.vital_signs.length > 0 ? (
              patient.vital_signs.map((vital) => (
                <Card key={vital.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <HeartPulse className="h-5 w-5 text-primary" />
                          Vital Signs
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Recorded on {new Date(vital.recorded_at).toLocaleDateString()} at {new Date(vital.recorded_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Nurse: {vital.nurse_name}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Measurements</p>
                      <p className="text-base">{vital.vital_signs}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <HeartPulse className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Vital Signs</h3>
                  <p className="text-muted-foreground text-center">No vital signs recorded for this patient</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Medical Records</CardTitle>
                <CardDescription>Complete list of medical records for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.medical_records && patient.medical_records.length > 0 ? (
                  <div className="space-y-3">
                    {patient.medical_records.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{record.diagnosis}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.record_date).toLocaleDateString()} • Doctor: {record.doctor_name}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctor/medical-records/${record.id}`}>View Details</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No medical records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}