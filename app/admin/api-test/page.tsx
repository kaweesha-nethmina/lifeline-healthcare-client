"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AdminService } from "@/lib/services/admin-service"
import { ManagerService } from "@/lib/services/manager-service"
import { toast } from "sonner"

export default function AdminApiTestPage() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAdminApis = async () => {
    setLoading(true)
    try {
      // Test fetching all users
      const usersResponse = await AdminService.getAllUsers()
      
      // Extract user count correctly based on API response structure
      let userCount = 0;
      if (Array.isArray(usersResponse)) {
        // Direct array response
        userCount = usersResponse.length;
      } else if (usersResponse && Array.isArray((usersResponse as any).data)) {
        // ApiResponse with data array
        userCount = (usersResponse as any).data.length;
      }
      
      // Test fetching manager data
      const managerResponse = await ManagerService.getData()
      
      setTestResults({
        users: {
          success: userCount > 0,
          count: userCount,
          error: null
        },
        manager: {
          success: !!managerResponse,
          error: null
        }
      })
      
      toast.success("API tests completed successfully!")
    } catch (error) {
      console.error("API test error:", error)
      toast.error("API test failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admin API Test</h1>
          <p className="text-muted-foreground mt-1">Test admin API endpoints</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Test</CardTitle>
            <CardDescription>Test admin service endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAdminApis} disabled={loading}>
              {loading ? "Testing..." : "Test Admin APIs"}
            </Button>
            
            {testResults && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Users API</h3>
                  <p>Success: {testResults.users.success ? "Yes" : "No"}</p>
                  <p>Count: {testResults.users.count}</p>
                  {testResults.users.error && (
                    <p className="text-destructive">Error: {testResults.users.error}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold">Manager API</h3>
                  <p>Success: {testResults.manager.success ? "Yes" : "No"}</p>
                  {testResults.manager.error && (
                    <p className="text-destructive">Error: {testResults.manager.error}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}