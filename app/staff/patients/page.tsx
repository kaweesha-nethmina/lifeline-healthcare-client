"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StaffService, PatientInfo } from "@/lib/services/staff-service"
import { Search, User, CreditCard } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function StaffPatientsPage() {
  const [patients, setPatients] = useState<PatientInfo[]>([])
  const [filteredPatients, setFilteredPatients] = useState<PatientInfo[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await StaffService.getAllPatients()
        setPatients(response || [])
        setFilteredPatients(response || [])
      } catch (error) {
        console.error("Failed to fetch patients:", error)
        toast.error("Failed to fetch patients")
        setPatients([])
        setFilteredPatients([])
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (patient.users.phone_number && patient.users.phone_number.includes(searchQuery))
      )
      setFilteredPatients(filtered)
    }
  }, [searchQuery, patients])

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
          <h1 className="text-3xl font-bold text-foreground">All Patients</h1>
          <p className="text-muted-foreground">View and manage all patients in the system</p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients List */}
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
                        <h3 className="font-semibold text-lg">{patient.users.name}</h3>
                        <p className="text-sm text-muted-foreground">{patient.users.email}</p>
                        <p className="text-sm text-muted-foreground">{patient.users.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/payments/${patient.id}`}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Process Payment
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/staff/patients/${patient.id}`}>
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
              <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "No patients in the system"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}