// Admin report service for handling admin report-related API calls
import { api } from "@/lib/api"

// Report data interfaces
export interface AdminAppointmentReport {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location: string | null
  created_at: string
  updated_at: string
  patients: {
    id: number
    users: {
      name: string
      email: string
    }
    user_id: number
  }
  doctors: {
    id: number
    users: {
      name: string
      email: string
    }
    user_id: number
  }
}

export interface AppointmentStatistics {
  total: number
  byStatus: Record<string, number>
  monthlyTrends: Record<string, Record<string, number>>
}

export interface DoctorPerformance {
  [key: string]: {
    name: string
    total: number
    byStatus: Record<string, number>
  }
}

export interface UserActivity {
  month: string
  userRegistrations: {
    total: number
    byRole: Record<string, number>
  }
  appointments: {
    total: number
    byStatus: Record<string, number>
  }
  medicalRecords: {
    total: number
  }
  dailyActivity: Record<string, {
    registrations: number
    appointments: number
    medicalRecords: number
  }>
}

export interface MedicalRecordsSummary {
  total: number
  recentRecords: {
    id: number
    diagnosis: string
    treatment_plan: string
    record_date: string
    patients: {
      id: number
      users: {
        name: string
      }
      user_id: number
    }
    doctors: {
      id: number
      users: {
        name: string
      }
      user_id: number
    }
  }[]
  topDiagnoses: {
    diagnosis: string
    count: number
  }[]
}

export class AdminReportService {
  // Get appointment reports
  static async getAppointmentReports(
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<AdminAppointmentReport[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    if (status) params.append("status", status)
    
    const queryString = params.toString() ? `?${params.toString()}` : ""
    const response = await api.get<AdminAppointmentReport[]>(`/admin/reports/appointments${queryString}`)
    
    // Handle both direct response and ApiResponse formats
    if (Array.isArray(response)) {
      return response
    } else if (response && Array.isArray((response as any).data)) {
      return (response as any).data
    }
    return []
  }

  // Get appointment statistics
  static async getAppointmentStatistics(): Promise<AppointmentStatistics> {
    const response = await api.get<AppointmentStatistics>("/admin/reports/appointments/statistics")
    
    // Handle both direct response and ApiResponse formats
    if (response && typeof response === 'object' && 'total' in response) {
      return response as AppointmentStatistics
    } else if (response && typeof response === 'object' && response.data) {
      return response.data as AppointmentStatistics
    }
    throw new Error("Failed to fetch appointment statistics")
  }

  // Get doctor performance
  static async getDoctorPerformance(): Promise<DoctorPerformance> {
    const response = await api.get<DoctorPerformance>("/admin/reports/doctors/performance")
    
    // Handle both direct response and ApiResponse formats
    if (response && typeof response === 'object' && Object.keys(response).length > 0) {
      return response as DoctorPerformance
    } else if (response && typeof response === 'object' && response.data) {
      return response.data as DoctorPerformance
    }
    throw new Error("Failed to fetch doctor performance")
  }

  // Get user activity
  static async getUserActivity(month?: number, year?: number): Promise<UserActivity> {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    
    const queryString = params.toString() ? `?${params.toString()}` : ""
    const response = await api.get<UserActivity>(`/admin/reports/users/activity${queryString}`)
    
    // Handle both direct response and ApiResponse formats
    if (response && typeof response === 'object' && 'month' in response) {
      return response as UserActivity
    } else if (response && typeof response === 'object' && response.data) {
      return response.data as UserActivity
    }
    throw new Error("Failed to fetch user activity")
  }

  // Get medical records summary
  static async getMedicalRecordsSummary(): Promise<MedicalRecordsSummary> {
    const response = await api.get<MedicalRecordsSummary>("/admin/reports/medical-records/summary")
    
    // Handle both direct response and ApiResponse formats
    if (response && typeof response === 'object' && 'total' in response) {
      return response as MedicalRecordsSummary
    } else if (response && typeof response === 'object' && response.data) {
      return response.data as MedicalRecordsSummary
    }
    throw new Error("Failed to fetch medical records summary")
  }
}