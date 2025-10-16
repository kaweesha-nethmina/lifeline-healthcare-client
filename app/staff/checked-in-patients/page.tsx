"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StaffService, CheckedInPatient } from "@/lib/services/staff-service"
import { Search, User, Clock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CheckedInPatientsPage() {
  const [checkedInPatients, setCheckedInPatients] = useState<CheckedInPatient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<CheckedInPatient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCheckedInPatients = async () => {
      try {
        setLoading(true)
        const response = await StaffService.getCheckedInPatients()
        setCheckedInPatients(response || [])
        setFilteredPatients(response || [])
      } catch (error) {
        console.error("Failed to fetch checked-in patients:", error)
        toast.error("Failed to fetch checked-in patients")
        setCheckedInPatients([])
        setFilteredPatients([])
      } finally {
        setLoading(false)
      }
    }

    fetchCheckedInPatients()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(checkedInPatients)
    } else {
      const filtered = checkedInPatients.filter(
        (patient) =>
          patient.patients.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.reason_for_visit.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPatients(filtered)
    }
  }, [searchQuery, checkedInPatients])

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checked-In Patients</h1>
          <p className="text-muted-foreground">View patients who have been checked in</p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, department, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Checked-In Patients List */}
        {filteredPatients.length > 0 ? (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{patient.patients.users.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Checked in: {new Date(patient.check_in_time).toLocaleString()}
                        </p>
                        {patient.department && (
                          <p className="text-sm text-muted-foreground">Department: {patient.department}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Reason: {patient.reason_for_visit}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/staff/patients/${patient.patients.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Checked-In Patients</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "No patients have been checked in yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}