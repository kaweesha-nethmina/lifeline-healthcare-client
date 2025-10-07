"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StaffService, PatientInfo } from "@/lib/services/staff-service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CreditCard, Calendar, Phone, Mail, MapPin } from "lucide-react"

export default function StaffPatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [patientData, setPatientData] = useState<PatientInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Unwrap the params promise
        const resolvedParams = await params;
        
        if (!resolvedParams.id) {
          router.push("/staff/patients")
          return
        }
        
        setLoading(true)
        const response = await StaffService.getPatientInfo(parseInt(resolvedParams.id))
        setPatientData(response || null)
      } catch (error) {
        console.error("Failed to fetch patient data:", error)
        toast.error("Failed to fetch patient data")
        router.push("/staff/patients")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [params, router])

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!patientData) {
    return (
      <DashboardLayout role="staff">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Patient not found</p>
          <Button onClick={() => router.push("/staff/patients")} className="mt-4">
            Back to Patients
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Details</h1>
            <p className="text-muted-foreground">Detailed information for {patientData.users?.name}</p>
          </div>
          <Button onClick={() => router.push("/staff/patients")}>
            Back to Patients
          </Button>
        </div>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Name:</span>
                      <span>{patientData.users?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span>{patientData.users?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{patientData.users?.date_of_birth}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Gender:</span>
                      <span>{patientData.users?.gender}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patientData.users?.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{patientData.users?.address}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Medical Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Insurance:</span>
                      <span>{patientData.insurance_details}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Medical History:</span>
                      <span>{patientData.medical_history}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Emergency Contact:</span>
                      <span>{patientData.emergency_contact}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Patient ID:</span>
                      <span>{patientData.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created: {new Date(patientData.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in History */}
        {patientData.check_ins && patientData.check_ins.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Check-in History</CardTitle>
              <CardDescription>Previous patient check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.check_ins.map((checkIn) => (
                  <div key={checkIn.id} className="border rounded-lg p-4">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p>{new Date(checkIn.check_in_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Department</p>
                        <p>{checkIn.department}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-medium">Reason for Visit</p>
                        <p>{checkIn.reason_for_visit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Available actions for this patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button asChild>
                <a href={`/staff/payments/${patientData.id}`}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/staff/check-in/${patientData.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Check-in Patient
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}