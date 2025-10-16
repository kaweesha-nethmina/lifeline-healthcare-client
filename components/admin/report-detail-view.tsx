"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts"
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  FileText, 
  Download,
  TrendingUp,
  Activity,
  UserCheck
} from "lucide-react"
import { format } from "date-fns"
import { 
  AdminReportService,
  AppointmentStatistics,
  DoctorPerformance,
  UserActivity,
  MedicalRecordsSummary
} from "@/lib/services/admin-report-service"
import { PDFReportService } from "@/lib/services/pdf-report-service"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportDetailViewProps {
  reportType: string
  onBack: () => void
  onDownloadPDF: (title: string) => void
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function ReportDetailView({ reportType, onBack, onDownloadPDF }: ReportDetailViewProps) {
  const [loading, setLoading] = useState(true)
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStatistics | null>(null)
  const [doctorPerformance, setDoctorPerformance] = useState<DoctorPerformance | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [medicalRecordsSummary, setMedicalRecordsSummary] = useState<MedicalRecordsSummary | null>(null)
  
  // User activity report parameters
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        switch (reportType) {
          case "appointments":
            const stats = await AdminReportService.getAppointmentStatistics()
            setAppointmentStats(stats)
            break
          case "doctors":
            const performance = await AdminReportService.getDoctorPerformance()
            setDoctorPerformance(performance)
            break
          case "users":
            const activity = await AdminReportService.getUserActivity(selectedMonth, selectedYear)
            setUserActivity(activity)
            break
          case "medical-records":
            const summary = await AdminReportService.getMedicalRecordsSummary()
            setMedicalRecordsSummary(summary)
            break
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
        toast.error("Failed to fetch report data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [reportType, selectedMonth, selectedYear])

  const getReportTitle = () => {
    switch (reportType) {
      case "appointments":
        return "Appointment Statistics"
      case "doctors":
        return "Doctor Performance"
      case "users":
        return "User Activity"
      case "medical-records":
        return "Medical Records Summary"
      default:
        return "Report"
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const title = getReportTitle()
      // Pass parameters for user activity report
      const params = reportType === "users" ? { month: selectedMonth, year: selectedYear } : undefined
      const pdfBlob = await PDFReportService.generateReportPDF(reportType, title, params)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`${title} PDF downloaded successfully!`)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error("Failed to download PDF report")
    }
  }

  const handleRefreshUserActivity = async () => {
    try {
      setLoading(true)
      const activity = await AdminReportService.getUserActivity(selectedMonth, selectedYear)
      setUserActivity(activity)
      toast.success("User activity report updated!")
    } catch (error) {
      console.error("Error fetching user activity:", error)
      toast.error("Failed to fetch user activity data")
    } finally {
      setLoading(false)
    }
  }

  const prepareStatusData = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({
      name,
      value
    }))
  }

  const prepareDailyActivityData = () => {
    if (!userActivity?.dailyActivity) return []
    
    return Object.entries(userActivity.dailyActivity).map(([date, activity]) => ({
      date: format(new Date(date), "MMM dd"),
      registrations: activity.registrations,
      appointments: activity.appointments,
      medicalRecords: activity.medicalRecords
    }))
  }

  const prepareRoleData = () => {
    if (!userActivity?.userRegistrations?.byRole) return []
    
    return Object.entries(userActivity.userRegistrations.byRole).map(([role, count]) => ({
      name: role,
      value: count
    }))
  }

  const prepareTopDiagnosesData = () => {
    if (!medicalRecordsSummary?.topDiagnoses) return []
    
    return medicalRecordsSummary.topDiagnoses.map((diagnosis, index) => ({
      name: diagnosis.diagnosis,
      value: diagnosis.count
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{getReportTitle()}</h2>
          <p className="text-muted-foreground">
            Detailed report for {format(new Date(), "MMMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to Reports
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {reportType === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Select the month and year for the user activity report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {format(new Date(2020, month - 1), "MMMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleRefreshUserActivity}>Refresh Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "appointments" && appointmentStats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentStats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentStats.byStatus.confirmed || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Booked</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentStats.byStatus.booked || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Status</CardTitle>
                <CardDescription>Distribution of appointments by status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareStatusData(appointmentStats.byStatus)}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                    >
                      {Object.keys(appointmentStats.byStatus).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Appointment trends over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(appointmentStats.monthlyTrends).flatMap(([month, statuses]) => 
                      Object.entries(statuses).map(([status, count]) => ({
                        month,
                        status,
                        count
                      }))
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {reportType === "doctors" && doctorPerformance && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Performance Overview</CardTitle>
              <CardDescription>Performance metrics for all doctors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(doctorPerformance).map(([id, performance]) => (
                  <Card key={id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{performance.name}</CardTitle>
                      <CardDescription>Total Appointments: {performance.total}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(performance.byStatus).map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <span className="text-sm text-muted-foreground capitalize">{status}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Performance Comparison</CardTitle>
              <CardDescription>Comparison of doctor performance by appointment count</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(doctorPerformance).map(([id, performance]) => ({
                    name: performance.name,
                    total: performance.total
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {reportType === "users" && userActivity && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userActivity.userRegistrations.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userActivity.appointments.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userActivity.medicalRecords.total}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registrations by Role</CardTitle>
                <CardDescription>Distribution of new users by role</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareRoleData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                    >
                      {prepareRoleData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trends</CardTitle>
                <CardDescription>Daily activity metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareDailyActivityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registrations" stroke="#0088FE" strokeWidth={2} />
                    <Line type="monotone" dataKey="appointments" stroke="#00C49F" strokeWidth={2} />
                    <Line type="monotone" dataKey="medicalRecords" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {reportType === "medical-records" && medicalRecordsSummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medicalRecordsSummary.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Diagnoses</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medicalRecordsSummary.topDiagnoses.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Diagnoses</CardTitle>
                <CardDescription>Most common diagnoses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareTopDiagnosesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Latest medical records created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecordsSummary.recentRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{record.diagnosis}</h4>
                        <Badge variant="secondary">
                          {format(new Date(record.record_date), "MMM dd, yyyy")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Patient: {record.patients.users.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Doctor: {record.doctors.users.name}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">
                        {record.treatment_plan}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}