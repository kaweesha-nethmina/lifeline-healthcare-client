// PDF Report service for generating PDF reports
import { 
  AdminReportService,
  AppointmentStatistics,
  DoctorPerformance,
  UserActivity,
  MedicalRecordsSummary
} from "./admin-report-service"

// Dynamically import jsPDF and autoTable
let jsPDF: any;
let autoTable: any;

const initializeJsPDF = async () => {
  if (!jsPDF) {
    const jsPDFModule = await import("jspdf");
    jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    
    // Import autoTable plugin
    const autoTableModule = await import("jspdf-autotable");
    autoTable = autoTableModule.default || autoTableModule;
  }
}

interface ReportParams {
  month?: number
  year?: number
}

export class PDFReportService {
  // Generate PDF report based on report type
  static async generateReportPDF(
    reportType: string,
    title: string,
    params?: ReportParams
  ): Promise<Blob> {
    try {
      // Initialize jsPDF and plugins
      await initializeJsPDF();
      
      // Create jsPDF instance
      const doc = new jsPDF({ orientation: 'portrait' });
      
      // Add title
      doc.setFontSize(22)
      doc.text(title, 105, 20, { align: "center" })
      
      // Add date
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })
      
      // Add content based on report type
      switch (reportType) {
        case "appointments":
          await this.addAppointmentReportContent(doc)
          break
        case "doctors":
          await this.addDoctorReportContent(doc)
          break
        case "users":
          await this.addUserReportContent(doc, params?.month, params?.year)
          break
        case "medical-records":
          await this.addMedicalRecordsReportContent(doc)
          break
      }
      
      // Return as Blob
      return doc.output("blob")
    } catch (error) {
      console.error("Error generating PDF report:", error)
      throw new Error("Failed to generate PDF report")
    }
  }
  
  private static async addAppointmentReportContent(doc: any) {
    try {
      // Fetch appointment statistics
      const stats = await AdminReportService.getAppointmentStatistics()
      
      // Add summary
      doc.setFontSize(16)
      doc.text("Summary", 20, 45)
      
      doc.setFontSize(12)
      doc.text(`Total Appointments: ${stats.total}`, 20, 55)
      doc.text(`Confirmed: ${stats.byStatus.confirmed || 0}`, 20, 65)
      doc.text(`Booked: ${stats.byStatus.booked || 0}`, 20, 75)
      doc.text(`Completed: ${stats.byStatus.completed || 0}`, 20, 85)
      
      // Add appointments by status table
      doc.setFontSize(14)
      doc.text("Appointments by Status", 20, 100)
      
      const statusData = [];
      for (const [status, count] of Object.entries(stats.byStatus)) {
        statusData.push([status, count.toString()]);
      }
      
      autoTable(doc, {
        startY: 105,
        head: [["Status", "Count"]],
        body: statusData,
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      })
    } catch (error) {
      console.error("Error adding appointment report content:", error)
      doc.text("Error loading appointment data", 20, 50)
    }
  }
  
  private static async addDoctorReportContent(doc: any) {
    try {
      // Fetch doctor performance
      const performance = await AdminReportService.getDoctorPerformance()
      
      // Add summary
      doc.setFontSize(16)
      doc.text("Doctor Performance", 20, 45)
      
      let startY = 55
      Object.entries(performance).forEach(([id, doctor], index) => {
        if (startY > 250) {
          doc.addPage()
          startY = 20
        }
        
        doc.setFontSize(14)
        doc.text(`Dr. ${doctor.name}`, 20, startY)
        
        doc.setFontSize(12)
        startY += 10
        doc.text(`Total Appointments: ${doctor.total}`, 25, startY)
        
        startY += 10
        Object.entries(doctor.byStatus).forEach(([status, count]) => {
          doc.text(`${status}: ${count}`, 30, startY)
          startY += 7
        })
        
        startY += 10
      })
    } catch (error) {
      console.error("Error adding doctor report content:", error)
      doc.text("Error loading doctor performance data", 20, 50)
    }
  }
  
  private static async addUserReportContent(doc: any, month?: number, year?: number) {
    try {
      // Fetch user activity with parameters
      const activity = await AdminReportService.getUserActivity(month, year)
      
      // Add summary
      doc.setFontSize(16)
      doc.text("User Activity Summary", 20, 45)
      
      doc.setFontSize(12)
      doc.text(`Month: ${activity.month}`, 20, 55)
      doc.text(`Total Registrations: ${activity.userRegistrations.total}`, 20, 65)
      doc.text(`Total Appointments: ${activity.appointments.total}`, 20, 75)
      doc.text(`Medical Records: ${activity.medicalRecords.total}`, 20, 85)
      
      // Add user registrations by role table
      doc.setFontSize(14)
      doc.text("User Registrations by Role", 20, 100)
      
      const roleData = [];
      for (const [role, count] of Object.entries(activity.userRegistrations.byRole)) {
        roleData.push([role, count.toString()]);
      }
      
      autoTable(doc, {
        startY: 105,
        head: [["Role", "Count"]],
        body: roleData,
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      })
    } catch (error) {
      console.error("Error adding user report content:", error)
      doc.text("Error loading user activity data", 20, 50)
    }
  }
  
  private static async addMedicalRecordsReportContent(doc: any) {
    try {
      // Fetch medical records summary
      const summary = await AdminReportService.getMedicalRecordsSummary()
      
      // Add summary
      doc.setFontSize(16)
      doc.text("Medical Records Summary", 20, 45)
      
      doc.setFontSize(12)
      doc.text(`Total Medical Records: ${summary.total}`, 20, 55)
      
      // Add top diagnoses table
      doc.setFontSize(14)
      doc.text("Top Diagnoses", 20, 70)
      
      const diagnosesData = [];
      for (const diagnosis of summary.topDiagnoses) {
        diagnosesData.push([diagnosis.diagnosis, diagnosis.count.toString()]);
      }
      
      autoTable(doc, {
        startY: 75,
        head: [["Diagnosis", "Count"]],
        body: diagnosesData,
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      })
      
      // Add recent records table
      doc.setFontSize(14)
      const finalY = (doc as any).lastAutoTable?.finalY || 100
      doc.text("Recent Medical Records", 20, finalY + 15)
      
      const recentData = [];
      for (const record of summary.recentRecords) {
        recentData.push([
          record.patients.users.name,
          record.doctors.users.name,
          record.diagnosis,
          new Date(record.record_date).toLocaleDateString()
        ]);
      }
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [["Patient", "Doctor", "Diagnosis", "Date"]],
        body: recentData,
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      })
    } catch (error) {
      console.error("Error adding medical records report content:", error)
      doc.text("Error loading medical records data", 20, 50)
    }
  }
}