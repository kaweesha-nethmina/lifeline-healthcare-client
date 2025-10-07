"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { CreditCard, FileText, Download, DollarSign, Calendar, CheckCircle, Clock } from "lucide-react"

interface Bill {
  id: string
  invoiceNumber: string
  date: string
  description: string
  amount: number
  status: "paid" | "pending" | "overdue"
  dueDate: string
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiryDate: string
  isDefault: boolean
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const billsResponse = await api.get("/patients/bills")
      setBills(billsResponse.data)

      const methodsResponse = await api.get("/patients/payment-methods")
      setPaymentMethods(methodsResponse.data)
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayBill = async (billId: string) => {
    try {
      await api.post(`/patients/bills/${billId}/pay`)
      alert("Payment processed successfully!")
      fetchBillingData()
    } catch (error) {
      console.error("Payment failed:", error)
      alert("Payment failed. Please try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <Clock className="h-4 w-4" />
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
            <p className="mt-4 text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalOutstanding = bills.filter((b) => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0)

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your medical bills and payment methods</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Unpaid bills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bills.filter((b) => b.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentMethods.length}</div>
              <p className="text-xs text-muted-foreground">Saved cards</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bills" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bills">Bills & Invoices</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>View and pay your medical bills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No bills found</p>
                  ) : (
                    bills.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{bill.invoiceNumber}</p>
                            <Badge variant={getStatusColor(bill.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(bill.status)}
                                {bill.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{bill.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Date: {bill.date}
                            </span>
                            {bill.status !== "paid" && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {bill.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">${bill.amount.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {bill.status !== "paid" && (
                              <Button size="sm" onClick={() => handlePayBill(bill.id)}>
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your saved payment methods</CardDescription>
                  </div>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add New Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No payment methods saved</p>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium capitalize">{method.type}</p>
                              {method.isDefault && <Badge variant="secondary">Default</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">•••• •••• •••• {method.last4}</p>
                            <p className="text-xs text-muted-foreground">Expires {method.expiryDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <Button variant="outline" size="sm">
                              Set as Default
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
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
