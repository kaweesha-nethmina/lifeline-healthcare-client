"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { Shield, FileText, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react"

interface InsurancePolicy {
  id: string
  provider: string
  policyNumber: string
  groupNumber: string
  type: string
  status: "active" | "inactive" | "pending"
  effectiveDate: string
  expiryDate: string
  coverageAmount: number
}

interface Claim {
  id: string
  claimNumber: string
  date: string
  service: string
  provider: string
  amount: number
  coveredAmount: number
  status: "approved" | "pending" | "denied"
  submittedDate: string
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsuranceData()
  }, [])

  const fetchInsuranceData = async () => {
    try {
      setLoading(true)
      const policiesResponse = await api.get("/patients/insurance/policies")
      setPolicies(policiesResponse.data)

      const claimsResponse = await api.get("/patients/insurance/claims")
      setClaims(claimsResponse.data)
    } catch (error) {
      console.error("Failed to fetch insurance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "inactive":
      case "denied":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "inactive":
      case "denied":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading insurance information...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const activePolicies = policies.filter((p) => p.status === "active")
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0)

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insurance</h1>
          <p className="text-muted-foreground">Manage your insurance policies and claims</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePolicies.length}</div>
              <p className="text-xs text-muted-foreground">Current coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCoverage.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Combined limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.filter((c) => c.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="policies">Insurance Policies</TabsTrigger>
            <TabsTrigger value="claims">Claims History</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Insurance Policies</CardTitle>
                    <CardDescription>View and manage your insurance coverage</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No insurance policies found</p>
                  ) : (
                    policies.map((policy) => (
                      <div key={policy.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{policy.provider}</h3>
                              <Badge variant={getStatusColor(policy.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(policy.status)}
                                  {policy.status}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{policy.type} Insurance</p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Policy Number</p>
                            <p className="font-medium">{policy.policyNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Group Number</p>
                            <p className="font-medium">{policy.groupNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Effective Date</p>
                            <p className="font-medium">{policy.effectiveDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Coverage Amount</p>
                            <p className="font-medium">${policy.coverageAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Claims History</CardTitle>
                    <CardDescription>Track your insurance claims</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Claim
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No claims found</p>
                  ) : (
                    claims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{claim.claimNumber}</p>
                            <Badge variant={getStatusColor(claim.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(claim.status)}
                                {claim.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{claim.service}</p>
                          <p className="text-xs text-muted-foreground">
                            Provider: {claim.provider} | Submitted: {claim.submittedDate}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm text-muted-foreground">Claim Amount</p>
                          <p className="text-lg font-bold">${claim.amount.toFixed(2)}</p>
                          <p className="text-xs text-green-600">Covered: ${claim.coveredAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
