// Patient service for handling patient-related API calls
import { api, ApiResponse } from "@/lib/api"

// Patient profile interface
export interface PatientProfile {
  id: number
  user_id: number
  date_of_birth: string
  gender: string
  phone_number: string
  address: string
  insurance_details: string
  medical_history: string
  emergency_contact: string
  created_at: string
  updated_at: string
}

// User interface for nested user data
export interface User {
  name: string
}

// Doctors interface for nested doctors data
export interface Doctors {
  users: User
  user_id: number
  specialty: string
}

// Appointment interface
export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location?: string
  created_at: string
  updated_at: string
  doctors?: Doctors
  doctor_name?: string
  doctor_location?: string
}

// Doctor information in medical records
export interface MedicalRecordDoctor {
  user_id: number
  users?: {
    name: string
  }
}

// Doctor interface
export interface Doctor {
  id: number
  user_id: number
  name: string
  email: string
  profile_picture_url?: string | null
  specialty: string | null
  qualification: string | null
  schedule: string | null
}

// Insurance Provider interface
export interface InsuranceProvider {
  id: number
  name: string
  contact_info: string
  coverage_details: string
  created_at: string
  updated_at: string
}

// Patient medical record interface
export interface PatientMedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at: string
  doctors?: MedicalRecordDoctor
}

// Vital signs interface
export interface VitalSign {
  id: number
  patient_id: number
  nurse_id: number
  vital_signs: string
  recorded_at: string
  created_at: string
  updated_at: string
  users?: {
    name: string
  }
}

export class PatientService {
  // Get patient profile
  static async getProfile(): Promise<ApiResponse<PatientProfile>> {
    return api.get<PatientProfile>("/patients/profile")
  }

  // Update patient profile
  static async updateProfile(data: Partial<PatientProfile>): Promise<ApiResponse<PatientProfile>> {
    return api.put<PatientProfile>("/patients/profile", data)
  }

  // Book appointment
  static async bookAppointment(data: { 
    doctor_id: number; 
    appointment_date: string; 
    customer_name?: string; 
    customer_phone?: string;
    location?: string;
  }): Promise<ApiResponse<Appointment>> {
    return api.post<Appointment>("/patients/appointments", data)
  }

  // Get appointment history
  static async getAppointmentHistory(): Promise<ApiResponse<Appointment[]>> {
    return api.get<Appointment[]>("/patients/appointments")
  }

  // Delete appointment
  static async deleteAppointment(appointmentId: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/patients/appointments/${appointmentId}`)
  }

  // Get medical records
  static async getMedicalRecords(): Promise<ApiResponse<PatientMedicalRecord[]>> {
    return api.get<PatientMedicalRecord[]>("/patients/medical-records")
  }

  // Get vital signs
  static async getVitalSigns(): Promise<ApiResponse<VitalSign[]>> {
    return api.get<VitalSign[]>("/patients/vital-signs")
  }

  // Get all doctors
  static async getAllDoctors(): Promise<ApiResponse<Doctor[]>> {
    return api.get<Doctor[]>("/patients/doctors")
  }

  // Get all insurance providers
  static async getAllInsuranceProviders(): Promise<ApiResponse<InsuranceProvider[]>> {
    return api.get<InsuranceProvider[]>("/patients/insurance-providers")
  }
}