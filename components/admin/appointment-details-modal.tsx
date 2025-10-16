"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText } from "lucide-react"
import { AdminAppointmentService, AdminAppointmentDetail } from "@/lib/services/admin-appointment-service"
import { toast } from "sonner"
import { format } from "date-fns"

interface AppointmentDetailsModalProps {
  appointmentId: number | null
  open: boolean
  onClose: () => void
  onStatusChange?: () => void
}

export function AppointmentDetailsModal({ 
  appointmentId, 
  open, 
  onClose,
  onStatusChange
}: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<AdminAppointmentDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointmentDetails()
    }
  }, [open, appointmentId])

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return
    
    try {
      setLoading(true)
      const data = await AdminAppointmentService.getAppointmentById(appointmentId)
      setAppointment(data)
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      toast.error("Failed to fetch appointment details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "p")
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
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Appointment Details</DialogTitle>
        </DialogHeader>
        
        {appointment && (
          <div className="space-y-6">
            {/* Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(appointment.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span>{formatTime(appointment.appointment_date)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{appointment.location || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{appointment.patients.users.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{appointment.patients.users.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{appointment.patients.phone_number || "Not provided"}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date of Birth:</span>
                    <span>{appointment.patients.date_of_birth || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Gender:</span>
                    <span>{appointment.patients.gender || "Not provided"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Address:</span>
                    <p className="text-muted-foreground">{appointment.patients.address || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Medical History:</span>
                    <p className="text-muted-foreground">{appointment.patients.medical_history || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Emergency Contact:</span>
                    <p className="text-muted-foreground">{appointment.patients.emergency_contact || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Insurance Details:</span>
                    <p className="text-muted-foreground">{appointment.patients.insurance_details || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Doctor Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Doctor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{appointment.doctors.users.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{appointment.doctors.users.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{appointment.doctors.users.phone_number || "Not provided"}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Specialty:</span>
                    <span>{appointment.doctors.specialty || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Qualification:</span>
                    <span>{appointment.doctors.qualification || "Not provided"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Schedule:</span>
                    <p className="text-muted-foreground">{appointment.doctors.schedule || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}