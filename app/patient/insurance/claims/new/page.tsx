"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, User, Hash } from "lucide-react"
import { InsuranceService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function ProcessInsuranceClaimPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    patientId: user?.id?.toString() || "",
    insuranceProviderId: "",
    claimAmount: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await InsuranceService.processClaim({
        patient_id: parseInt(formData.patientId),
        insurance_provider_id: parseInt(formData.insuranceProviderId),
        claim_amount: parseFloat(formData.claimAmount),
      })
      
      if (response) {
        setSuccess(true)
        // Reset form
        setFormData({
          patientId: user?.id?.toString() || "",
          insuranceProviderId: "",
          claimAmount: "",
        })
        
        // Redirect to insurance page after 2 seconds
        setTimeout(() => {
          router.push("/patient/insurance")
        }, 2000)
      }
    } catch (err) {
      console.error("Error processing insurance claim:", err)
      setError(err instanceof Error ? err.message : "Failed to process insurance claim. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Process Insurance Claim</h1>
          <p className="text-muted-foreground mt-1">Submit a new insurance claim for your treatment</p>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800">Insurance claim processed successfully!</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
            <CardDescription>Enter the details for your insurance claim</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patientId"
                    type="number"
                    placeholder="Enter patient ID"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="pl-10"
                    required
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceProviderId">Insurance Provider ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="insuranceProviderId"
                    type="number"
                    placeholder="Enter insurance provider ID"
                    value={formData.insuranceProviderId}
                    onChange={(e) => setFormData({ ...formData, insuranceProviderId: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="claimAmount">Claim Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="claimAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter claim amount"
                    value={formData.claimAmount}
                    onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Process Claim"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/patient/insurance")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}