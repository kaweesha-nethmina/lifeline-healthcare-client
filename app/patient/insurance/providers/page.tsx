"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, Phone, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { PatientService } from "@/lib/services"

interface InsuranceProvider {
  id: number
  name: string
  contact_info: string
  coverage_details: string
  created_at: string
  updated_at: string
}

export default function InsuranceProvidersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<InsuranceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await PatientService.getAllInsuranceProviders()
        if (response.data) {
          setProviders(response.data)
          setFilteredProviders(response.data)
        }
      } catch (err) {
        console.error("Error fetching insurance providers:", err)
        setError("Failed to load insurance providers. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  useEffect(() => {
    // Filter providers based on search query
    const filtered = providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.coverage_details.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProviders(filtered)
  }, [searchQuery, providers])

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Insurance Providers</h1>
            <p className="text-muted-foreground mt-1">Loading insurance providers...</p>
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
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Insurance Providers</h1>
            <p className="text-muted-foreground mt-1">Browse available insurance providers</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 mb-4">
                <Shield className="h-16 w-16 text-red-500/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Providers</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Insurance Providers</h1>
          <p className="text-muted-foreground mt-1">Browse available insurance providers</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by provider name or coverage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.contact_info}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Coverage:</span> {provider.coverage_details}
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Plans
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Providers Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search criteria" : "No insurance providers available at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}