"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"

export default function DateTestPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      try {
        const response = await DoctorService.getAppointmentSchedule()
        
        // Handle both response formats
        let appointmentsData: any[] = []
        if (Array.isArray(response)) {
          appointmentsData = response
        } else if (response && Array.isArray(response.data)) {
          appointmentsData = response.data
        }
        
        setAppointments(appointmentsData)
        
        // Debug the date comparison
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        
        console.log("=== DATE DEBUG INFO ===")
        console.log("System today:", today.toString())
        console.log("System today (ISO):", todayStr)
        
        const debugData = {
          systemToday: {
            date: today.toString(),
            iso: todayStr
          },
          appointments: appointmentsData.map(apt => {
            if (!apt.appointment_date) {
              return { ...apt, debug: "No appointment_date" }
            }
            
            try {
              const aptDate = new Date(apt.appointment_date)
              const aptDateStr = aptDate.toISOString().split('T')[0]
              
              console.log(`Appointment ${apt.id}:`)
              console.log(`  Raw date: ${apt.appointment_date}`)
              console.log(`  Parsed date: ${aptDate.toString()}`)
              console.log(`  Parsed date (ISO): ${aptDateStr}`)
              console.log(`  Is today: ${aptDateStr === todayStr}`)
              console.log(`  Is future: ${aptDateStr > todayStr}`)
              console.log(`  Is past: ${aptDateStr < todayStr}`)
              
              return {
                ...apt,
                aptDate: aptDate.toString(),
                aptDateISO: aptDateStr,
                isToday: aptDateStr === todayStr,
                isFuture: aptDateStr > todayStr,
                isPast: aptDateStr < todayStr
              }
            } catch (e) {
              console.error("Error parsing appointment date:", apt.appointment_date, e)
              return { ...apt, debug: "Error parsing date" }
            }
          })
        }
        
        console.log("=== END DEBUG INFO ===")
        setDebugInfo(debugData)
      } catch (err: any) {
        console.error("Error fetching appointments:", err)
      }
    }

    fetchAppointments()
  }, [user])

  return (
    <DashboardLayout role="doctor">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Date Test</h1>
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