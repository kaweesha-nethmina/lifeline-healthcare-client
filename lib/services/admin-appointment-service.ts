// Admin appointment service for handling admin appointment-related API calls
import { api } from "@/lib/api"

// Admin appointment interface
export interface AdminAppointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  created_at: string
  updated_at: string
  location: string | null
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

// Detailed admin appointment interface
export interface AdminAppointmentDetail extends AdminAppointment {
  patients: {
    id: number
    users: {
      id: number
      name: string
      role: string
      email: string
      gender: string | null
      address: string | null
      created_at: string
      updated_at: string
      phone_number: string | null
      date_of_birth: string | null
      emergency_contact: string | null
      profile_picture_url: string | null
    }
    gender: string
    address: string
    user_id: number
    phone_number: string
    date_of_birth: string
    medical_history: string
    emergency_contact: string
    insurance_details: string
  }
  doctors: {
    id: number
    users: {
      id: number
      name: string
      role: string
      email: string
      gender: string | null
      address: string | null
      created_at: string
      updated_at: string
      phone_number: string | null
      date_of_birth: string | null
      emergency_contact: string | null
      profile_picture_url: string | null
    }
    user_id: number
    schedule: string
    specialty: string
    qualification: string
  }
}

export class AdminAppointmentService {
  // Get all appointments
  static async getAllAppointments(): Promise<AdminAppointment[]> {
    const response = await api.get<AdminAppointment[]>("/admin/appointments")
    // Handle both direct response and ApiResponse formats
    if (Array.isArray(response)) {
      return response
    } else if (response && Array.isArray((response as any).data)) {
      return (response as any).data
    }
    return []
  }

  // Get appointment by ID
  static async getAppointmentById(id: number): Promise<AdminAppointmentDetail> {
    const response = await api.get<AdminAppointmentDetail>(`/admin/appointments/${id}`)
    // Handle both direct response and ApiResponse formats
    if (response && typeof response === 'object' && 'id' in response) {
      return response as AdminAppointmentDetail
    } else if (response && typeof response === 'object' && response.data) {
      return response.data as AdminAppointmentDetail
    }
    throw new Error("Failed to fetch appointment details")
  }

  // Update appointment status
  static async updateAppointmentStatus(id: number, status: string): Promise<any> {
    const response = await api.put<any>(`/admin/appointments/${id}/status`, { status })
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Delete appointment
  static async deleteAppointment(id: number): Promise<any> {
    const response = await api.delete<any>(`/admin/appointments/${id}`)
    // Handle both direct response and ApiResponse formats
    return response
  }
}