"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { AdminAppointmentService } from "@/lib/services/admin-appointment-service"
import { toast } from "sonner"

interface AppointmentStatusModalProps {
  appointmentId: number | null
  currentStatus: string
  open: boolean
  onClose: () => void
  onStatusChange: () => void
}

export function AppointmentStatusModal({ 
  appointmentId, 
  currentStatus,
  open, 
  onClose,
  onStatusChange
}: AppointmentStatusModalProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!appointmentId) return
    
    try {
      setLoading(true)
      await AdminAppointmentService.updateAppointmentStatus(appointmentId, status)
      toast.success("Appointment status updated successfully")
      onStatusChange()
      onClose()
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Failed to update appointment status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Appointment Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Current status: <span className="font-medium">{currentStatus}</span>
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || status === currentStatus}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}