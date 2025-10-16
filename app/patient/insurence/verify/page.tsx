"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BadgeCheck, User, Hash } from "lucide-react"
import { InsuranceService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function VerifyInsurancePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [eligibilityResult, setEligibilityResult] = useState<any>(null)

  const [formData, setFormData] = useState({
    patientId: user?.id?.toString() || "",
    insuranceProviderId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    setEligibilityResult(null)
    
    try {
      const response = await InsuranceService.verifyEligibility({
        patient_id: parseInt(formData.patientId),
        insurance_provider_id: parseInt(formData.insuranceProviderId),
      })
      
      if (response) {
        setEligibilityResult(response)
        setSuccess(true)
      }
    } catch (err) {
      console.error("Error verifying insurance eligibility:", err)
      setError(err instanceof Error ? err.message : "Failed to verify insurance eligibility. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Verify Insurance Eligibility</h1>
          <p className="text-muted-foreground mt-1">Check if your insurance covers specific treatments</p>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
            <CardDescription>Enter your insurance details to verify eligibility</CardDescription>
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
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify Eligibility"}
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

        {success && eligibilityResult && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5" />
                Eligibility Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> Eligible</p>
                <p><strong>Details:</strong> Coverage verified successfully</p>
                {eligibilityResult.message && <p><strong>Message:</strong> {eligibilityResult.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}