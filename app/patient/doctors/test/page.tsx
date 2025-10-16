"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"

export default function TestDoctorsPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await PatientService.getAllDoctors()
        console.log("Doctors API Response:", response)
        setDoctors(Array.isArray(response.data) ? response.data : [response.data])
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError(err instanceof Error ? err.message : "Failed to load doctors")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Test Doctors API</h1>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="patient">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Test Doctors API</h1>
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
    <DashboardLayout role="patient">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Test Doctors API</h1>
        <Button onClick={() => window.location.reload()} className="mb-4">Refresh</Button>
        <Card>
          <CardContent className="pt-6">
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(doctors, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}