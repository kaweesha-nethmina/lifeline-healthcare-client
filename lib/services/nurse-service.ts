// Nurse service for handling nurse-related API calls
import { api, ApiResponse } from "@/lib/api"

// Patient interface
export interface NursePatient {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  address: string | null
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
  user: {
    id: number
    email: string
    name: string
    role: string
    profile_picture_url: string | null
    created_at: string
    updated_at: string
  }
}

// Appointment interface
export interface NurseAppointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: string
  location: string | null
  created_at: string
  updated_at: string
  patient: {
    user: {
      name: string
    }
  }
  doctor: {
    user: {
      name: string
    }
  }
}

// Vitals interface
export interface Vitals {
  id: number
  patient_id: number
  nurse_id: number
  vital_signs: string
  recorded_at: string
  created_at: string
  updated_at: string
}

// Care Record interface
export interface CareRecord {
  id: number
  patient_id: number
  nurse_id: number
  care_details: string
  medication_administered: string
  notes: string
  recorded_at: string
  created_at: string
  updated_at: string
}

// Medical Record interface
export interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  diagnosis: string
  treatment_plan: string
  prescriptions: string
  record_date: string
  updated_at: string
  doctors: {
    users: {
      name: string
    }
    user_id: number
  }
}

// Type guard to check if response has data property
function hasDataProperty<T>(response: ApiResponse<T> | T[]): response is ApiResponse<T> {
  return (response as ApiResponse<T>).data !== undefined
}

export class NurseService {
  // Get all patients
  static async getAllPatients(): Promise<ApiResponse<NursePatient[]> | NursePatient[]> {
    return api.get<NursePatient[]>("/nurses/patients")
  }

  // Get all appointments
  static async getAllAppointments(): Promise<ApiResponse<NurseAppointment[]> | NurseAppointment[]> {
    return api.get<NurseAppointment[]>("/nurses/appointments")
  }

  // Update appointment status
  static async updateAppointmentStatus(
    appointmentId: number,
    status: string
  ): Promise<ApiResponse<NurseAppointment> | NurseAppointment> {
    return api.put<NurseAppointment>(`/nurses/appointments/${appointmentId}/status`, { status })
  }

  // Add vitals for a patient
  static async addVitals(
    patientId: number,
    vital_signs: string
  ): Promise<ApiResponse<Vitals> | Vitals> {
    return api.post<Vitals>(`/nurses/patients/${patientId}/vitals`, { vital_signs })
  }

  // Get patient vitals history
  static async getPatientVitals(patientId: number): Promise<ApiResponse<Vitals[]> | Vitals[]> {
    return api.get<Vitals[]>(`/nurses/patients/${patientId}/vitals`)
  }

  // Get patient medical records
  static async getPatientMedicalRecords(patientId: number): Promise<ApiResponse<MedicalRecord[]> | MedicalRecord[]> {
    return api.get<MedicalRecord[]>(`/nurses/patients/${patientId}/medical-records`)
  }

  // Add care record for a patient
  static async addCareRecord(
    patientId: number,
    data: {
      care_details: string
      medication_administered: string
      notes: string
    }
  ): Promise<ApiResponse<CareRecord> | CareRecord> {
    return api.post<CareRecord>(`/nurses/patients/${patientId}/care-records`, data)
  }

  // Get care records for a patient
  static async getCareRecords(patientId: number): Promise<ApiResponse<CareRecord[]> | CareRecord[]> {
    return api.get<CareRecord[]>(`/nurses/patients/${patientId}/care-records`)
  }

  // Update a care record
  static async updateCareRecord(
    recordId: number,
    data: {
      care_details: string
      medication_administered: string
      notes: string
    }
  ): Promise<ApiResponse<CareRecord> | CareRecord> {
    return api.put<CareRecord>(`/nurses/care-records/${recordId}`, data)
  }

  // Delete a care record
  static async deleteCareRecord(recordId: number): Promise<ApiResponse<void> | void> {
    return api.delete<void>(`/nurses/care-records/${recordId}`)
  }
}