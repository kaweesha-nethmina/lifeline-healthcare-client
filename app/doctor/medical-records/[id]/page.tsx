"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { DoctorService } from "@/lib/services/doctor-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at: string
  patients?: {
    user_id: number
    users?: {
      name: string
    }
  }
}

export default function MedicalRecordDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get('id')
  
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      if (!user || !recordId) {
        if (!recordId) {
          setError("Record ID is required")
        }
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await DoctorService.getMedicalRecordById(Number(recordId))
        let recordData = response && response.data ? response.data : null
        
        if (recordData) {
          setRecord(recordData)
        } else {
          setError("Medical record not found")
        }
      } catch (err: any) {
        console.error("Error fetching medical record:", err)
        setError("Failed to load medical record. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [user, recordId])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleDelete = async () => {
    if (!recordId) return

    const confirmed = window.confirm("Are you sure you want to delete this medical record? This action cannot be undone.")
    if (!confirmed) return

    try {
      await DoctorService.deleteMedicalRecord(Number(recordId))
      router.push("/doctor/medical-records")
    } catch (err: any) {
      console.error("Error deleting medical record:", err)
      alert("Failed to delete medical record. Please try again later.")
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/doctor/medical-records">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Medical Record</h1>
              <p className="text-muted-foreground mt-1">Loading record details...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !record) {
    return (
      <DashboardLayout role="doctor">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/doctor/medical-records">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">Medical Record</h1>
            </div>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Record</h3>
              <p className="text-muted-foreground text-center mb-4">{error || "Medical record not found"}</p>
              <Button asChild>
                <Link href="/doctor/medical-records">Back to Records</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/doctor/medical-records">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-balance">Medical Record</h1>
            <p className="text-muted-foreground mt-1">Detailed view of patient medical record</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/doctor/medical-records/${record.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{record.diagnosis || "Medical Record"}</CardTitle>
                <CardDescription>
                  Patient: {record.patients?.users?.name || "Patient"} (ID: {record.patient_id})
                </CardDescription>
              </div>
              <Badge variant="default">Completed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3">Diagnosis Information</h3>
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
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Record Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Recorded Date</p>
                    <p className="text-base">{formatDate(record.record_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-base">{formatDateTime(record.updated_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Record ID</p>
                    <p className="text-base">#{record.id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button asChild variant="outline">
                <Link href={`/doctor/patients/${record.patient_id}`}>
                  <User className="h-4 w-4 mr-2" />
                  View Patient Profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/doctor/patients/${record.patient_id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  All Records
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}