"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Search, 
  Eye, 
  Edit,
  Trash2
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { format } from "date-fns"
import { AdminAppointmentService, AdminAppointmentDetail } from "@/lib/services/admin-appointment-service"
import { AppointmentDetailsModal } from "@/components/admin/appointment-details-modal"
import { AppointmentStatusModal } from "@/components/admin/appointment-status-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminAppointmentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [appointments, setAppointments] = useState<AdminAppointmentDetail[]>([])
  
  // Modal states
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState("")

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        // For now, we'll fetch basic appointments and then get details for each
        // In a real implementation, there would be an endpoint that returns detailed appointments
        const basicAppointments = await AdminAppointmentService.getAllAppointments()
        
        // Fetch detailed information for each appointment
        const detailedAppointments = await Promise.all(
          basicAppointments.map(async (appointment) => {
            try {
              const detailed = await AdminAppointmentService.getAppointmentById(appointment.id)
              return detailed
            } catch (error) {
              console.error(`Error fetching details for appointment ${appointment.id}:`, error)
              // Return the basic appointment if details fail to load
              return appointment as unknown as AdminAppointmentDetail
            }
          })
        )
        
        setAppointments(detailedAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to fetch appointments")
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAppointments()
    }
  }, [user])

  const handleViewDetails = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId)
    setIsDetailsModalOpen(true)
  }

  const handleStatusChange = (appointmentId: number, status: string) => {
    setSelectedAppointmentId(appointmentId)
    setCurrentStatus(status)
    setIsStatusModalOpen(true)
  }

  const handleDelete = async (appointmentId: number) => {
    try {
      await AdminAppointmentService.deleteAppointment(appointmentId)
      setAppointments(appointments.filter(apt => apt.id !== appointmentId))
      toast.success("Appointment deleted successfully")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Failed to delete appointment")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleStatusUpdated = () => {
    // Refresh the appointments list
    const fetchAppointments = async () => {
      try {
        // For now, we'll fetch basic appointments and then get details for each
        // In a real implementation, there would be an endpoint that returns detailed appointments
        const basicAppointments = await AdminAppointmentService.getAllAppointments()
        
        // Fetch detailed information for each appointment
        const detailedAppointments = await Promise.all(
          basicAppointments.map(async (appointment) => {
            try {
              const detailed = await AdminAppointmentService.getAppointmentById(appointment.id)
              return detailed
            } catch (error) {
              console.error(`Error fetching details for appointment ${appointment.id}:`, error)
              // Return the basic appointment if details fail to load
              return appointment as unknown as AdminAppointmentDetail
            }
          })
        )
        
        setAppointments(detailedAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to refresh appointments")
      }
    }

    fetchAppointments()
  }

  const filteredAppointments = appointments.filter(
    (apt) =>
      (apt.patients.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctors.users.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      apt.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: format(date, "PPP"),
      time: format(date, "p")
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage all system appointments</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => {
              const formattedDate = formatAppointmentDate(appointment.appointment_date)
              return (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={appointment.patients.users.profile_picture_url || "/placeholder.svg"} 
                            alt={appointment.patients.users.name} 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(appointment.patients.users.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.patients.users.name}</h3>
                          <p className="text-sm text-muted-foreground">with {appointment.doctors.users.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>
                        {formattedDate.date} at {formattedDate.time}
                      </span>
                      {appointment.location && (
                        <span>{appointment.location}</span>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewDetails(appointment.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStatusChange(appointment.id, appointment.status)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Change Status
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Appointments Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "No appointments scheduled"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointmentId={selectedAppointmentId}
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onStatusChange={handleStatusUpdated}
      />

      {/* Appointment Status Modal */}
      <AppointmentStatusModal
        appointmentId={selectedAppointmentId}
        currentStatus={currentStatus}
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onStatusChange={handleStatusUpdated}
      />
    </DashboardLayout>
  )
}