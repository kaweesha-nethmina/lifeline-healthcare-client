"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Activity, FileText, User, Plus, Clock, MapPin, MoreVertical, Edit, Eye, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { PatientService, Appointment as AppointmentType } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AppointmentsPage() {
  const { user, refreshAuthState } = useAuth()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewAppointment, setViewAppointment] = useState<AppointmentType | null>(null)
  const [editAppointment, setEditAppointment] = useState<AppointmentType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    location: "",
  })
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await PatientService.getAppointmentHistory()
        // The API returns the data directly, not wrapped in a data property
        if (Array.isArray(response)) {
          setAppointments(response)
        } else if (response && Array.isArray(response.data)) {
          // Fallback for wrapped response
          setAppointments(response.data)
        } else {
          // Handle case where response is not an array
          setAppointments([])
        }
      } catch (err: any) {
        console.error("Error fetching appointments:", err)
        // Check if it's an authentication error
        if (err.message && (err.message.includes("401") || err.message.includes("Invalid Token"))) {
          // Try to refresh auth state
          refreshAuthState()
          setError("Authentication error. Please log in again.")
        } else {
          setError("Failed to load appointments. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, refreshAuthState])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get status color variant
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      case "booked":
        return "default"
      case "rescheduled":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // Get doctor name and specialty for display
  const getDoctorName = (appointment: AppointmentType) => {
    return appointment.doctor_name || 
           appointment.doctors?.users?.name || 
           "Doctor"
  }

  const getDoctorSpecialty = (appointment: AppointmentType) => {
    return appointment.doctors?.specialty || "Specialty"
  }

  // Handle view appointment
  const handleViewAppointment = (appointment: AppointmentType) => {
    setViewAppointment(appointment)
  }

  // Handle edit appointment
  const handleEditAppointment = (appointment: AppointmentType) => {
    setEditAppointment(appointment)
    setIsEditing(true)
    
    // Parse the appointment date for the form
    const date = new Date(appointment.appointment_date)
    setEditFormData({
      appointmentDate: date.toISOString().split('T')[0],
      appointmentTime: date.toTimeString().slice(0, 5),
      location: appointment.location || "",
    })
  }

  // Handle update appointment
  const handleUpdateAppointment = async () => {
    if (!editAppointment) return
    
    try {
      // Combine date and time
      const dateTime = new Date(`${editFormData.appointmentDate}T${editFormData.appointmentTime}`)
      
      const response = await PatientService.bookAppointment({
        doctor_id: editAppointment.doctor_id,
        appointment_date: dateTime.toISOString(),
        location: editFormData.location,
        // We're reusing the bookAppointment method but it should be an update method
        // In a real implementation, you would have a separate update method
      })
      
      // Update the appointment in the state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === editAppointment.id 
            ? { ...apt, 
                appointment_date: dateTime.toISOString(),
                location: editFormData.location 
              } 
            : apt
        )
      )
      
      setIsEditing(false)
      setEditAppointment(null)
    } catch (err) {
      console.error("Error updating appointment:", err)
      setError("Failed to update appointment. Please try again later.")
    }
  }

  // Handle delete appointment - open confirmation dialog
  const handleDeleteAppointment = (appointmentId: number) => {
    setDeleteAppointmentId(appointmentId)
  }

  // Confirm delete appointment
  const confirmDeleteAppointment = async () => {
    if (deleteAppointmentId === null) return
    
    try {
      setIsDeleting(true)
      await PatientService.deleteAppointment(deleteAppointmentId)
      
      // Remove the appointment from the state
      setAppointments(prev => prev.filter(apt => apt.id !== deleteAppointmentId))
      
      // Close the dialog
      setDeleteAppointmentId(null)
    } catch (err) {
      console.error("Error deleting appointment:", err)
      setError("Failed to delete appointment. Please try again later.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter appointments based on status
  const upcomingAppointments = appointments.filter((apt) => 
    new Date(apt.appointment_date) > new Date() && apt.status !== "cancelled"
  )
  
  const pastAppointments = appointments.filter((apt) => 
    new Date(apt.appointment_date) <= new Date() || apt.status === "completed" || apt.status === "cancelled"
  )

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Appointments</h1>
              <p className="text-muted-foreground mt-1">Loading your appointments...</p>
            </div>
            <Button asChild>
              <Link href="/patient/appointments/book">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
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
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Appointments</h1>
            </div>
            <Button asChild>
              <Link href="/patient/appointments/book">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Appointments</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Log In Again</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage your healthcare appointments</p>
          </div>
          <Button asChild>
            <Link href="/patient/appointments/book">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{getDoctorName(appointment)}</h3>
                              <p className="text-sm text-muted-foreground">{getDoctorSpecialty(appointment)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewAppointment(appointment)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditAppointment(appointment)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {appointment.status === "booked" && (
                                    <DropdownMenuItem 
                                      className="text-destructive" 
                                      onClick={() => handleDeleteAppointment(appointment.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(appointment.appointment_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTime(appointment.appointment_date)}
                            </span>
                            {appointment.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {appointment.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any scheduled appointments at the moment
                  </p>
                  <Button asChild>
                    <Link href="/patient/appointments/book">Book an Appointment</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {pastAppointments.length > 0 ? (
              <div className="grid gap-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{getDoctorName(appointment)}</h3>
                              <p className="text-sm text-muted-foreground">{getDoctorSpecialty(appointment)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewAppointment(appointment)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(appointment.appointment_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTime(appointment.appointment_date)}
                            </span>
                            {appointment.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {appointment.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Past Appointments</h3>
                  <p className="text-muted-foreground text-center">Your appointment history will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* View Appointment Dialog */}
        <Dialog open={!!viewAppointment} onOpenChange={() => setViewAppointment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Details for your appointment
              </DialogDescription>
            </DialogHeader>
            {viewAppointment && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{getDoctorName(viewAppointment)}</h3>
                    <p className="text-sm text-muted-foreground">{getDoctorSpecialty(viewAppointment)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(viewAppointment.appointment_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(viewAppointment.appointment_date)}</span>
                  </div>
                  {viewAppointment.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewAppointment.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={getStatusColor(viewAppointment.status)}>{viewAppointment.status}</Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Update your appointment details
              </DialogDescription>
            </DialogHeader>
            {editAppointment && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{getDoctorName(editAppointment)}</h3>
                    <p className="text-sm text-muted-foreground">{getDoctorSpecialty(editAppointment)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editFormData.appointmentDate}
                      onChange={(e) => setEditFormData({...editFormData, appointmentDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-time">Time</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={editFormData.appointmentTime}
                      onChange={(e) => setEditFormData({...editFormData, appointmentTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      placeholder="Appointment location"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleUpdateAppointment}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteAppointmentId !== null} onOpenChange={() => setDeleteAppointmentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this appointment?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive hover:bg-destructive/90" 
                onClick={confirmDeleteAppointment}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}