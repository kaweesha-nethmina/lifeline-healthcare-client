"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DoctorService } from "@/lib/services/doctor-service"

export default function DateDebugPage() {
  const [systemInfo, setSystemInfo] = useState({
    systemDate: "",
    systemISOString: "",
    manualDate: "",
    manualISOString: ""
  })
  
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState({
    systemToday: [] as any[],
    manualToday: [] as any[]
  })

  useEffect(() => {
    // Get system date info
    const systemDate = new Date()
    const systemISOString = systemDate.toISOString().split('T')[0]
    
    // Set manual date to 2025-10-16
    const manualDate = new Date("2025-10-16")
    const manualISOString = manualDate.toISOString().split('T')[0]
    
    setSystemInfo({
      systemDate: systemDate.toString(),
      systemISOString,
      manualDate: manualDate.toString(),
      manualISOString
    })
    
    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const appointmentResponse = await DoctorService.getAppointmentSchedule()
        
        // Handle both response formats
        let appointmentsData: any[] = []
        if (Array.isArray(appointmentResponse)) {
          appointmentsData = appointmentResponse
        } else if (appointmentResponse && Array.isArray(appointmentResponse.data)) {
          appointmentsData = appointmentResponse.data
        }
        
        setAppointments(appointmentsData)
        
        // Filter appointments using system date
        const systemTodayAppointments = appointmentsData.filter(apt => {
          if (!apt.appointment_date) return false
          try {
            const aptDate = new Date(apt.appointment_date)
            return aptDate.toISOString().split('T')[0] === systemISOString
          } catch (e) {
            return false
          }
        })
        
        // Filter appointments using manual date
        const manualTodayAppointments = appointmentsData.filter(apt => {
          if (!apt.appointment_date) return false
          try {
            const aptDate = new Date(apt.appointment_date)
            return aptDate.toISOString().split('T')[0] === manualISOString
          } catch (e) {
            return false
          }
        })
        
        setFilteredAppointments({
          systemToday: systemTodayAppointments,
          manualToday: manualTodayAppointments
        })
      } catch (err) {
        console.error("Error fetching appointments:", err)
      }
    }
    
    fetchAppointments()
  }, [])

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Date Debug Information</h1>
          <p className="text-muted-foreground mt-1">Debugging date comparison issues</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Date Information</CardTitle>
            <CardDescription>Current system vs manual date settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">System Date</h3>
                <p className="text-sm text-muted-foreground">Date Object: {systemInfo.systemDate}</p>
                <p className="text-sm text-muted-foreground">ISO String: {systemInfo.systemISOString}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Manual Date (2025-10-16)</h3>
                <p className="text-sm text-muted-foreground">Date Object: {systemInfo.manualDate}</p>
                <p className="text-sm text-muted-foreground">ISO String: {systemInfo.manualISOString}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Filtering Results</CardTitle>
            <CardDescription>How appointments are filtered based on different dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">System Date Filtering</h3>
                <p className="text-sm text-muted-foreground">Appointments for {systemInfo.systemISOString}</p>
                <p className="mt-2">Count: {filteredAppointments.systemToday.length}</p>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {filteredAppointments.systemToday.map(apt => (
                    <div key={apt.id} className="text-sm py-1 border-b">
                      <p>Patient ID: {apt.patient_id}</p>
                      <p>Date: {apt.appointment_date}</p>
                      <p>ISO: {apt.appointment_date ? new Date(apt.appointment_date).toISOString().split('T')[0] : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Manual Date Filtering</h3>
                <p className="text-sm text-muted-foreground">Appointments for {systemInfo.manualISOString}</p>
                <p className="mt-2">Count: {filteredAppointments.manualToday.length}</p>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {filteredAppointments.manualToday.map(apt => (
                    <div key={apt.id} className="text-sm py-1 border-b">
                      <p>Patient ID: {apt.patient_id}</p>
                      <p>Date: {apt.appointment_date}</p>
                      <p>ISO: {apt.appointment_date ? new Date(apt.appointment_date).toISOString().split('T')[0] : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>Complete list of appointments for reference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              {appointments.map(apt => (
                <div key={apt.id} className="text-sm py-2 border-b">
                  <p><strong>ID:</strong> {apt.id}</p>
                  <p><strong>Patient ID:</strong> {apt.patient_id}</p>
                  <p><strong>Date:</strong> {apt.appointment_date}</p>
                  <p><strong>Status:</strong> {apt.status}</p>
                  <p><strong>ISO Date:</strong> {apt.appointment_date ? new Date(apt.appointment_date).toISOString().split('T')[0] : 'N/A'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}