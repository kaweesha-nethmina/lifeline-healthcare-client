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
  FileText,
  Calendar,
  User,
  Stethoscope
} from "lucide-react"
import { NurseService, MedicalRecord } from "@/lib/services/nurse-service"

interface MedicalRecordsModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: number | null
  patientName: string | null
}

export function MedicalRecordsModal({ 
  isOpen, 
  onClose, 
  patientId,
  patientName
}: MedicalRecordsModalProps) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!isOpen || !patientId) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await NurseService.getPatientMedicalRecords(patientId)
        console.log("Medical records response:", response)
        
        // Handle both response formats
        let recordsData: MedicalRecord[] = []
        if (response && (response as any).data) {
          recordsData = (response as any).data
        } else if (response && Array.isArray(response)) {
          // Direct response format
          recordsData = response
        }
        
        setMedicalRecords(recordsData)
      } catch (err: any) {
        console.error("Error fetching medical records:", err)
        setError("Failed to load medical records. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMedicalRecords()
  }, [isOpen, patientId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Medical Records for {patientName || "Patient"}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-destructive mb-2">Error loading medical records</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        ) : medicalRecords.length > 0 ? (
          <div className="space-y-6">
            {medicalRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Medical Record #{record.id}</h3>
                  <Badge variant="outline">
                    {formatDate(record.record_date)}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                    <p className="text-base">{record.diagnosis || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Treatment Plan</p>
                    <p className="text-base">{record.treatment_plan || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Prescriptions</p>
                    <p className="text-base">{record.prescriptions || "None"}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Doctor: {record.doctors?.users?.name || "Unknown Doctor"}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Medical Records Found</h3>
            <p className="text-muted-foreground">
              No medical records available for {patientName || "this patient"}
            </p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}