"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  Search, 
  User, 
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import { NurseService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import type { ApiResponse } from "@/lib/api"

// Interface matching actual API response structure
interface ActualNursePatient {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  address: string | null
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    email: string
    name: string
    role: string
    profile_picture_url: string | null
    created_at: string
    updated_at: string
  }
  users?: {
    name: string
    email: string
  }
}

interface CareRecord {
  id: number
  patient_id: number
  nurse_id: number
  care_details: string | null
  medication_administered: string | null
  notes: string | null
  recorded_at: string
  created_at: string
  updated_at: string
  user?: {
    name: string
  }
  users?: {
    name: string
  }
}

// Type guard to check if response has data property
function isApiResponse<T>(response: T | ApiResponse<T>): response is ApiResponse<T> {
  return (response as ApiResponse<T>).data !== undefined
}

// Type guard to check if object has required properties
function isCareRecord(obj: any): obj is CareRecord {
  return obj && typeof obj === 'object' && 'id' in obj && ('care_details' in obj || 'medication_administered' in obj || 'notes' in obj)
}

export default function NurseCareRecordsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<ActualNursePatient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<ActualNursePatient | null>(null)
  const [careRecords, setCareRecords] = useState<CareRecord[]>([])
  const [newCareRecord, setNewCareRecord] = useState({
    care_details: "",
    medication_administered: "",
    notes: ""
  })
  const [editingRecord, setEditingRecord] = useState<CareRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await NurseService.getAllPatients()
        const patientsData = isApiResponse(response) ? response.data : response
        if (patientsData && Array.isArray(patientsData)) {
          setPatients(patientsData)
        }
      } catch (err) {
        console.error("Error fetching patients:", err)
        setError("Failed to load patients. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [user])

  // Filter patients based on search query
  const filteredPatients = patients.filter(
    (patient) =>
      (patient.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Fetch care records for selected patient
  useEffect(() => {
    const fetchCareRecords = async () => {
      if (!selectedPatient) {
        setCareRecords([])
        return
      }
      
      try {
        const response = await NurseService.getCareRecords(selectedPatient.id)
        const careRecordsData = isApiResponse(response) ? response.data : response
        if (careRecordsData && Array.isArray(careRecordsData)) {
          setCareRecords(careRecordsData)
        }
      } catch (err) {
        console.error("Error fetching care records:", err)
        setError("Failed to load care records. Please try again later.")
      }
    }

    fetchCareRecords()
  }, [selectedPatient])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Handle adding new care record
  const handleAddCareRecord = async () => {
    if (!selectedPatient || 
        (!newCareRecord.care_details.trim() && 
         !newCareRecord.medication_administered.trim() && 
         !newCareRecord.notes.trim())) return
    
    try {
      setSaving(true)
      const response = await NurseService.addCareRecord(selectedPatient.id, newCareRecord)
      const newCareRecordData = isApiResponse(response) ? response.data : response
      
      if (newCareRecordData && isCareRecord(newCareRecordData)) {
        setCareRecords(prev => [newCareRecordData, ...prev])
        setNewCareRecord({
          care_details: "",
          medication_administered: "",
          notes: ""
        })
      }
    } catch (err) {
      console.error("Error adding care record:", err)
      setError("Failed to add care record. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle updating care record
  const handleUpdateCareRecord = async () => {
    if (!editingRecord) return
    
    try {
      setSaving(true)
      const response = await NurseService.updateCareRecord(editingRecord.id, {
        care_details: editingRecord.care_details || "",
        medication_administered: editingRecord.medication_administered || "",
        notes: editingRecord.notes || ""
      })
      const updatedCareRecord = isApiResponse(response) ? response.data : response
      
      if (updatedCareRecord && isCareRecord(updatedCareRecord)) {
        setCareRecords(prev => 
          prev.map(record => 
            record.id === editingRecord.id ? updatedCareRecord : record
          )
        )
        setEditingRecord(null)
      }
    } catch (err) {
      console.error("Error updating care record:", err)
      setError("Failed to update care record. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle deleting care record
  const handleDeleteCareRecord = async (recordId: number) => {
    try {
      await NurseService.deleteCareRecord(recordId)
      setCareRecords(prev => prev.filter(record => record.id !== recordId))
    } catch (err) {
      console.error("Error deleting care record:", err)
      setError("Failed to delete care record. Please try again.")
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Care Records</h1>
            <p className="text-muted-foreground mt-1">Manage patient care records and notes</p>
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
      <DashboardLayout role="nurse">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Care Records</h1>
            <p className="text-muted-foreground mt-1">Manage patient care records and notes</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Care Records</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="nurse">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Care Records</h1>
          <p className="text-muted-foreground mt-1">Manage patient care records and notes</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
                <CardDescription>Choose a patient to manage care records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Patient List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <Button
                        key={patient.id}
                        variant={selectedPatient?.id === patient.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setEditingRecord(null)
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {patient.user?.name || patient.users?.name || "Unknown Patient"}
                      </Button>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No patients found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add/Edit Care Record Form */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingRecord ? "Edit Care Record" : "Add Care Record"}
                  </CardTitle>
                  <CardDescription>
                    {editingRecord 
                      ? "Update care details for " + (selectedPatient.user?.name || selectedPatient.users?.name || "Unknown Patient")
                      : "Record new care details for " + (selectedPatient.user?.name || selectedPatient.users?.name || "Unknown Patient")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Care details"
                      value={editingRecord ? (editingRecord.care_details || "") : newCareRecord.care_details}
                      onChange={(e) => 
                        editingRecord 
                          ? setEditingRecord({...editingRecord, care_details: e.target.value})
                          : setNewCareRecord({...newCareRecord, care_details: e.target.value})
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Medication administered"
                      value={editingRecord ? (editingRecord.medication_administered || "") : newCareRecord.medication_administered}
                      onChange={(e) => 
                        editingRecord 
                          ? setEditingRecord({...editingRecord, medication_administered: e.target.value})
                          : setNewCareRecord({...newCareRecord, medication_administered: e.target.value})
                      }
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Additional notes"
                      value={editingRecord ? (editingRecord.notes || "") : newCareRecord.notes}
                      onChange={(e) => 
                        editingRecord 
                          ? setEditingRecord({...editingRecord, notes: e.target.value})
                          : setNewCareRecord({...newCareRecord, notes: e.target.value})
                      }
                      rows={3}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={editingRecord ? handleUpdateCareRecord : handleAddCareRecord}
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {saving ? (editingRecord ? "Updating..." : "Adding...") : 
                     (editingRecord ? "Update Record" : "Add Record")}
                  </Button>
                  {editingRecord && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setEditingRecord(null)}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Care Records List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedPatient ? `${selectedPatient.user?.name || selectedPatient.users?.name || "Unknown Patient"}'s Care Records` : "Care Records"}
                </CardTitle>
                <CardDescription>
                  {selectedPatient 
                    ? "Previous care records for this patient" 
                    : "Select a patient to view care records"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  careRecords.length > 0 ? (
                    <div className="space-y-4">
                      {careRecords.map((record) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {record.care_details && (
                                <p className="font-medium mb-2">{record.care_details}</p>
                              )}
                              {record.medication_administered && (
                                <p className="text-sm mb-2">
                                  <span className="font-medium">Medication:</span> {record.medication_administered}
                                </p>
                              )}
                              {record.notes && (
                                <p className="text-sm mb-2">
                                  <span className="font-medium">Notes:</span> {record.notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Recorded on {formatDate(record.recorded_at)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRecord(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCareRecord(record.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Care Records</h3>
                      <p className="text-muted-foreground text-center">
                        No care records have been created for {selectedPatient.user?.name || selectedPatient.users?.name || "this patient"} yet
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Patient</h3>
                    <p className="text-muted-foreground text-center">
                      Choose a patient from the list to view their care records
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}