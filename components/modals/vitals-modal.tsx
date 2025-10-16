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
import { 
  HeartPulse,
  Calendar
} from "lucide-react"
import { NurseService, Vitals } from "@/lib/services/nurse-service"

interface VitalsModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: number | null
  patientName: string | null
}

export function VitalsModal({ 
  isOpen, 
  onClose, 
  patientId,
  patientName
}: VitalsModalProps) {
  const [vitalsRecords, setVitalsRecords] = useState<Vitals[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVitalsRecords = async () => {
      if (!isOpen || !patientId) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await NurseService.getPatientVitals(patientId)
        console.log("Vitals response:", response)
        
        // Handle both response formats
        let vitalsData: Vitals[] = []
        if (response && (response as any).data) {
          vitalsData = (response as any).data
        } else if (response && Array.isArray(response)) {
          // Direct response format
          vitalsData = response
        }
        
        setVitalsRecords(vitalsData)
      } catch (err: any) {
        console.error("Error fetching vitals:", err)
        setError("Failed to load vitals records. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVitalsRecords()
  }, [isOpen, patientId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Vitals History for {patientName || "Patient"}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-destructive mb-2">Error loading vitals records</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        ) : vitalsRecords.length > 0 ? (
          <div className="space-y-6">
            {vitalsRecords.map((vital) => (
              <div key={vital.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-primary" />
                    Vitals Record
                  </h3>
                  <Badge variant="outline">
                    {formatDate(vital.recorded_at)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-base font-medium">{vital.vital_signs}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <HeartPulse className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vitals Records Found</h3>
            <p className="text-muted-foreground">
              No vitals records available for {patientName || "this patient"}
            </p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}