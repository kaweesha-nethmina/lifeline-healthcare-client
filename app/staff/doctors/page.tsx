"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StaffService, DoctorInfo } from "@/lib/services/staff-service"
import { Search, Stethoscope } from "lucide-react"
import { toast } from "sonner"

export default function StaffDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorInfo[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const response = await StaffService.getAllDoctors()
        setDoctors(response || [])
        setFilteredDoctors(response || [])
      } catch (error) {
        console.error("Failed to fetch doctors:", error)
        toast.error("Failed to fetch doctors")
        setDoctors([])
        setFilteredDoctors([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors)
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredDoctors(filtered)
    }
  }, [searchQuery, doctors])

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
          <h1 className="text-3xl font-bold text-foreground">All Doctors</h1>
          <p className="text-muted-foreground">View all doctors in the system</p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, email, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Doctors List */}
        {filteredDoctors.length > 0 ? (
          <div className="grid gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Dr. {doctor.users.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.users.email}</p>
                      {doctor.specialty && <p className="text-sm text-muted-foreground">Specialty: {doctor.specialty}</p>}
                      {doctor.qualification && <p className="text-sm text-muted-foreground">Qualification: {doctor.qualification}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Stethoscope className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "No doctors in the system"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}