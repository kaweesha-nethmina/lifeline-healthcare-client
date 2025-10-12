"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  FileText, 
  Download, 
  TrendingUp,
  BarChart3,
  UserCheck
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { ReportDetailView } from "@/components/admin/report-detail-view"
import { PDFReportService } from "@/lib/services/pdf-report-service"

interface Report {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  type: string
}

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  // Report data
  const reports: Report[] = [
    {
      id: 1,
      title: "Appointment Statistics",
      description: "Detailed breakdown of appointments by department and status",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      type: "appointments",
    },
    {
      id: 2,
      title: "Doctor Performance",
      description: "Performance metrics and statistics for all doctors",
      icon: <Stethoscope className="h-8 w-8 text-primary" />,
      type: "doctors",
    },
    {
      id: 3,
      title: "User Activity",
      description: "Comprehensive overview of user registrations and activity",
      icon: <Users className="h-8 w-8 text-primary" />,
      type: "users",
    },
    {
      id: 4,
      title: "Medical Records Summary",
      description: "Total records created and updated across all departments",
      icon: <FileText className="h-8 w-8 text-primary" />,
      type: "medical-records",
    },
  ]

  const handleViewReport = (type: string) => {
    setSelectedReport(type)
  }

  const handleBackToReports = () => {
    setSelectedReport(null)
  }

  const handleDownloadPDF = async (title: string) => {
    // This function is now handled within the ReportDetailView component
    // We keep it here for interface compatibility
  }

  if (selectedReport) {
    return (
      <DashboardLayout role="admin">
        <ReportDetailView 
          reportType={selectedReport} 
          onBack={handleBackToReports}
          onDownloadPDF={handleDownloadPDF}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Generate and download system reports</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {report.icon}
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleViewReport(report.type)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}