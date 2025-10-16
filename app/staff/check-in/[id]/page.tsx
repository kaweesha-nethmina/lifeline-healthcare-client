"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffService, PatientInfo, CheckInRecord, CheckInInfo } from "@/lib/services/staff-service"
import { PaymentService, Payment } from "@/lib/services/payment-service"
import { Search, CheckCircle, CreditCard, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function CheckInPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [patientData, setPatientData] = useState<PatientInfo | null>(null)
  const [checkInTime, setCheckInTime] = useState("")
  const [department, setDepartment] = useState("")
  const [reasonForVisit, setReasonForVisit] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [description, setDescription] = useState("")
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patientData && patientData.id) {
      fetchPaymentHistory(patientData.id)
    }
  }, [patientData])

  const fetchPaymentHistory = async (patientId: number) => {
    try {
      const response = await PaymentService.getPaymentHistory(patientId)
      setPaymentHistory(response.data || [])
    } catch (error) {
      console.error("Failed to fetch payment history:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      // Try to parse the search query as an ID first
      const patientId = parseInt(searchQuery);
      if (!isNaN(patientId)) {
        // If it's a valid ID, fetch the patient directly
        const response = await StaffService.getPatientInfo(patientId)
        setPatientData(response)
      } else {
        // If it's not an ID, we would need a search endpoint
        // For now, we'll just show an error since there's no search endpoint
        toast.error("Please enter a valid patient ID")
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast.error("Failed to search patient")
      setPatientData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteCheckInAndPayment = async () => {
    if (!patientData) return

    // Validate required fields
    if (!checkInTime || !department || !reasonForVisit) {
      toast.error("Please fill in all required check-in fields (Check-in Time, Department, Reason for Visit)")
      return
    }

    if (!amount || !paymentMethod) {
      toast.error("Please fill in all required payment fields (Amount, Payment Method)")
      return
    }

    // Validate amount is a positive number
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid positive amount")
      return
    }

    try {
      setLoading(true)
      
      // Step 1: Perform check-in
      const checkInData: CheckInInfo = {
        check_in_time: checkInTime,
        department: department,
        reason_for_visit: reasonForVisit
      }
      
      console.log("Sending check-in data:", checkInData);
      console.log("Patient ID:", patientData.id);
      
      // Validate datetime format
      if (checkInData.check_in_time) {
        const date = new Date(checkInData.check_in_time);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format");
        }
        // Ensure we're sending in ISO format
        checkInData.check_in_time = date.toISOString();
      }
      
      const checkInResult = await StaffService.checkInPatient(patientData.id, checkInData)
      console.log("Check-in result:", checkInResult);
      
      // Step 2: Process payment
      const paymentData = {
        patient_id: patientData.id,
        amount: amountValue,
        payment_method: paymentMethod,
        description: description || "Consultation fee"
      }
      
      console.log("Sending payment data:", paymentData);
      
      const paymentResult = await PaymentService.processPayment(paymentData)
      console.log("Payment result:", paymentResult);
      
      // Show success message
      toast.success("Patient successfully checked in and payment processed!")
      
      // Navigate to checked-in patients page
      router.push("/staff/checked-in-patients")
      
    } catch (error: any) {
      console.error("Check-in and payment failed:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Try to get more detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        console.error("Response headers:", error.response.headers)
      }
      
      // Check if it's a network error
      if (error.message && error.message.includes("Network error")) {
        toast.error("Network error: Please check your connection and try again")
      } else {
        toast.error(`Failed to complete check-in and payment: ${error.message || "Unknown error"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Check-in</h1>
          <p className="text-muted-foreground">Search and check in patients for their appointments</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Patient</CardTitle>
            <CardDescription>Enter patient ID to search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        {patientData && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Verify patient details before check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-lg font-medium">{patientData.users?.name}</p>
                  </div>
                  <div>
                    <Label>Patient ID</Label>
                    <p className="text-lg font-medium">{patientData.id}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg font-medium">{patientData.users?.email}</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <p className="text-lg font-medium">{patientData.users?.phone_number || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <p className="text-lg font-medium">{patientData.users?.date_of_birth || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-lg font-medium">{patientData.users?.gender || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <p className="text-lg font-medium">{patientData.users?.address || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Emergency Contact</Label>
                    <p className="text-lg font-medium">{patientData.users?.emergency_contact || "N/A"}</p>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                  <div>
                    <Label>Insurance Details</Label>
                    <p className="text-lg font-medium">{patientData.insurance_details || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Medical History</Label>
                    <p className="text-lg font-medium">{patientData.medical_history || "N/A"}</p>
                  </div>
                </div>

                {/* Previous Check-ins */}
                {patientData.check_ins && patientData.check_ins.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Previous Check-ins</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {patientData.check_ins.map((checkIn: CheckInRecord) => (
                        <div key={checkIn.id} className="border rounded p-2">
                          <p className="font-medium">
                            {new Date(checkIn.check_in_time).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            Department: {checkIn.department}
                          </p>
                          <p className="text-sm">
                            Reason: {checkIn.reason_for_visit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time *</Label>
                    <Input
                      id="checkInTime"
                      type="datetime-local"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={department} onValueChange={setDepartment} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                  <Textarea
                    id="reasonForVisit"
                    placeholder="Enter reason for visit..."
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {/* Payment Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">Rs</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          step="0.01"
                          min="0"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
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

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter payment description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Single Button for Check-in and Payment */}
                <Button 
                  onClick={handleCompleteCheckInAndPayment} 
                  disabled={loading || !checkInTime || !department || !reasonForVisit || !amount || !paymentMethod}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : "Complete Check-in and Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {patientData && paymentHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Previous payments for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <p className="font-medium">Amount</p>
                        <p>Rs {payment.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Method</p>
                        <p className="capitalize">{payment.payment_method.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="font-medium">Date</p>
                        <p>{new Date(payment.payment_date).toLocaleDateString()}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="font-medium">Status</p>
                        <p className="capitalize">{payment.payment_status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}