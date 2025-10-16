"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffService, PaymentInfo } from "@/lib/services/staff-service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ConfirmPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [patientData, setPatientData] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Unwrap the params promise
        const resolvedParams = await params;
        
        if (!resolvedParams.id) {
          router.push("/staff/dashboard")
          return
        }
        
        setLoading(true)
        const response = await StaffService.getPatientInfo(parseInt(resolvedParams.id))
        setPatientData(response)
      } catch (error) {
        console.error("Failed to fetch patient data:", error)
        toast.error("Failed to fetch patient data")
        router.push("/staff/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [params, router])

  const handleConfirmPayment = async () => {
    if (!patientData || !amount || !paymentMethod) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      
      // Prepare payment data
      const paymentData: PaymentInfo = {
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        description: description || "Payment for medical services"
      }
      
      await StaffService.confirmPatientPayment(patientData.id, paymentData)
      toast.success("Payment confirmed successfully!")
      router.push("/staff/dashboard")
    } catch (error) {
      console.error("Payment confirmation failed:", error)
      toast.error("Failed to confirm payment")
    } finally {
      setSubmitting(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-foreground">Confirm Patient Payment</h1>
          <p className="text-muted-foreground">Process payment for patient medical services</p>
        </div>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Payment details for {patientData?.users?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Patient Name</Label>
                <p className="text-lg font-medium">{patientData?.users?.name}</p>
              </div>
              <div>
                <Label>Patient ID</Label>
                <p className="text-lg font-medium">{patientData?.id}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-lg font-medium">{patientData?.users?.email}</p>
              </div>
              <div>
                <Label>Phone Number</Label>
                <p className="text-lg font-medium">{patientData?.users?.phone_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter payment description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleConfirmPayment} 
                  disabled={submitting || !amount || !paymentMethod}
                >
                  {submitting ? "Processing..." : "Confirm Payment"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/staff/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}