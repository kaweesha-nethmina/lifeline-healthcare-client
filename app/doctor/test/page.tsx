"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"

export default function DoctorTestPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Test fetching doctor profile
        const profileResponse = await DoctorService.getProfile()
        console.log("Profile response:", profileResponse)

        // Test fetching appointments
        const appointmentsResponse = await DoctorService.getAppointmentSchedule()
        console.log("Appointments response:", appointmentsResponse)

        // Test fetching patients
        const patientsResponse = await DoctorService.getAllPatients()
        console.log("Patients response:", patientsResponse)

        setData({
          profile: profileResponse,
          appointments: appointmentsResponse,
          patients: patientsResponse
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
          <h1 className="text-2xl font-bold mb-4">Doctor API Test</h1>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="doctor">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Doctor API Test</h1>
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
        <h1 className="text-2xl font-bold mb-4">Doctor API Test</h1>
        <Button onClick={() => window.location.reload()} className="mb-4">Refresh</Button>
        <Card>
          <CardContent className="pt-6">
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}