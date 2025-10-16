"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { Bed, Siren, Stethoscope, Users, AlertCircle } from "lucide-react"

interface Resource {
  id: string
  name: string
  type: string
  total: number
  available: number
  inUse: number
  status: "available" | "limited" | "critical"
}

export default function EmergencyResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await api.get("/emergency/resources")
      setResources(response.data)
    } catch (error) {
      console.error("Failed to fetch resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "limited":
        return "secondary"
      case "critical":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "bed":
        return <Bed className="h-6 w-6" />
      case "ambulance":
        return <Siren className="h-6 w-6" />
      case "equipment":
        return <Stethoscope className="h-6 w-6" />
      case "staff":
        return <Users className="h-6 w-6" />
      default:
        return <AlertCircle className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="emergency">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="emergency">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emergency Resources</h1>
          <p className="text-muted-foreground">Monitor and manage emergency department resources</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((resource) => {
            const utilizationPercent = (resource.inUse / resource.total) * 100

            return (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(resource.type)}
                      <div>
                        <CardTitle>{resource.name}</CardTitle>
                        <CardDescription className="capitalize">{resource.type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(resource.status)}>{resource.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{resource.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{resource.available}</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{resource.inUse}</p>
                      <p className="text-xs text-muted-foreground">In Use</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span className="font-medium">{utilizationPercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={utilizationPercent} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
