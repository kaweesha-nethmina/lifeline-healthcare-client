"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { AlertTriangle, Activity, Users, Clock, Phone, MapPin } from "lucide-react"

interface EmergencyStats {
  activeEmergencies: number
  criticalCases: number
  availableBeds: number
  responseTime: string
}

interface EmergencyCase {
  id: string
  patientName: string
  age: number
  condition: string
  severity: "critical" | "high" | "medium" | "low"
  arrivalTime: string
  location: string
  status: string
}

export default function EmergencyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<EmergencyStats>({
    activeEmergencies: 0,
    criticalCases: 0,
    availableBeds: 0,
    responseTime: "0 min",
  })
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const statsResponse = await api.get("/emergency/stats")
      setStats(statsResponse.data)

      const casesResponse = await api.get("/emergency/cases/active")
      setEmergencyCases(casesResponse.data)
    } catch (error) {
      console.error("Failed to fetch emergency data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="emergency">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading emergency dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="emergency">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emergency Services</h1>
            <p className="text-muted-foreground">Real-time emergency case monitoring</p>
          </div>
          <Button variant="destructive" size="lg">
            <Phone className="h-4 w-4 mr-2" />
            Emergency Call
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.activeEmergencies}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.criticalCases}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableBeds}</div>
              <p className="text-xs text-muted-foreground">Emergency department</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Emergency Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Active Emergency Cases</CardTitle>
            <CardDescription>Real-time monitoring of emergency situations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyCases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active emergency cases</p>
              ) : (
                emergencyCases.map((emergencyCase) => (
                  <div
                    key={emergencyCase.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{emergencyCase.patientName}</p>
                        <Badge variant={getSeverityColor(emergencyCase.severity)}>
                          {emergencyCase.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{emergencyCase.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Age: {emergencyCase.age} | Condition: {emergencyCase.condition}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Arrived: {emergencyCase.arrivalTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {emergencyCase.location}
                        </span>
                      </div>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-20 bg-transparent">
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">New Emergency</p>
                </div>
              </Button>
              <Button variant="outline" className="h-20 bg-transparent">
                <div className="text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Triage Assessment</p>
                </div>
              </Button>
              <Button variant="outline" className="h-20 bg-transparent">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Bed Management</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
