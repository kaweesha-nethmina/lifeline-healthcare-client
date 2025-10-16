// Report service for generating and handling reports
import { api } from "@/lib/api"
import { AdminAppointmentService, AdminAppointment } from "./admin-appointment-service"
import { AdminService, AdminUser } from "./admin-service"

// Report types
export type ReportType = "appointments" | "users" | "system"

// Report data interfaces
export interface AppointmentReportData {
  totalAppointments: number
  appointmentsByStatus: Record<string, number>
  appointmentsByDoctor: Record<string, number>
  appointmentsByPatient: Record<string, number>
  recentAppointments: AdminAppointment[]
}

export interface UserReportData {
  totalUsers: number
  usersByRole: Record<string, number>
  recentUsers: AdminUser[]
}

export interface SystemReportData {
  totalAppointments: number
  totalUsers: number
  appointmentsByStatus: Record<string, number>
  usersByRole: Record<string, number>
}

export class ReportService {
  // Generate appointment report data
  static async generateAppointmentReport(): Promise<AppointmentReportData> {
    try {
      const appointments = await AdminAppointmentService.getAllAppointments()
      
      // Calculate statistics
      const totalAppointments = appointments.length
      const appointmentsByStatus: Record<string, number> = {}
      const appointmentsByDoctor: Record<string, number> = {}
      const appointmentsByPatient: Record<string, number> = {}
      
      appointments.forEach(apt => {
        // Count by status
        appointmentsByStatus[apt.status] = (appointmentsByStatus[apt.status] || 0) + 1
        
        // Count by doctor
        const doctorName = apt.doctors.users.name
        appointmentsByDoctor[doctorName] = (appointmentsByDoctor[doctorName] || 0) + 1
        
        // Count by patient
        const patientName = apt.patients.users.name
        appointmentsByPatient[patientName] = (appointmentsByPatient[patientName] || 0) + 1
      })
      
      // Get recent appointments (last 10)
      const recentAppointments = appointments.slice(0, 10)
      
      return {
        totalAppointments,
        appointmentsByStatus,
        appointmentsByDoctor,
        appointmentsByPatient,
        recentAppointments
      }
    } catch (error) {
      console.error("Error generating appointment report:", error)
      throw new Error("Failed to generate appointment report")
    }
  }
  
  // Generate user report data
  static async generateUserReport(): Promise<UserReportData> {
    try {
      const response = await AdminService.getAllUsers()
      
      // Handle both direct array and ApiResponse formats
      let users: AdminUser[] = []
      if (Array.isArray(response)) {
        users = response
      } else if (response && Array.isArray((response as any).data)) {
        users = (response as any).data
      }
      
      // Calculate statistics
      const totalUsers = users.length
      const usersByRole: Record<string, number> = {}
      
      users.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1
      })
      
      // Get recent users (last 10)
      const recentUsers = users.slice(0, 10)
      
      return {
        totalUsers,
        usersByRole,
        recentUsers
      }
    } catch (error) {
      console.error("Error generating user report:", error)
      throw new Error("Failed to generate user report")
    }
  }
  
  // Generate system report data
  static async generateSystemReport(): Promise<SystemReportData> {
    try {
      // Get appointment data
      const appointmentData = await this.generateAppointmentReport()
      
      // Get user data
      const userData = await this.generateUserReport()
      
      return {
        totalAppointments: appointmentData.totalAppointments,
        totalUsers: userData.totalUsers,
        appointmentsByStatus: appointmentData.appointmentsByStatus,
        usersByRole: userData.usersByRole
      }
    } catch (error) {
      console.error("Error generating system report:", error)
      throw new Error("Failed to generate system report")
    }
  }
  
  // Generate PDF report
  static async generatePDFReport(
    type: ReportType, 
    data: AppointmentReportData | UserReportData | SystemReportData
  ): Promise<Blob> {
    try {
      // Dynamically import jsPDF to avoid server-side issues
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");
      
      const doc = new jsPDF() as any;
      
      // Add title
      doc.setFontSize(20)
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 105, 20, { align: "center" })
      
      // Add date
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })
      
      // Add content based on report type
      switch (type) {
        case "appointments":
          this.addAppointmentReportContent(doc, data as AppointmentReportData)
          break
        case "users":
          this.addUserReportContent(doc, data as UserReportData)
          break
        case "system":
          this.addSystemReportContent(doc, data as SystemReportData)
          break
      }
      
      // Return as Blob
      return doc.output("blob")
    } catch (error) {
      console.error("Error generating PDF report:", error)
      throw new Error("Failed to generate PDF report")
    }
  }
  
  private static addAppointmentReportContent(doc: any, data: AppointmentReportData) {
    // Add summary
    doc.setFontSize(16)
    doc.text("Summary", 20, 45)
    
    doc.setFontSize(12)
    doc.text(`Total Appointments: ${data.totalAppointments}`, 20, 55)
    
    // Add appointments by status table
    doc.setFontSize(14)
    doc.text("Appointments by Status", 20, 70)
    
    const statusData = Object.entries(data.appointmentsByStatus).map(([status, count]) => [
      status,
      count.toString()
    ])
    
    doc.autoTable({
      startY: 75,
      head: [["Status", "Count"]],
      body: statusData,
      theme: "striped"
    })
    
    // Add recent appointments table
    doc.setFontSize(14)
    const finalY = doc.lastAutoTable.finalY || 100
    doc.text("Recent Appointments", 20, finalY + 15)
    
    const recentData = data.recentAppointments.map(apt => [
      apt.patients.users.name,
      apt.doctors.users.name,
      new Date(apt.appointment_date).toLocaleDateString(),
      apt.status
    ])
    
    doc.autoTable({
      startY: finalY + 20,
      head: [["Patient", "Doctor", "Date", "Status"]],
      body: recentData,
      theme: "striped"
    })
  }
  
  private static addUserReportContent(doc: any, data: UserReportData) {
    // Add summary
    doc.setFontSize(16)
    doc.text("Summary", 20, 45)
    
    doc.setFontSize(12)
    doc.text(`Total Users: ${data.totalUsers}`, 20, 55)
    
    // Add users by role table
    doc.setFontSize(14)
    doc.text("Users by Role", 20, 70)
    
    const roleData = Object.entries(data.usersByRole).map(([role, count]) => [
      role,
      count.toString()
    ])
    
    doc.autoTable({
      startY: 75,
      head: [["Role", "Count"]],
      body: roleData,
      theme: "striped"
    })
    
    // Add recent users table
    doc.setFontSize(14)
    const finalY = doc.lastAutoTable.finalY || 100
    doc.text("Recent Users", 20, finalY + 15)
    
    const recentData = data.recentUsers.map(user => [
      user.name,
      user.email,
      user.role,
      new Date(user.created_at).toLocaleDateString()
    ])
    
    doc.autoTable({
      startY: finalY + 20,
      head: [["Name", "Email", "Role", "Created"]],
      body: recentData,
      theme: "striped"
    })
  }
  
  private static addSystemReportContent(doc: any, data: SystemReportData) {
    // Add summary
    doc.setFontSize(16)
    doc.text("System Summary", 20, 45)
    
    doc.setFontSize(12)
    doc.text(`Total Appointments: ${data.totalAppointments}`, 20, 55)
    doc.text(`Total Users: ${data.totalUsers}`, 20, 65)
    
    // Add appointments by status table
    doc.setFontSize(14)
    doc.text("Appointments by Status", 20, 80)
    
    const statusData = Object.entries(data.appointmentsByStatus).map(([status, count]) => [
      status,
      count.toString()
    ])
    
    doc.autoTable({
      startY: 85,
      head: [["Status", "Count"]],
      body: statusData,
      theme: "striped"
    })
    
    // Add users by role table
    doc.setFontSize(14)
    const finalY = doc.lastAutoTable.finalY || 110
    doc.text("Users by Role", 20, finalY + 15)
    
    const roleData = Object.entries(data.usersByRole).map(([role, count]) => [
      role,
      count.toString()
    ])
    
    doc.autoTable({
      startY: finalY + 20,
      head: [["Role", "Count"]],
      body: roleData,
      theme: "striped"
    })
  }
}