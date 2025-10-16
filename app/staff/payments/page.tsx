"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StaffService, Payment } from "@/lib/services/staff-service"
import { Search, CreditCard } from "lucide-react"
import { toast } from "sonner"

export default function StaffPaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true)
        // Fetch all payments for staff
        const response = await StaffService.getAllPayments()
        setPayments(response)
        setFilteredPayments(response)
      } catch (error) {
        console.error("Failed to fetch payment history:", error)
        toast.error("Failed to fetch payment history")
        setPayments([])
        setFilteredPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentHistory()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPayments(payments)
    } else {
      const filtered = payments.filter(
        (payment) =>
          payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.patients.users.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPayments(filtered)
    }
  }, [searchQuery, payments])

  const formatPaymentMethod = (method: string) => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
          <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
          <p className="text-muted-foreground">View all patient payments processed by staff</p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, payment method, or patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Payment History List */}
        {filteredPayments.length > 0 ? (
          <div className="grid gap-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{payment.patients.users.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Payment #{payment.id} • {new Date(payment.payment_date).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Patient ID: {payment.patients.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Description: {payment.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">Rs {payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPaymentMethod(payment.payment_method)}
                      </p>
                      <p className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search" : "No payments have been processed yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}