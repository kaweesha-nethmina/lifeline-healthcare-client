"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"

export default function DoctorDebugPage() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Test fetching doctor profile
        console.log("Fetching doctor profile...")
        const profileResponse = await DoctorService.getProfile()
        console.log("Profile response:", profileResponse)

        // Test fetching appointments
        console.log("Fetching appointments...")
        const appointmentsResponse = await DoctorService.getAppointmentSchedule()
        console.log("Appointments response:", appointmentsResponse)
        console.log("Appointments data type:", typeof appointmentsResponse)
        console.log("Appointments is array:", Array.isArray(appointmentsResponse))
        console.log("Appointments has data property:", 'data' in appointmentsResponse)
        console.log("Appointments data:", appointmentsResponse.data)

        // Test fetching patients
        console.log("Fetching patients...")
        const patientsResponse = await DoctorService.getAllPatients()
        console.log("Patients response:", patientsResponse)
        console.log("Patients data type:", typeof patientsResponse)
        console.log("Patients is array:", Array.isArray(patientsResponse))
        console.log("Patients has data property:", 'data' in patientsResponse)
        console.log("Patients data:", patientsResponse.data)

        setDebugInfo({
          profile: {
            response: profileResponse,
            data: profileResponse.data,
            type: typeof profileResponse,
            hasDataProperty: 'data' in profileResponse
          },
          appointments: {
            response: appointmentsResponse,
            data: appointmentsResponse.data,
            type: typeof appointmentsResponse,
            isArray: Array.isArray(appointmentsResponse),
            hasDataProperty: 'data' in appointmentsResponse
          },
          patients: {
            response: patientsResponse,
            data: patientsResponse.data,
            type: typeof patientsResponse,
            isArray: Array.isArray(patientsResponse),
            hasDataProperty: 'data' in patientsResponse
          }
        })
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Doctor API Debug</h1>
          <p>Loading and debugging API responses...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="doctor">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Doctor API Debug</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error: {error}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Doctor API Debug</h1>
        <Button onClick={() => window.location.reload()} className="mb-4">Refresh</Button>
        <Card>
          <CardContent className="pt-6">
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}