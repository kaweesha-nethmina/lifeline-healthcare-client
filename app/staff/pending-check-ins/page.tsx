"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StaffService, PendingCheckIn } from "@/lib/services/staff-service"
import { Search, Calendar, User, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function PendingCheckInsPage() {
  const [pendingCheckIns, setPendingCheckIns] = useState<PendingCheckIn[]>([])
  const [filteredCheckIns, setFilteredCheckIns] = useState<PendingCheckIn[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPendingCheckIns = async () => {
      try {
        setLoading(true)
        const response = await StaffService.getPendingCheckIns()
        setPendingCheckIns(response || [])
        setFilteredCheckIns(response || [])
      } catch (error) {
        console.error("Failed to fetch pending check-ins:", error)
        toast.error("Failed to fetch pending check-ins")
        setPendingCheckIns([])
        setFilteredCheckIns([])
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCheckIns()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCheckIns(pendingCheckIns)
    } else {
      const filtered = pendingCheckIns.filter(
        (checkIn) =>
          checkIn.patients.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          checkIn.doctors.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          checkIn.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCheckIns(filtered)
    }
  }, [searchQuery, pendingCheckIns])

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
          <h1 className="text-3xl font-bold text-foreground">Pending Check-Ins</h1>
          <p className="text-muted-foreground">View patients with confirmed or booked appointments</p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, doctor name, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pending Check-Ins List */}
        {filteredCheckIns.length > 0 ? (
          <div className="grid gap-4">
            {filteredCheckIns.map((checkIn) => (
              <Card key={checkIn.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{checkIn.patients.users.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Appointment with Dr. {checkIn.doctors.users.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(checkIn.appointment_date).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            checkIn.status === "confirmed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {checkIn.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/staff/check-in/${checkIn.patients.id}?patientId=${checkIn.patients.id}&patientName=${checkIn.patients.users.name}`}>
                          Check-In
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
              <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Check-Ins</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "No pending check-ins at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}